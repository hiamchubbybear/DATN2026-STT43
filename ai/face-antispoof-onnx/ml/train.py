"""
Scam detection model training script.

Generates synthetic training data based on known scam behavioral patterns,
trains an XGBoost classifier, evaluates it, and saves the model to
models/scam_model.pkl.

Usage:
    python -m ml.train               # from the face-antispoof-onnx/ root
    python ml/train.py               # equivalent

The script is also called automatically during Docker build.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    average_precision_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from xgboost import XGBClassifier

# Allow running as script or module
sys.path.insert(0, str(Path(__file__).parent.parent))
from ml.features import FEATURE_NAMES

MODELS_DIR = Path(__file__).parent.parent / "models"
OUTPUT_PATH = MODELS_DIR / "scam_model.pkl"
METRICS_PATH = MODELS_DIR / "scam_model_metrics.json"

RANDOM_SEED = 42
N_SAMPLES = 12_000
SCAM_RATIO = 0.30   # 30 % scam, 70 % legit


# ── Synthetic Data Generation ─────────────────────────────────────────────────

def _clip(arr: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return np.clip(arr, lo, hi)


def _add_noise(arr: np.ndarray, rng: np.random.Generator, scale: float) -> np.ndarray:
    """Add Gaussian noise to a continuous feature array."""
    return arr + rng.normal(0, scale, arr.shape)


def generate_legit(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """Simulate realistic dating-app users — including power users who
    naturally look suspicious on individual features.

    Key sources of overlap with scam accounts:
      - Power users swipe 60-150/h (overlaps with moderate bots)
      - ~25% include Instagram/Snapchat in bio (looks like bio_contact)
      - New users have low profile completeness
      - False reports from rejected matches inflate reportCount
    """
    # Power users swipe a LOT — creates heavy overlap with bots
    swipes = _clip(_add_noise(rng.exponential(22, n), rng, 18), 0, 200)
    # Occasionally shares links (party invites, social profiles)
    spam = rng.poisson(0.5, n).astype(float)
    # False reports from rejected matches
    reports = rng.poisson(0.7, n).astype(float)
    # New users start incomplete; skewed toward higher completeness
    completeness = _clip(rng.beta(3, 2, n), 0, 1)
    # 92% have photos, 8% are new and haven't uploaded yet
    has_photo = rng.choice([0, 1], n, p=[0.08, 0.92]).astype(float)
    # Verification is optional — only 55% have done it
    is_verified = rng.choice([0, 1], n, p=[0.45, 0.55]).astype(float)
    # 25% put their IG/Snap handle — overlaps with scam bio pattern
    bio_contact = rng.choice([0, 1], n, p=[0.75, 0.25]).astype(float)
    return pd.DataFrame({
        "swipesPerHour":       swipes,
        "spamLinkCount":       spam,
        "reportCount":         reports,
        "profileCompleteness": completeness,
        "hasProfilePhoto":     has_photo,
        "isFaceVerified":      is_verified,
        "bioHasContact":       bio_contact,
        "label": np.zeros(n, dtype=int),
    })


def generate_scam(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """Simulate scam / bot accounts — including sophisticated scammers
    who deliberately mimic legit-user behavior.

    Sub-types:
      - Naive bots      : still somewhat detectable (high swipes, sparse profile)
      - Romance scammers: carefully crafted profiles to avoid detection
      - Spam accounts   : moderate behavior to avoid easy rule triggers
    """
    n_bot     = n // 3
    n_romance = n // 3
    n_spam    = n - n_bot - n_romance

    # --- Naive bots: moderate signal, lots of overlap with power users ---
    bot_swipes = _clip(_add_noise(rng.uniform(30, 130, n_bot), rng, 20), 0, 250)
    bots = pd.DataFrame({
        "swipesPerHour":       bot_swipes,
        "spamLinkCount":       rng.poisson(1.5, n_bot).astype(float),
        "reportCount":         rng.poisson(1.8, n_bot).astype(float),
        # Incomplete profiles but not empty — overlaps with new legit users
        "profileCompleteness": _clip(rng.beta(2, 4, n_bot), 0, 1),
        "hasProfilePhoto":     rng.choice([0, 1], n_bot, p=[0.25, 0.75]).astype(float),
        "isFaceVerified":      rng.choice([0, 1], n_bot, p=[0.78, 0.22]).astype(float),
        "bioHasContact":       rng.choice([0, 1], n_bot, p=[0.42, 0.58]).astype(float),
        "label": np.ones(n_bot, dtype=int),
    })

    # --- Romance scammers: look almost identical to legit users ---
    # They invest time in their profiles and behave moderately to avoid detection
    rom_swipes = _clip(_add_noise(rng.uniform(8, 55, n_romance), rng, 12), 0, 120)
    romance = pd.DataFrame({
        "swipesPerHour":       rom_swipes,
        "spamLinkCount":       rng.poisson(1.0, n_romance).astype(float),
        "reportCount":         rng.poisson(2.0, n_romance).astype(float),
        # High completeness — they want to look trustworthy
        "profileCompleteness": _clip(rng.beta(4, 2, n_romance), 0, 1),
        "hasProfilePhoto":     rng.choice([0, 1], n_romance, p=[0.08, 0.92]).astype(float),
        "isFaceVerified":      rng.choice([0, 1], n_romance, p=[0.72, 0.28]).astype(float),
        # Key signal: they push off-platform contact early
        "bioHasContact":       rng.choice([0, 1], n_romance, p=[0.28, 0.72]).astype(float),
        "label": np.ones(n_romance, dtype=int),
    })

    # --- Spam accounts: intentionally moderate to evade rules ---
    spam_swipes = _clip(_add_noise(rng.uniform(15, 90, n_spam), rng, 18), 0, 200)
    spam = pd.DataFrame({
        "swipesPerHour":       spam_swipes,
        "spamLinkCount":       rng.poisson(2.5, n_spam).astype(float),
        "reportCount":         rng.poisson(1.8, n_spam).astype(float),
        "profileCompleteness": _clip(rng.beta(2, 3, n_spam), 0, 1),
        "hasProfilePhoto":     rng.choice([0, 1], n_spam, p=[0.18, 0.82]).astype(float),
        "isFaceVerified":      rng.choice([0, 1], n_spam, p=[0.85, 0.15]).astype(float),
        "bioHasContact":       rng.choice([0, 1], n_spam, p=[0.35, 0.65]).astype(float),
        "label": np.ones(n_spam, dtype=int),
    })

    return pd.concat([bots, romance, spam], ignore_index=True)


def generate_dataset(n: int = N_SAMPLES, scam_ratio: float = SCAM_RATIO, seed: int = RANDOM_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    n_scam = int(n * scam_ratio)
    n_legit = n - n_scam

    legit = generate_legit(n_legit, rng)
    scam  = generate_scam(n_scam, rng)

    df = pd.concat([legit, scam], ignore_index=True)
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)

    # ── Label noise (12 %) ────────────────────────────────────────────────────
    # Real-world scam data is noisy:
    #   - Legit users falsely reported and labelled scam
    #   - Scammers who slipped through human review labelled legit
    noise_mask = rng.random(len(df)) < 0.08
    df.loc[noise_mask, "label"] = 1 - df.loc[noise_mask, "label"]

    return df


# ── Training ──────────────────────────────────────────────────────────────────

def train(df: pd.DataFrame) -> tuple[XGBClassifier, dict]:
    X = df[FEATURE_NAMES].values.astype(np.float32)
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    n_neg = int((y_train == 0).sum())
    n_pos = int((y_train == 1).sum())
    scale_pos = n_neg / max(n_pos, 1)

    model = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        scale_pos_weight=scale_pos,
        eval_metric="logloss",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    # ── Evaluation ────────────────────────────────────────────────
    y_prob = model.predict_proba(X_test)[:, 1]
    y_pred = (y_prob >= 0.5).astype(int)

    auc = roc_auc_score(y_test, y_prob)
    ap  = average_precision_score(y_test, y_prob)
    report = classification_report(y_test, y_pred, output_dict=True)

    print("\n-- Scam Model Training Results --------------------------")
    print(f"  ROC-AUC            : {auc:.4f}")
    print(f"  Average Precision  : {ap:.4f}")
    print(f"  Accuracy           : {report['accuracy']:.4f}")
    print(f"  Precision (scam)   : {report['1']['precision']:.4f}")
    print(f"  Recall (scam)      : {report['1']['recall']:.4f}")
    print(f"  F1 (scam)          : {report['1']['f1-score']:.4f}")
    print("---------------------------------------------------------\n")

    # Cross-validation AUC for confidence
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    cv_aucs = cross_val_score(model, X, y, cv=cv, scoring="roc_auc", n_jobs=-1)
    print(f"  CV ROC-AUC (5-fold): {cv_aucs.mean():.4f} +/- {cv_aucs.std():.4f}\n")

    # Feature importances
    importances = dict(zip(FEATURE_NAMES, model.feature_importances_.tolist()))
    top = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
    print("  Top-5 features:")
    for name, imp in top:
        print(f"    {name:<25} {imp:.4f}")
    print()

    metrics = {
        "roc_auc": round(auc, 4),
        "average_precision": round(ap, 4),
        "accuracy": round(report["accuracy"], 4),
        "precision_scam": round(report["1"]["precision"], 4),
        "recall_scam": round(report["1"]["recall"], 4),
        "f1_scam": round(report["1"]["f1-score"], 4),
        "cv_auc_mean": round(float(cv_aucs.mean()), 4),
        "cv_auc_std": round(float(cv_aucs.std()), 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "feature_importances": importances,
    }

    return model, metrics


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Generating {N_SAMPLES:,} synthetic samples ({int(SCAM_RATIO*100)}% scam)...")
    df = generate_dataset()
    print(f"  Legit : {(df.label==0).sum():,}")
    print(f"  Scam  : {(df.label==1).sum():,}\n")

    print("Training XGBoost scam detector...")
    model, metrics = train(df)

    # Save model
    joblib.dump(model, OUTPUT_PATH)
    print(f"Model saved -> {OUTPUT_PATH}")

    # Save metrics
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved -> {METRICS_PATH}")

    if metrics["roc_auc"] < 0.90:
        print("WARNING: ROC-AUC is below 0.90 -- consider adding more feature signal.", file=sys.stderr)


if __name__ == "__main__":
    main()
