import https from 'https';
import http from 'http';

const HTTP_URL = 'http://localhost:3000';
const HTTPS_URL = 'https://localhost:3443';

// Ignore self-signed certs for testing HTTPS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function assert(description, condition, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${description}`);
  } else {
    console.log(`  \x1b[31m✖ FAIL\x1b[0m ${description} ${details ? `(${details})` : ''}`);
  }
}

async function runSecurityTests() {
  console.log('\n======================================================');
  console.log('  🔒 Rosetta Lab 06 - Security & Hardening Test Suite');
  console.log('======================================================\n');

  // Test 1: HTTP to HTTPS Redirection
  console.log('\x1b[36m[Task 1 & 2] HTTPS Setup & HTTP Redirection\x1b[0m');
  try {
    const res = await makeRequest(`${HTTP_URL}/api/cards`, {
      method: 'GET',
      headers: { 'User-Agent': 'curl/8.7.1' }
    });
    assert('01. HTTP traffic returns 301 Moved Permanently', res.statusCode === 301, `Got ${res.statusCode}`);
    assert('02. Redirect location points to HTTPS port 3443', res.headers.location && res.headers.location.includes('https://') && res.headers.location.includes('3443'), `Location: ${res.headers.location}`);
  } catch (err) {
    assert('01. HTTP redirection test', false, err.message);
  }

  // Test 2: HTTPS Handshake & Helmet Headers
  console.log('\n\x1b[36m[Task 3] Global Security Headers (Helmet)\x1b[0m');
  try {
    const res = await makeRequest(`${HTTPS_URL}/api/cards`, {
      method: 'GET'
    });
    assert('03. HTTPS connection successful', res.statusCode === 401 || res.statusCode === 200, `Got ${res.statusCode}`);
    assert('04. Helmet Content-Security-Policy header present', !!res.headers['content-security-policy']);
    assert('05. Helmet Strict-Transport-Security (HSTS) header present', !!res.headers['strict-transport-security']);
    assert('06. Helmet X-Frame-Options (Clickjacking defense) present', !!res.headers['x-frame-options']);
    assert('07. Helmet X-Content-Type-Options: nosniff present', res.headers['x-content-type-options'] === 'nosniff');
  } catch (err) {
    assert('03. Security headers test', false, err.message);
  }

  // Test 3: Rate Limiting on Auth Endpoints
  console.log('\n\x1b[36m[Task 4] Authentication Rate Limiting\x1b[0m');
  try {
    const res = await makeRequest(`${HTTPS_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@rosetta.local', password: 'wrong' })
    });
    const hasRateLimit = !!(res.headers['x-ratelimit-limit'] || res.headers['ratelimit-limit']);
    assert('08. Rate limiting headers present on /api/auth/login', hasRateLimit);
  } catch (err) {
    assert('08. Rate limiting test', false, err.message);
  }

  // Test 4: Input Sanitization (NoSQL Injection & XSS)
  console.log('\n\x1b[36m[Task 5] Input Sanitization (NoSQL & XSS Prevention)\x1b[0m');
  try {
    // NoSQL Injection test
    const nosqlRes = await makeRequest(`${HTTPS_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: { $gt: '' }, password: 'wrongpassword' })
    });
    assert('09. NoSQL injection operator ($gt) stripped/neutralized (Status 400)', nosqlRes.statusCode === 400, `Got ${nosqlRes.statusCode}`);

    // XSS test
    const xssRes = await makeRequest(`${HTTPS_URL}/api/cards`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        title: '<script>alert("xss")</script>Security Hardening',
        description: 'Testing xss-clean'
      })
    });
    const parsed = JSON.parse(xssRes.body || '{}');
    const xssNeutralized = parsed.title && !parsed.title.includes('<script>');
    assert('10. XSS payload stripped of raw <script> tags', xssNeutralized, `Title: ${parsed.title}`);
  } catch (err) {
    assert('09. Sanitization test', false, err.message);
  }

  // Test 5: CORS Origin Whitelist
  console.log('\n\x1b[36m[Task 6] CORS Whitelisting & Origin Restriction\x1b[0m');
  try {
    // Allowed origin
    const allowedRes = await makeRequest(`${HTTPS_URL}/api/cards`, {
      method: 'GET',
      headers: { 'Origin': 'https://localhost:3443' }
    });
    assert('11. Whitelisted origin (https://localhost:3443) allowed', allowedRes.headers['access-control-allow-origin'] === 'https://localhost:3443');

    // Blocked origin
    const blockedRes = await makeRequest(`${HTTPS_URL}/api/cards`, {
      method: 'GET',
      headers: { 'Origin': 'https://malicious-site.com' }
    });
    const originBlocked = !blockedRes.headers['access-control-allow-origin'] || blockedRes.body.includes('Not allowed by CORS') || blockedRes.statusCode >= 400;
    assert('12. Unauthorized origin (https://evil.com) rejected by CORS policy', originBlocked);
  } catch (err) {
    assert('11. CORS test', false, err.message);
  }

  console.log('\n======================================================');
  console.log('  🏁 Security Verification Complete');
  console.log('======================================================\n');
}

runSecurityTests();
