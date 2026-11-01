# 🏆 Rosetta For All

> **Modern Swiss Tournament Management Platform**  
> *React Native Client • Node.js Express (MVC) Server • MySQL Database • Docker & CI/CD Pipeline*

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Postman / Newman](https://img.shields.io/badge/Testing-Newman%20Automated-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://www.postman.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📖 Architecture & Overview

**Rosetta For All** is a full-stack, distributed platform designed for tournament organizers, chess arbiters, and competitive gaming leagues.

The system is decoupled into client and server components running on separate origins with full Cross-Origin Resource Sharing (CORS), strict authentication rate limiting, and containerized deployment.

```text
rosetta-for-all/
├── client/                      # React Native Mobile / Web Client
│   ├── src/
│   │   ├── components/          # Reusable UI Components (Header, PairingTable, StandingsTable, PlayerModal...)
│   │   ├── screens/             # Screen Views (Tournaments, Details, Login, Admins, Password...)
│   │   ├── services/            # API Service Layer (Axios / Fetch)
│   │   └── constants/           # Design System & Configuration (Theme, Colors, Endpoints)
│   ├── App.js                   # Root Component & Client Router
│   ├── package.json             # Client Dependencies
│   └── Dockerfile               # Client Container Configuration
│
├── server/                      # Node.js Express REST API (MVC Architecture)
│   ├── config/
│   │   └── db.js                # Database Connection Pool (MySQL with zero-config test fallback)
│   ├── models/                  # MVC Data Models (Admin, Tournament, Player, Round, Pairing)
│   ├── controllers/             # MVC Controllers (auth, admin, tournament, player, round)
│   ├── routes/                  # Express REST Routes
│   ├── middleware/              # Auth Middleware & Authentication Rate Limiter (10 req / 3 min)
│   ├── services/                # Dutch Swiss Pairing Engine & FIDE Scoring Engine (Buchholz, SB, TPR)
│   ├── scripts/                 # Database Initializer & Newman Runner
│   ├── schema.sql               # MySQL Database Schema
│   ├── package.json             # Server Dependencies
│   └── Dockerfile               # Server Container Configuration
│
├── postman/                     # Automated Newman Testing Suite
│   ├── rosetta_collection.json  # Comprehensive 21-Endpoint Test Collection
│   └── rosetta_environment.json # Postman Environment Configuration
│
├── .github/workflows/           # CI/CD Pipeline
│   └── ci.yml                   # Automated Testing & Docker Build Pipeline
│
├── docker-compose.yml           # Full-Stack Orchestration (MySQL + Server + Client)
└── README.md
```

---

## 🚀 Key Features

### 1. React Native Client
- Built with standard React Native primitives (`View`, `Text`, `FlatList`, `TextInput`, `TouchableOpacity`, `Modal`).
- Modern glassmorphism dark/light design system with client-side theme switching.
- Dedicated tournament hub with tabs for **Pairings & Results**, **Official Standings**, **Players Roster**, and **Arbiter Delegations**.
- Handles 429 Too Many Requests errors with countdown and warning banners.

### 2. MVC Node.js Backend & MySQL Database
- **Model-View-Controller (MVC)** design pattern separating database access (`models/`), request handling (`controllers/`), and route dispatching (`routes/`).
- **MySQL 8.0** relational database with connection pooling, transaction safety, and foreign key cascades.
- Smart dual-driver abstraction (`server/config/db.js`) supporting automated SQLite fallback for local test runs without external daemons.

### 3. Authentication & Strict Rate Limiting
- **JWT-based Authentication** with bcrypt password hashing.
- **Rate Limiting:** Enforces **10 requests per 3 minutes** on authentication endpoints (`/api/auth/login`), preventing credential brute-forcing.

### 4. Swiss Pairing Engine & FIDE Tiebreaks
- **Dutch Swiss Algorithm:** Balances White/Black color allocations, respects color streaks, prevents repeat pairings, and handles odd-player byes.
- **Standings & Tiebreaks:**
  - Match Points (PTS)
  - Buchholz (BH) & Median Buchholz (BH-1)
  - Sonneborn-Berger (SB)
  - Koya System
  - Tournament Performance Rating (TPR)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Docker & Docker Compose (optional, for full containerization)

---

### Option 1: Docker Compose (Full Stack)

Run the entire application (MySQL 8.0 + Server on `:5001` + Client on `:3000`) with one command:

```bash
docker-compose up --build
```

- **Client Application:** `http://localhost:3000`
- **Server API:** `http://localhost:5001`
- **MySQL Database:** `localhost:3306`

---

### Option 2: Local Development Setup

#### 1. Start the Server
```bash
cd server
npm install
node scripts/initDb.js   # Initializes database & default seeds
npm start                # Starts server on http://localhost:5001
```

#### 2. Run the Newman Automated Test Suite
```bash
npm run test:newman
```
*Executes all 21 API endpoints and verifies the 10 req/3 min authentication rate limiter.*

---

## 🔑 Default Credentials

| Role | Username | Password | Privileges |
|---|---|---|---|
| **Super Admin** | `mdtha` | `mdtha` | Full system access, tournament creation, admin delegations |
| **Admin** | `admin` | `admin` | Standard administrative arbiter access |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
