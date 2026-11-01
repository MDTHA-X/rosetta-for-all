# 🏆 Rosetta For All

> **Modern, Lightweight Swiss Tournament & Match Management System**

[![PHP](https://img.shields.io/badge/PHP-8.0%2B-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20MySQL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2B%20CSS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📖 About Rosetta For All

**Rosetta For All** is a high-performance, self-hosted web platform designed for arbiters, clubs, and competitive tournament organizers. It streamlines the entire tournament lifecycle—from player registrations, ratings, and seedings to automated Swiss system pairings, live result entries, and official multi-tiebreak standings.

Built with a clean **Pure PHP + Vanilla JavaScript Single-Page Application (SPA)** architecture, Rosetta For All eliminates the weight and fragility of heavy build toolchains. It runs seamlessly on budget shared hosting (cPanel), standard Linux/LAMP servers, Docker, or locally with zero-configuration SQLite.

---

## ✨ Key Features

### 🎯 Automated Swiss Pairing Engine
- **Dutch Swiss System Algorithm:** Implements pairing standards adhering to official FIDE pairing principles.
- **Color Balance & History Tracking:** Automatically balances White/Black allocations and respects strict color streaks.
- **Repeat Prevention & Bye Handling:** Prevents duplicate pairings and smoothly handles odd player counts with automated bye awards.

### 📊 Real-Time Standings & Official Tiebreaks
- Dynamically computes standings instantly upon match result entry.
- Comprehensive tiebreak metrics computed out-of-the-box:
  - **Match Points (PTS)**
  - **Buchholz System (BH)**
  - **Median Buchholz (BH-1)**
  - **Sonneborn-Berger (SB)**
  - **Koya System**
  - **Tournament Performance Rating (TPR / $R_p$)**

### 🗂️ Round Navigation & Arbiter Controls
- **Pairing Views:** Dedicated boards, assigned colors, and direct score dropdowns.
- **Historical Round Results:** Inspect historical tournament standings as they stood after each specific completed round.
- **Arbiter Safety Controls:**
  - One-click pairing undo for draft rounds.
  - Reopen completed rounds to amend misreported scores without data corruption.
  - Granular tournament arbiter delegations by Super Admins.

### 👤 Interactive Profiles & Modern UI
- Player cards featuring full tournament match logs, performance ratings, and score breakdowns.
- Modern dark/light glassmorphism interface with instant client-side theme switching.
- Responsive design tailored for desktops, tablets, and mobile devices at the venue.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Pure PHP 8.0+ RESTful JSON API |
| **Frontend** | Vanilla ES6+ SPA, Vanilla CSS3 (Glassmorphism design system) |
| **Database** | SQLite (default zero-config) / MySQL 5.7+ / MariaDB |
| **Fonts** | Inter (Google Fonts) |

---

## 🚀 Getting Started

### 1. Local Quick Start (SQLite)

Clone the repository and start PHP's built-in web server:

```bash
# Clone the repository
git clone https://github.com/MDTHA-X/rosetta-for-all.git
cd rosetta-for-all

# Start local server with SQLite support
php -S localhost:8000 -d extension=pdo_sqlite
```

Open your browser and navigate to **`http://localhost:8000`**.

---

### 2. Production / cPanel Deployment (MySQL)

1. Upload the files to your web root (e.g., `public_html`).
2. Create a MySQL database and user in cPanel.
3. Import `schema.sql` into your database (via phpMyAdmin or MySQL CLI).
4. Copy `config.sample.php` to `config.php` and configure your credentials:
   ```php
   define('DB_DRIVER', 'mysql');
   define('DB_HOST',   'localhost');
   define('DB_NAME',   'your_database_name');
   define('DB_USER',   'your_database_user');
   define('DB_PASS',   'your_database_password');
   ```

---

## 🔑 Default Credentials

The initial database seed includes default administrative accounts:

| Role | Username | Password | Notes |
|---|---|---|---|
| **Super Admin** | `mdtha` | `mdtha` | Full system access, can create admins and tournaments |
| **Admin** | `admin` | `admin` | Administrative tournament manager |

> ⚠️ *Important: Update administrative passwords immediately after initial deployment using the in-app password manager (`#change-password`).*

---

## 📁 Project Structure

```text
rosetta-for-all/
├── api/
│   ├── admins.php       # Admin CRUD & password management
│   ├── login.php        # Authentication & session verification
│   ├── pairings.php     # Board results updating
│   ├── players.php      # Player roster management & ratings
│   ├── rounds.php       # Swiss round generation, completion & standings API
│   └── tournaments.php  # Tournament creation & arbiter assignment
├── assets/
│   ├── app.js           # Single Page Application core router & UI rendering
│   └── style.css        # Responsive dark/light theme stylesheet
├── includes/
│   ├── auth.php         # Authentication helpers, session & permission checks
│   ├── db.php           # Unified PDO database handler (SQLite & MySQL)
│   ├── pairing.php      # Swiss pairing engine
│   └── scoring.php      # FIDE tiebreak algorithms (Buchholz, SB, TPR)
├── config.sample.php    # Sample configuration for production environments
├── database.sqlite      # Pre-seeded SQLite database for instant local run
├── index.php            # Application entry point & SPA shell
├── init_sqlite.php      # SQLite database re-initializer
├── schema.sql           # MySQL database schema definition
├── schema_sqlite.sql    # SQLite database schema definition
├── setup_db.php         # Database migration script
└── README.md            # Documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
