/**
 * Automated Test Runner for Rosetta Lab 05 Authentication and Authorization (RBAC)
 * Run with: node test_auth_rbac.js [baseUrl]
 * Default baseUrl: http://localhost:3000
 */

const BASE_URL = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;
const results = [];

function assert(description, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${description}`);
    results.push({ description, status: 'PASS' });
  } else {
    failed++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${description} ${details ? `(${details})` : ''}`);
    results.push({ description, status: 'FAIL', details });
  }
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`  Rosetta Lab 05 - Authentication & RBAC Test Suite`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const randomId = Math.floor(Math.random() * 100000);
  const testEmail = `student_${randomId}@rosetta.local`;
  const testUsername = `student_${randomId}`;
  let userToken = '';
  let adminToken = '';
  let createdCardId = '';

  // -----------------------------------------------------------------
  // Group 1: Registration & Input Validation
  // -----------------------------------------------------------------
  console.log('\x1b[36m[Group 1] User Registration & Validation\x1b[0m');

  // Test 1: Valid Registration
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Khadiza Akter',
        email: testEmail,
        username: testUsername,
        password: 'securepassword123',
        role: 'User'
      })
    });
    const data = await res.json();
    assert('01. User Registration returns 201 Created', res.status === 201, `Got ${res.status}`);
    assert('01. User Registration returns JWT token', typeof data.token === 'string' && data.token.length > 20);
    assert('01. User Registration returns User role', (data.user?.role || data.role) === 'User');
    assert('01. Password not leaked in response', data.password === undefined && data.user?.password === undefined);
  }

  // Test 2: Duplicate Email
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Person',
        email: testEmail,
        username: `dup_${randomId}`,
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    assert('02. Duplicate email returns 409 Conflict', res.status === 409, `Got ${res.status}`);
    assert('02. Error indicates email already registered', String(data.error).includes('already registered'));
  }

  // Test 3: Invalid Email Format
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'invalid-email-address',
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    assert('03. Invalid email format returns 400 Bad Request', res.status === 400, `Got ${res.status}`);
    assert('03. Error indicates invalid email format', String(data.error).includes('Invalid email format'));
  }

  // Test 4: Missing Required Name
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '   ',
        email: `noname_${randomId}@rosetta.local`,
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    assert('04. Missing name returns 400 Bad Request', res.status === 400, `Got ${res.status}`);
    assert('04. Error indicates name is required', String(data.error).includes('Name is required'));
  }

  // Test 5: Short Password (< 6 chars)
  {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Password User',
        email: `shortpass_${randomId}@rosetta.local`,
        password: '123'
      })
    });
    const data = await res.json();
    assert('05. Short password returns 400 Bad Request', res.status === 400, `Got ${res.status}`);
    assert('05. Error indicates password length requirement', String(data.error).includes('at least 6 characters'));
  }

  // -----------------------------------------------------------------
  // Group 2: User & Admin Login
  // -----------------------------------------------------------------
  console.log('\n\x1b[36m[Group 2] User & Admin Login Verification\x1b[0m');

  // Test 6: Valid User Login
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    userToken = data.token;
    assert('06. Valid login returns 200 OK', res.status === 200, `Got ${res.status}`);
    assert('06. Returns valid JWT token', typeof userToken === 'string' && userToken.length > 20);
    assert('06. User email matches registered email', (data.user?.email || data.email) === testEmail);
  }

  // Test 7: Login with Invalid Password
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrong_password_123'
      })
    });
    assert('07. Invalid password returns 401 Unauthorized', res.status === 401, `Got ${res.status}`);
  }

  // Test 8: Login with Non-Existent Account
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ghost_user_does_not_exist@rosetta.local',
        password: 'somepassword123'
      })
    });
    assert('08. Non-existent user returns 401 Unauthorized', res.status === 401, `Got ${res.status}`);
  }

  // Test 9: Login with Missing Password
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: ''
      })
    });
    const data = await res.json();
    assert('09. Missing password returns 400 Bad Request', res.status === 400, `Got ${res.status}`);
    assert('09. Error indicates password is required', String(data.error).includes('Password is required'));
  }

  // Test 10: Admin Login
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tanjim@rosetta.local',
        password: 'password123'
      })
    });
    const data = await res.json();
    adminToken = data.token;
    assert('10. Admin login returns 200 OK', res.status === 200, `Got ${res.status}`);
    assert('10. Admin user has Admin role', (data.user?.role || data.role) === 'Admin');
    assert('10. Admin token is extracted', typeof adminToken === 'string' && adminToken.length > 20);
  }

  // -----------------------------------------------------------------
  // Group 3: Authentication Middleware
  // -----------------------------------------------------------------
  console.log('\n\x1b[36m[Group 3] Authentication Middleware Verification\x1b[0m');

  // Test 11: Missing Token on /cards
  {
    const res = await fetch(`${BASE_URL}/api/cards`);
    assert('11. Missing token on /api/cards returns 401 Unauthorized', res.status === 401, `Got ${res.status}`);
  }

  // Test 12: Missing Token on /auth/me
  {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert('12. Missing token on /api/auth/me returns 401 Unauthorized', res.status === 401, `Got ${res.status}`);
  }

  // Test 13: Invalid JWT Token
  {
    const res = await fetch(`${BASE_URL}/api/cards`, {
      headers: { 'Authorization': 'Bearer invalid.jwt.signature' }
    });
    assert('13. Invalid token returns 401 Unauthorized', res.status === 401, `Got ${res.status}`);
  }

  // Test 14: Valid Token (User Role)
  {
    const res = await fetch(`${BASE_URL}/api/cards`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const data = await res.json();
    assert('14. Valid user token returns 200 OK', res.status === 200, `Got ${res.status}`);
    assert('14. Response is an array of cards', Array.isArray(data));
  }

  // Test 15: Create Card Without Token
  {
    const res = await fetch(`${BASE_URL}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthenticated Card', list: 'todo' })
    });
    assert('15. Create card without token returns 401 Unauthorized', res.status === 401, `Got ${res.status}`);
  }

  // -----------------------------------------------------------------
  // Group 4: Role-Based Access Control (RBAC)
  // -----------------------------------------------------------------
  console.log('\n\x1b[36m[Group 4] Role-Based Access Control (RBAC)\x1b[0m');

  // Test 16: Create Card with Valid User Token
  {
    const res = await fetch(`${BASE_URL}/api/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        title: 'RBAC Verification Task Card',
        list: 'todo',
        priority: 'medium'
      })
    });
    const data = await res.json();
    createdCardId = data.id;
    assert('16. User creates card successfully (201 Created)', res.status === 201, `Got ${res.status}`);
    assert('16. Created card has valid id', typeof createdCardId === 'string' && createdCardId.length > 0);
  }

  // Test 17: Update Card with Valid User Token (Allowed for Users)
  {
    const res = await fetch(`${BASE_URL}/api/cards/${createdCardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        priority: 'urgent',
        title: 'RBAC Task Card (Updated by User)'
      })
    });
    const data = await res.json();
    assert('17. User updates card priority (200 OK)', res.status === 200, `Got ${res.status}`);
    assert('17. Card priority updated to urgent', data.priority === 'urgent');
  }

  // Test 18: RBAC Delete Attempt by Regular User -> 403 Forbidden
  {
    const res = await fetch(`${BASE_URL}/api/cards/${createdCardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await res.json();
    assert('18. Regular user deleting card is 403 Forbidden', res.status === 403, `Got ${res.status}`);
    assert('18. Error message indicates Admin role requirement', String(data.message).includes('Admin'));
  }

  // Test 19: RBAC Delete Attempt by Admin -> 200 OK
  {
    const res = await fetch(`${BASE_URL}/api/cards/${createdCardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const data = await res.json();
    assert('19. Admin deleting card returns 200 OK', res.status === 200, `Got ${res.status}`);
    assert('19. Success confirmation returned', data.success === true);
  }

  // Test 20: Get Authenticated User Profile (/api/auth/me)
  {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await res.json();
    assert('20. /api/auth/me returns 200 OK', res.status === 200, `Got ${res.status}`);
    assert('20. Profile email matches registered user', data.email === testEmail);
    assert('20. Password is not exposed in profile', data.password === undefined);
  }

  // -----------------------------------------------------------------
  // Group 5: Rate Limiting
  // -----------------------------------------------------------------
  console.log('\n\x1b[36m[Group 5] Rate Limiting Verification\x1b[0m');

  // Test 21: Trigger IP Rate Limit (429 Too Many Requests)
  {
    let lastStatus = 200;
    // Spoof IP so we don't interfere with the main test suite limit.
    // The max limit is 100, so we send 101 requests.
    for (let i = 0; i < 101; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.99'
        },
        body: JSON.stringify({
          email: 'spam_user@rosetta.local',
          password: 'wrongpassword'
        })
      });
      lastStatus = res.status;
    }
    
    assert('21. Exceeding 100 login attempts returns 429 Too Many Requests', lastStatus === 429, `Got ${lastStatus}`);
  }

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  console.log(`\n======================================================`);
  console.log(`  Test Summary: ${passed} Passed, ${failed} Failed (${passed + failed} Total)`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('\nFatal test runner error:', err);
  process.exit(1);
});
