# Rosetta Development Workflow & Contributing Guide

## 🌿 Branching Strategy

To ensure code stability and maintain quality gates, all team members follow standard Git branch conventions:

- `main`: Production-ready branch deployed to the Azure VPS. Protected by GitHub Actions Quality Gate.
- `feature/<sprint-name>`: Feature development branches (e.g., `feature/week1-register-page`, `feature/week2-channels`).
- `bugfix/<issue-name>`: Bug fixes and performance patches.

---

## 🔄 Pull Request Workflow

1. **Pull Latest Changes:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/week1-register-page
   ```

3. **Develop & Test Locally:**
   Before committing, verify all tests pass:
   ```bash
   # Server tests
   cd server
   node test_auth_rbac.js

   # Client build check
   cd ../client
   npm run build
   ```

4. **Commit Following Conventional Commits:**
   ```bash
   git commit -m "feat(auth): complete register page form validation and avatar selection"
   ```

5. **Push and Open PR:**
   ```bash
   git push origin feature/week1-register-page
   ```
   Open a Pull Request on GitHub targeting `main`. Fill in the PR template with description and testing verification.

---

## 📋 Week 1 Task Assignments

- **Issue #1 [Closed]:** Backend Clean Clone Fix & In-Memory MongoDB Fallback (Assigned: Md. Tanjim Hossen Ahad)
- **Issue #2 [Closed]:** Duplicate Auth Modules Elimination & Unified Auth Routing (Assigned: Md. Tanjim Hossen Ahad)
- **Issue #3 [Closed]:** React Router, Auth Context & Reusable Design System (Assigned: Md. Tanjim Hossen Ahad)
- **Issue #4 [Closed]:** Sign-In Page Implementation & 1-Click Demo Testing (Assigned: Md. Tanjim Hossen Ahad)
- **Issue #5 [Closed - Completed]:** Register Page UI, Custom Avatar & Validation Rules (Assigned: Khadiza Akter)
