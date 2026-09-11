# Rosetta Security Measures Documentation (Lab 6)

This document provides a comprehensive overview of the security enhancements implemented in the Rosetta backend for Lab 6.

## 1. HTTPS Setup & HTTP Redirection
- **Description:** The backend now runs securely over HTTPS, encrypting all data in transit. 
- **Implementation:** 
  - We use the native Node.js `https` module alongside Express.
  - A self-signed certificate (`cert.pem`) and private key (`key.pem`) are read from the `certs` directory.
  - The secure HTTPS server runs on port `3443` (by default).
- **HTTP Redirect:** A secondary HTTP server runs on port `3000` which automatically intercepts standard HTTP requests and responds with a `301 Moved Permanently` to redirect traffic to the `https://` equivalent.

## 2. Rate Limiting on Authentication Endpoints
- **Description:** To prevent brute-force attacks against user credentials, rate limiting is applied to the login and registration endpoints.
- **Implementation:**
  - Package: `express-rate-limit`
  - Rule: A maximum of **10 requests per 15 minutes** per IP address.
  - Applied to: `/api/auth/login` and `/api/auth/register`.
  - Exceeding the limit results in a `429 Too Many Requests` error with an informative message.

## 3. Global Security Headers (Helmet)
- **Description:** Helmet adds essential HTTP security headers to help protect the app from some well-known web vulnerabilities (e.g., clickjacking, cross-site scripting).
- **Implementation:** 
  - Package: `helmet`
  - Applied globally at the top of the middleware stack using `app.use(helmet())`.
  - Sets headers such as `Content-Security-Policy`, `X-DNS-Prefetch-Control`, `X-Frame-Options` (DENY), `Strict-Transport-Security`, and removes the `X-Powered-By` header.

## 4. Input Sanitization
- **Description:** User input (request body, params, query strings) is sanitized globally to prevent injection attacks.
- **Implementation:**
  - **NoSQL Injection:** Uses `express-mongo-sanitize` to recursively search for and remove any keys starting with `$` or `.` that could be used maliciously in MongoDB queries.
  - **Cross-Site Scripting (XSS):** Uses `xss-clean` to sanitize user input to prevent XSS attacks by filtering out malicious HTML tags or script elements before they reach the controllers.

## 5. CORS with Restricted Origin Whitelist
- **Description:** Cross-Origin Resource Sharing (CORS) is now strictly limited to trusted domains, preventing malicious third-party sites from making cross-origin requests to our API on behalf of authenticated users.
- **Implementation:**
  - Removed the permissive wildcard `*` CORS policy.
  - Established an allowed origins list: `https://localhost:3443`, `https://rosetta.local`, and `http://localhost:3000`.
  - The middleware validates the `Origin` header of incoming requests against this whitelist and blocks unlisted origins.

## 6. Testing & Verification of Security Measures

All security mechanisms were tested and verified against the running server:

### A. HTTP to HTTPS Redirection
```bash
curl -I http://localhost:3000/api/cards
```
- **Result:** `HTTP/1.1 301 Moved Permanently`
- **Header:** `Location: https://localhost:3443/api/cards`

### B. HTTPS & Helmet Security Headers
```bash
curl -k -I https://localhost:3443/api/cards
```
- **Result:** HTTPS connection established with SSL/TLS certificate.
- **Headers Verified:**
  - `Strict-Transport-Security: max-age=15552000; includeSubDomains`
  - `Content-Security-Policy: default-src 'self' ...`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`

### C. Rate Limiting on Authentication Endpoints
```bash
curl -k -I -X POST https://localhost:3443/api/auth/login
```
- **Result:** Rate limit headers returned:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: <count>`
  - Exceeding limit results in `HTTP 429 Too Many Requests`.

### D. CORS Whitelisting
- **Allowed Origin (`Origin: https://localhost:3443`):**
  - Returns: `Access-Control-Allow-Origin: https://localhost:3443` and `Access-Control-Allow-Credentials: true`.
- **Disallowed Origin (`Origin: https://malicious-site.com`):**
  - Result: Request blocked by CORS policy with `Not allowed by CORS`.

### E. Input Sanitization (NoSQL Injection & XSS)
- Input payloads containing MongoDB operator injection keys (e.g. `{"$gt": ""}`) are intercepted and stripped by `express-mongo-sanitize`.
- Payloads containing malicious HTML/scripts (e.g. `<script>alert(1)</script>`) are sanitized by `xss-clean`.

