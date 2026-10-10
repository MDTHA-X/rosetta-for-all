# Rosetta • Week 1 Project Delivery & Workflow Report

**Course:** Web Programming-II (CSE-362)  
**Academic Year:** 3rd Year 2nd Semester Examination 2025  
**Institution:** Department of Computer Science and Engineering, Jahangirnagar University  
**Supervisor:** Md. Masum Bhuiyan, Lecturer, Dept. of CSE, JU  

---

## 👥 Team Breakdown & Division of Work

| Sl | Class Roll | Exam Roll | Member Name | Week 1 Responsibility Share |
|---|---|---|---|---|
| **01** | **340** | **231043** | **Md. Tanjim Hossen Ahad** | **70% (Completed)** |
| **02** | **367** | **231070** | **Khadiza Akter** | **30% (Assigned & Handed Off)** |

---

## 🎯 Week 1 Proposal Deliverables Alignment

According to the approved 5-Week Workflow Proposal:

> **Week 1 Scope:**
> 1. Fix the back end so a clean clone starts (missing data layer, duplicate auth modules and routes)
> 2. Set up GitHub issues, branches and pull-request workflow; confirm all existing tests pass
> 3. Create the React app structure (routing, auth context, reusable components)
> 4. Build the Register and Sign-in pages

---

## 🚀 Part 1: Tanjim Hossen Ahad (Roll 340) — 70% Completed Scope

### 1. Backend Stabilization & Clean Clone Guarantee
- **In-Memory MongoDB Auto-Fallback:** Implemented `mongodb-memory-server` fallback in `server/config/db.js`. On a clean clone without a local MongoDB service installed or running, the server automatically boots an in-memory database and seeds initial users, cards, channels, members, messages, connections, and board configuration.
- **Dual HTTP & HTTPS Listener Architecture:** Fixed the server startup in `server/server.js` to serve HTTP directly on `PORT` (3000) for local development, API automated testing, and Vite proxy, while simultaneously supporting HTTPS on `HTTPS_PORT` (3443) when SSL certificates are present. Removed blocking HTTP-to-HTTPS 301 redirects that caused certificate rejection in automated fetch/Newman test runners.
- **Enabled Reverse Proxy Trust:** Added `app.set('trust proxy', 1)` so that IP-based rate limiting on `/api/auth/register` and `/api/auth/login` respects `X-Forwarded-For` without falsely blocking test suites or local developers.
- **Fixed Mongoose Async Pre-Save Hook:** Resolved the `next is not a function` error in `server/models/User.js` by standardizing Mongoose async hooks without legacy callback parameters.

### 2. Elimination of Duplicate Auth Modules & Routes
- **Unified Auth Routing:** Consolidated all authentication and user endpoints exclusively into `server/routes/authRoutes.js` and `server/controllers/authController.js`:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
  - `PATCH /api/auth/me`
  - `PATCH /api/auth/me/password`
  - `GET /api/auth/users`
  - `GET /api/auth/users/:id`
- **Legacy Route Cleanup:** Removed duplicate, conflicting auth route handlers from `server/routes/legacyRoutes.js`.

### 3. Automated Test Verification (100% Pass Rate)
All test suites pass out of the box with zero failures:
- **Newman Chunk 1 (57 tests):** 57 Passed, 0 Failed
- **Newman Chunk 2 (50 tests):** 50 Passed, 0 Failed
- **Newman Lab 05 Auth & RBAC (20 tests / 43 assertions):** 43 Passed, 0 Failed
- **Node Automated Auth & RBAC Test Runner (`test_auth_rbac.js`):** 40 Passed, 0 Failed (including IP Rate Limit verification)
- **Total:** 148 automated test assertions verified green!

### 4. React App Structure & Design System
- **Routing Infrastructure:** Integrated `react-router-dom` with client-side routing:
  - `/` -> Redirect to workspace or login
  - `/login` -> Public Sign-In Page
  - `/register` -> Public Register Page
  - `/app` -> Protected Workspace Dashboard
  - `*` -> 404 Not Found Page
- **Stateful Authentication Context (`AuthContext.jsx`):**
  - Session bootstrapping on page load using `/api/auth/me`
  - JWT token storage in `localStorage` and memory
  - Safe 401 unauthorized automatic logout callback
  - `useAuth()` hook exposing `user`, `token`, `isAuthenticated`, `isAdmin`, `login`, `register`, `logout`, `refreshProfile`
- **Route Guards:**
  - `ProtectedRoute.jsx`: Redirects unauthenticated visitors to `/login`
  - `PublicRoute.jsx`: Redirects logged-in users directly to `/app`
- **Modern Vanilla CSS Design System:**
  - Official White, Black, and Maroon Color Theme (JU CSE aesthetic)
  - Glassmorphic card surfaces (`.glass-card`, blur 16px)
  - Custom form inputs with active maroon focus rings and validation error indicators
  - Accessible button hierarchy (`.btn-primary` with maroon glow, `.btn-secondary`, `.btn-outline`, `.btn-ghost`)
  - Status indicator badges and animated spinners

### 5. Production-Ready Sign-In Page (`LoginPage.jsx`)
- Complete responsive Sign-In interface with Email/Username & Password inputs
- Password visibility show/hide toggle
- Real-time client-side field validation and backend error alerts
- **1-Click Demo Accounts:** Interactive quick-login pills for grading and testing:
  - 🛡️ **Admin: Tanjim Hossen** (`tanjim@rosetta.local` / `password123`)
  - 💻 **Lead Developer: Alex Rivera** (`alex@rosetta.local` / `password123`)
  - 🎨 **Designer: Sarah Chen** (`sarah@rosetta.local` / `password123`)
  - 🔍 **QA: Marcus Vance** (`marcus@rosetta.local` / `password123`)
- Seamless authentication redirect to `/app`

---

## 🤝 Part 2: Khadiza Akter (Roll 367) — 30% Assigned Scope

### Assigned Deliverables: Complete Register Page & Flow
Teammate Khadiza Akter is assigned to finalize the **Register Page** (`client/src/pages/RegisterPage.jsx`):

1. **User Interface Polish:**
   - Enhance the registration form layout and styling.
   - Design and integrate a custom avatar picker or DiceBear avatar generator preview.
2. **Client-Side Validation:**
   - Implement real-time email format validation (regex).
   - Implement password strength / minimum 6-character length validation.
3. **API Integration & Error Handling:**
   - Wire form submissions to the provided `useAuth().register()` method.
   - Display user-friendly error banners when a duplicate email (`409 Conflict`) is encountered.
4. **Role Selection:**
   - Provide an intuitive selector for user roles (`User` vs `Admin`).
5. **Git & PR Workflow:**
   - Create a branch: `feature/week1-register-page`
   - Complete the implementation and test locally.
   - Open Pull Request with description and screenshots targeting `main`.

---

## 🛠️ How to Run & Verify Week 1 Work

### Start Backend:
```bash
cd server
npm install
npm start
```
The backend starts at `http://localhost:3000` (and HTTPS on `https://localhost:3443`).

### Run Automated Quality Gate:
```bash
cd server
# Run Node RBAC Suite:
node test_auth_rbac.js

# Run Newman Postman Collections:
npx newman run testcases/Rosetta_API_Tests_Chunk1_of_2.postman_collection.json --env-var baseUrl=http://localhost:3000 --env-var token=test-token
npx newman run testcases/Rosetta_API_Tests_Chunk2_of_2.postman_collection.json --env-var baseUrl=http://localhost:3000 --env-var token=test-token
npx newman run testcases/Rosetta_Lab05_Auth_RBAC.postman_collection.json --env-var baseUrl=http://localhost:3000
```

### Start Frontend (Development Mode):
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
