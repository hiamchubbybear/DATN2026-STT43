# Mixer - Dating App & Scam Detection System

[![Backend CI/CD](https://github.com/hiamchubbybear/DATN2026-STT43/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/hiamchubbybear/DATN2026-STT43/actions/workflows/backend-ci.yml)
![Server Status](https://img.shields.io/endpoint?url=https://datn.chessy.dev/health&logo=statuspage&logoColor=white&cacheSeconds=60)

## 🌟 Overview
Mixer is a modern dating platform built with a focus on user safety and real-time interaction. It features a sophisticated matchmaking algorithm and an integrated AI-powered scam detection system to protect users from fraudulent activities.

---

## 📁 Project Structure

```bash
├── backend/                  # ASP.NET Core 8 Web API (Clean Architecture)
│   ├── DoAnTotNghiep.Web/          # Entry point & Controllers
│   ├── DoAnTotNghiep.Application/  # Business logic & Handlers
│   ├── DoAnTotNghiep.Domain/       # Core entities & Enums
│   └── DoAnTotNghiep.Infrastructure/# Persistence (Mongo, Redis), Services
├── frontend/                 # Client Applications
│   ├── mobile-react-native/  # Expo / React Native App (iOS & Android)
│   └── admin-react/          # React Admin Dashboard
├── scripts/                  # Data seeding & Development tools (Ignored)
├── docs/                     # Documentation
│   └── technical/            # API Plans, Rules, and translations
└── docker/                   # Deployment configurations
```

---

## 🚀 Technology Stack

### Backend
- **Core**: ASP.NET Core 8
- **Database**: MongoDB (Primary), Redis (Caching & Messaging)
- **Real-time**: SignalR (Chat & Notifications)
- **Monitoring**: Custom System Monitor (Metrics, Logs, Resource Usage)
- **Auth**: JWT, Google OAuth

### Frontend
- **Mobile**: React Native (Expo), Redux/Zustand, Native Stack Navigation
- **Admin**: React, Tailwind CSS, Lucide Icons
- **Styling**: Vanilla CSS / Tailwind (Admin)

### AI & Security
- **Detection**: Python, FastAPI, XGBoost
- **Security**: Report & Review system with evidence photo support

---

## ✨ Key Features

- **Matchmaking**: Swipe right to match, left to pass. Sophisticated recommendation engine.
- **Real-time Chat**: Instant messaging with SignalR.
- **System Monitoring**: Admin dashboard for real-time backend health, memory usage, and logs.
- **Safety First**: 
    - User Reporting system with photo evidence.
    - App Review & Feedback.
    - Scam detection (In development).
- **Profile Management**: Detailed profile setup with interests, lifestyle, and photo gallery.

---

## 🛠️ Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- MongoDB & Redis (Local or Cloud)

### Run Backend
```bash
cd backend/DoAnTotNghiep.Web
dotnet run
```

### Run Mobile
```bash
cd frontend/mobile-react-native
npm install
npx expo start
```

### Run Admin
```bash
cd frontend/admin-react
npm install
npm run dev
```

---

## 📄 Documentation
Detailed technical documentation can be found in the [docs/technical/](docs/technical/) directory:
- [API Plan](docs/technical/api-plan.md)
- [Repository Rules](docs/technical/repository-rules.md)

## 👥 Team
- **Frontend**: [Chu Phương Anh](https://github.com/Chuuuu21)
- **Backend**: [Phan Công Danh](https://github.com/CongDanh06) & [Trần Huy](https://github.com/huynartLZ)
- **Machine Learning**: [Phùng Đình Quang Huy](https://github.com/HawkPoseidon)
- **DevOps**: [Trần Văn Huy](https://github.com/hiamchubbybear)

---
© 2026 Mixer Team - All Rights Reserved.
