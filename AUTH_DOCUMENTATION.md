# Rosetta API: Authentication & Authorization (RBAC) Documentation

This document provides complete documentation for the Authentication, JWT verification, and Role-Based Access Control (RBAC) endpoints in Rosetta.

---

## 1. Overview & Security Architecture

- **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 salt rounds before persistence.
- **Token Format:** Standard 3-part JSON Web Tokens (`jwt`) signed with `HS256` algorithm and an expiration of 7 days.
- **Authorization Header:** Protected endpoints require the `Authorization` header with the Bearer scheme:
  ```http
  Authorization: Bearer <jwt-token>
  ```
- **Roles:**
  - `User`: Standard authenticated user. Can read and write cards, channels, and messages. Cannot delete cards.
  - `Admin`: Full administrator. Can perform restricted operations including `DELETE /api/cards/:id`.

---

## 2. Authentication Endpoints

### 2.1 User Registration
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public

#### Sample Request:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Khadiza Akter",
  "email": "khadiza@rosetta.local",
  "username": "khadiza",
  "password": "securepassword123",
  "role": "User"
}
```

#### Success Response (`201 Created`):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-1725615800000",
    "name": "Khadiza Akter",
    "email": "khadiza@rosetta.local",
    "username": "khadiza",
    "role": "User",
    "status": "online",
    "customStatus": "Exploring Rosetta 🚀",
    "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=khadiza",
    "createdAt": "2026-09-06T03:46:12.000Z"
  }
}
```

#### Error Responses:
- `400 Bad Request` (Missing required field):
  ```json
  { "error": "Name is required" }
  ```
- `400 Bad Request` (Invalid email format):
  ```json
  { "error": "Invalid email format" }
  ```
- `400 Bad Request` (Password < 6 characters):
  ```json
  { "error": "Password must be at least 6 characters long" }
  ```
- `409 Conflict` (Duplicate email):
  ```json
  { "error": "Email is already registered" }
  ```

---

### 2.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public

#### Sample Request:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "khadiza@rosetta.local",
  "password": "securepassword123"
}
```

#### Success Response (`200 OK`):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-1725615800000",
    "name": "Khadiza Akter",
    "email": "khadiza@rosetta.local",
    "username": "khadiza",
    "role": "User",
    "status": "online",
    "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=khadiza"
  }
}
```

#### Error Responses:
- `400 Bad Request` (Missing identifier or password):
  ```json
  { "error": "Email or username is required" }
  ```
- `401 Unauthorized` (Invalid credentials / wrong password):
  ```json
  { "error": "Invalid email or password" }
  ```

---

### 2.3 Get Authenticated Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Protected (`User` or `Admin`)

#### Sample Request:
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`):
```json
{
  "id": "u-1725615800000",
  "name": "Khadiza Akter",
  "email": "khadiza@rosetta.local",
  "username": "khadiza",
  "role": "User",
  "status": "online"
}
```

#### Error Response (`401 Unauthorized`):
```json
{
  "error": true,
  "message": "Authentication required. Token missing."
}
```

---

## 3. Protected CRUD & Role-Based Access Control (RBAC)

### 3.1 Get Cards (Protected)
- **Endpoint:** `GET /api/cards`
- **Access:** Authenticated (`User` or `Admin`)
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "card-1",
      "title": "Design Kanban UI",
      "list": "todo",
      "priority": "high"
    }
  ]
  ```

### 3.2 Create Card (Protected)
- **Endpoint:** `POST /api/cards`
- **Access:** Authenticated (`User` or `Admin`)
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Sample Request Body:**
  ```json
  {
    "title": "Security Audit RBAC Card",
    "list": "todo",
    "priority": "high"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "id": "card-1725615900000",
    "title": "Security Audit RBAC Card",
    "list": "todo",
    "priority": "high"
  }
  ```

### 3.3 Update Card (Protected)
- **Endpoint:** `PATCH /api/cards/:id`
- **Access:** Authenticated (`User` or `Admin`)
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Sample Request Body:**
  ```json
  {
    "priority": "urgent"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "id": "card-1725615900000",
    "title": "Security Audit RBAC Card",
    "priority": "urgent"
  }
  ```

### 3.4 Delete Card (Restricted: Admin Only)
- **Endpoint:** `DELETE /api/cards/:id`
- **Access:** **Admin Only**
- **Headers:** `Authorization: Bearer <admin-token>`

#### Successful Admin Request (`200 OK`):
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

#### Denied Regular User Request (`403 Forbidden`):
When a regular user with `role: "User"` attempts deletion:
```json
{
  "error": true,
  "message": "Access denied. Requires one of the following roles: Admin."
}
```

---

## 4. Running the Automated Tests

### Option A: Postman / Newman (20 Test Cases)
Run the 20-test Postman suite using Newman:
```bash
cd server
npm run test:lab5
```
Or directly:
```bash
newman run postman/Rosetta_Lab05_Auth_RBAC.postman_collection.json -e postman/rosetta_environment.json
```

### Option B: Node.js Automated Test Suite
Run the ES module automated test runner:
```bash
cd server
node test_auth_rbac.js [http://localhost:3000]
# or
npm run test:auth
```
