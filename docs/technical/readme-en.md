# Matchmaking & Scam Detection System

## Build & Server Status

- Backend API build: passing.
- Server status: ![Server Status](https://img.shields.io/endpoint?url=https://datn.chessy.dev/health&logo=statuspage&logoColor=white&cacheSeconds=60)

## API & Server Status
- **Base URL**: `https://datn.chessy.dev`
- **Health Check**: [https://datn.chessy.dev/health](https://datn.chessy.dev/health)
- **API Documentation**: Detailed endpoint plans found in [API_PLAN.md](API_PLAN.md)

## Table of Contents

- [Overview](#overview)
- [Team & Roles](#team--roles)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Rules](#repository-rules)
  - [Branch strategy](#branch-strategy)
  - [Commit convention](#commit-convention)
  - [Pull Request](#pull-request)
  - [Milestones](#milestones)
  - [Issues](#issues)
  - [Branch protection](#branch-protection)
  - [Release process](#release-process)
  - [Sample workflow](#sample-workflow)
- [Folder structure](#folder-structure)

## Overview

Building a matchmaking platform augmented with machine-learning-powered scam detection. The stack ties React/React Native frontends to an ASP.NET Core 8 API, WebSocket real-time layer, AI services (FastAPI + XGBoost + Sentence Transformers), and a call system that leverages WebRTC, STUN, and Coturn TURN servers.

## Main Features

### For Users
- **Multi-factor Authentication**: Traditional registration/login, OAuth (Google), Password Reset, and Email Verification.
- **Profiles & Photos**: Manage personal info, preferences, location, and photo galleries.
- **Account Verification**: Identity verification via FaceID, Phone, and ID to increase trust.
- **Discovery & Recommendations**: Suggest users based on shared interests and proximity.
- **Swipe & Match**: Classic left/right swipe mechanism with instant Match notifications.
- **Real-time Chat**: Text messaging and conversation management over WebSockets.
- **Audio/Video Calls**: Secure calling integrated via WebRTC (STUN/TURN) protocols.
- **Safety & Security**: Safe-mode, emergency location sharing, and Date Check-ins.

### For Admins
- **Content Flagging System**: Automated flagging for violating content (messages, photos, profiles).
- **Trust Score**: AI/ML-driven reputation scoring for proactive fraud detection.
- **User Moderation**: Tools for Banning, Shadow-banning, accounts suspension, and forced logouts.
- **Analytics Dashboard**: Track Daily Active Users (DAU), match rates, fraud reports, and behavioral trends.
- **System Maintenance**: Tools for data reindexing, cache management, and ML model updates.

## API Endpoints List

### Phase 1: Foundation (Auth & Profile)
- `POST /api/auth/*`: Registration, Login, OAuth, and Session Management.
- `GET/PATCH /api/users/me/*`: Profile, photo, and preference management.
- `POST /api/verification/*`: Face, Phone, and ID verification.

### Phase 2: Dating Core (Swipe & Chat)
- `GET /api/discovery/*`: Recommendation lists and detailed profile views.
- `POST /api/swipes/*`: Swipe actions (Like/Pass) and Undo.
- `GET/POST /api/chat/*`: Real-time messaging and conversation management.
- `POST /api/calls/*`: WebRTC call initialization and handling.

### Phase 3: Safety & Administration
- `POST /api/flags/*`: Content and user flagging.
- `GET /api/trust/*`: Access ML-calculated trust scores and user classification.
- `GET/POST /api/admin/*`: Privilege APIs for Dashboard, Moderation, and Analytics.
- `GET /api/system/health`: System status monitoring (Health Check).

##  Coming Soon
- **Admin Dashboard**: Full-featured management UI for system administrators.
- **Server Health Dashboard**: Real-time cluster metrics monitoring and visualization.
- **Mobile Application**: Dedicated iOS and Android apps for mobile users.

## Team & Roles

| Student ID  | Full Name            | Email                          | Role             |
| ----------- | -------------------- | ------------------------------ | ---------------- |
| 28209051610 | [Chu Phương Anh](https://github.com/Chuuuu21) | chuphuonganh21082004@gmail.com | Frontend         |
| 28211153072 | [Phan Công Danh](https://github.com/CongDanh06) | cdanh1324@gmail.com            | Backend          |
| 28211152835 | [Trần Huy](https://github.com/huynartLZ) | tranhuy142004@gmail.com        | Backend / Leader |
| 28211152784 | [Phùng Định Quang Huy](https://github.com/HawkPoseidon) | huyphung00@gmail.com           | Machine Learning |
| 28211152835 | [Trần Văn Huy](https://github.com/hiamchubbybear) | tranvanhuy160304@gmail.com     | System / DevOps  |

## Tech Stack

- Frontend: ReactJS + React Native, TypeScript, TailwindCSS, WebSocket real-time communication.
- Backend: ASP.NET Core 8, FluentValidation, JWT Authentication, WebSocket Server.
- Database: MongoDB.
- Cache: Redis.
- AI/ML: Python + FastAPI, XGBoost, Sentence Transformers.
- Call System: WebRTC + STUN + Coturn (TURN).
- DevOps: Docker, Nginx, Vercel (frontend hosting), VPS deployment (API + call servers).

## Architecture

Client (Web / Mobile) → Frontend (React / React Native) → Backend API (ASP.NET Core)
↓ MongoDB · Redis · AI (FastAPI + XGBoost + Sentence Transformers)
Realtime layer: WebSocket (api + call)
Call system: WebRTC plus STUN/TURN via Coturn.

## Repository Rules

### Branch strategy

- GitFlow: `main` (production, no direct commits), `develop`, `feature/*`, `release/*`, `hotfix/*`.
- Example branches: `feature/authentication`, `release/v0.1.0`.

### Commit convention

- Conventional Commit: `<type>(<scope>): <message>`.
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- Example: `feat(auth): implement user login API`.

### Pull Request

- Open PR from a feature branch into `develop`, describe changes, include checklist (build, review, conflict).
- Suggested template: Description / Related Issue / Changes / Checklist.

### Milestones

- v0.1.0: User authentication + profile
- v0.2.0: Swipe system
- v0.3.0: Recommendation engine
- v0.4.0: Scam detection ML
- v1.0.0: Production release

### Issues

- Every feature ships with an issue before implementation; assign milestone and owner.

### Branch protection

- `main`: requires PR, code review, CI pass.
- `develop`: requires CI pass.

### Release process

- After milestone completion: `develop → release/vX.X.X` → test → merge `release → main` → tag `vX.X.X`.

### Sample workflow

1. Create issue `#45 Build swipe API` (milestone v0.2.0).
2. Branch: `git checkout develop` → `git checkout -b feature/swipe-api`.
3. Commit: `feat(swipe): implement swipe API`.
4. Push: `git push origin feature/swipe-api`.
5. Open PR `feature/swipe-api → develop`.

## Folder structure

```
repo
├── .github
├── k8s
├── backend
│   ├── web
│   ├── infrash
│   ├── domain
│   └── application
├── frontend
│   ├── mobile
│   └── web
├── ai
├── docs
└── README.md
```
