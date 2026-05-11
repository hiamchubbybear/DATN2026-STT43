# Repository Rules

## Branch Strategy

This repository follows the GitFlow workflow.

### Protected Branches
- `main`
  - Production-ready branch
  - No direct commits allowed
  - Only merge from `release/*` or `hotfix/*`

- `develop`
  - Main development integration branch
  - All feature branches are merged here before release

---

## Branch Naming Convention

### Frontend
```bash
feature/frontend-<feature-name>
fix/frontend-<feature-name>
```

### Backend
```bash
feature/backend-<feature-name>
fix/backend-<feature-name>
```

### Mobile
```bash
feature/mobile-<feature-name>
fix/mobile-<feature-name>
```

### Release & Hotfix
```bash
release/v<version>
hotfix/<fix-name>
```

### Examples
```bash
feature/backend-authentication
feature/frontend-login-ui
feature/mobile-chat-screen
fix/backend-jwt-validation
release/v0.1.0
hotfix/payment-crash
```

---

# Commit Convention

All commits must follow the Conventional Commit specification.

## Commit Format

```bash
<type>(<scope>): <message>
```

---

## Available Types

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation update |
| refactor | Code refactoring |
| test | Add/update tests |
| chore | Maintenance, dependencies, tooling |

---

## Scopes

### Backend
```bash
backend
api
auth
database
websocket
```

### Frontend
```bash
frontend
ui
layout
auth-ui
dashboard
```

### Mobile
```bash
mobile
android
ios
chat
notification
```

---

## Commit Examples

### Backend
```bash
feat(backend): implement JWT authentication
fix(api): resolve therapist recommendation bug
refactor(database): optimize swipe query indexes
```

### Frontend
```bash
feat(frontend): add login page UI
fix(ui): resolve responsive sidebar issue
refactor(layout): simplify dashboard structure
```

### Mobile
```bash
feat(mobile): implement realtime chat screen
fix(android): resolve notification crash
chore(ios): update pod dependencies
```

---

## Commit Rules

- Use lowercase for type and scope
- Keep messages short and descriptive
- Use present tense
- One logical change per commit
- Avoid vague messages such as:
  - `update code`
  - `fix stuff`
  - `done`

---

# Pull Request Rules

## Pull Request Flow

1. Create branch from `develop`
2. Implement feature or fix
3. Commit using Conventional Commits
4. Push branch to remote
5. Open Pull Request into `develop`
6. Request code review
7. Merge only after approval

---

## Pull Request Requirements

Each Pull Request must include:

- Clear description
- Related issue/task
- Summary of changes
- Build/test confirmation
- Conflict check confirmation

---

## Pull Request Template

```md
# Description
Brief explanation of this Pull Request.

# Related Issue
- Closes #issue_number

# Changes
- Added ...
- Updated ...
- Fixed ...

# Checklist
- [ ] Build passes
- [ ] Code reviewed
- [ ] No merge conflicts
- [ ] Commit messages follow convention
- [ ] Tested locally
```

---

# Merge Rules

## Allowed Merge Targets

| Source Branch | Target Branch |
|---------------|---------------|
| feature/* | develop |
| fix/* | develop |
| release/* | main |
| hotfix/* | main |

---

## Restrictions

- No direct commits to `main`
- No force push on protected branches
- Squash merge or rebase merge recommended
- Delete merged feature branches after merge

---

# Example Workflow

## Backend Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/backend-authentication

git add .
git commit -m "feat(backend): implement JWT authentication"

git push origin feature/backend-authentication
```

---

## Frontend Feature

```bash
git checkout develop
git checkout -b feature/frontend-login-ui

git add .
git commit -m "feat(frontend): add login page"

git push origin feature/frontend-login-ui
```

---

## Mobile Feature

```bash
git checkout develop
git checkout -b feature/mobile-chat-screen

git add .
git commit -m "feat(mobile): implement realtime chat"

git push origin feature/mobile-chat-screen
```

---

# Release Workflow

```bash
git checkout develop
git checkout -b release/v0.1.0

git commit -m "chore(release): prepare v0.1.0"
```

---

# Hotfix Workflow

```bash
git checkout main
git checkout -b hotfix/payment-crash

git commit -m "fix(backend): resolve payment crash"
```

---

# AI Agent Instructions

When generating commits automatically:

- Always follow Conventional Commit format
- Detect affected layer:
  - `backend`
  - `frontend`
  - `mobile`
- Use meaningful scopes
- Never generate generic commit messages
- Prefer small atomic commits
- PR target must always be `develop` unless release/hotfix
