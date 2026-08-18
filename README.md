# 🌟 Rosetta: Discord + Trello Hybrid Collaboration Platform

**Rosetta** is a high-performance modern developer hub that unifies **real-time Discord-style communication** (channels, members, rich text messaging) with **Trello-style agile project tracking** (Kanban board, drag/move task cards, priority workflows, assignee tracking).

## 🚀 Features

- **Discord-style Workspace:** Sidebar channels selector, live text chat stream, team directory with status badges (Online, Idle, DND), role indicators.
- **Trello-style Kanban Board:** 4-stage sprint workflow (`To Do` ➔ `In Progress` ➔ `Review` ➔ `Done`), priority filters (`Urgent`, `High`, `Medium`, `Low`), quick-shift card actions.
- **System Diagnostics:** Live operational health monitor, latency tracker, metric counters.
- **API Testing & Automation:** 100 Automated Postman Assertions, Newman CLI Runner in GitHub Actions.
- **Performance Tested:** Apache JMeter & Autocannon Suite benchmarked.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Deployment & Infrastructure:** Docker, Docker Compose
- **Testing & Quality Assurance:** Postman, Newman, Apache JMeter, Autocannon

## 📁 Project Structure

```text
rosetta-for-all/
├── client/                 # React frontend (Vite)
│   ├── src/                # Frontend source code
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── Dockerfile          # Frontend Docker configuration
├── server/                 # Node.js backend (Express)
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Entry point for backend
│   └── Dockerfile          # Backend Docker configuration
├── docker-compose.yml      # Docker Compose configuration for full stack
├── jmeter/                 # Performance load testing scripts
├── postman/                # Postman API collections
├── scripts/                # Utility scripts
└── ASSIGNMENT_REPORT.md    # Detailed project report
```

## ⚙️ How to Setup & Run

### Option 1: Using Docker (Recommended)

The easiest way to run the entire application (Frontend, Backend, and MongoDB) is using Docker Compose.

1. **Ensure Docker and Docker Compose are installed** on your system.
2. Navigate to the root directory of the project:
   ```bash
   cd rosetta-for-all
   ```
3. **Build and start the containers:**
   ```bash
   docker-compose up -d --build
   ```
   *This will start the MongoDB database, Node.js backend on port 3000, and React frontend on port 80.*

4. **Access the Application:**
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:3000`

### Option 2: Local Development (Without Docker)

If you prefer to run the application locally without Docker, follow these steps:

#### 1. Start MongoDB
Ensure you have a MongoDB instance running locally or a MongoDB Atlas URI.

#### 2. Setup the Backend
```bash
cd rosetta-for-all/server
cp .env.example .env
```
Update the `.env` file with your MongoDB connection string (if different from default `mongodb://localhost:27017/rosetta`).
```bash
npm install
npm start
```
*The backend will start running on port 3000.*

#### 3. Setup the Frontend
```bash
cd rosetta-for-all/client
npm install
npm run dev
```
*The Vite development server will start (usually on port 5173).*

## 🧪 Testing

To run the automated API test suite using Newman:
```bash
cd server
npm test
```
*This will execute the Postman collections and generate an HTML report in the `reports/` directory.*
