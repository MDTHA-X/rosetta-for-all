async function runBruteForce() {
  const url = 'http://localhost:3000/api/auth/login';
  const totalRequests = 105; // We want to exceed 100 to see the 429 Error
  let blockedCount = 0;
  let successCount = 0;

  console.log(`🚀 Starting Brute Force Test: Sending ${totalRequests} login requests to ${url}...`);
  console.log(`========================================================================\n`);

  for (let i = 1; i <= totalRequests; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'spam@rosetta.local', password: 'wrongpassword' })
      });

      if (res.status === 429) {
        blockedCount++;
        console.log(`[Request ${i}] 🛑 BLOCKED - 429 Too Many Requests`);
      } else {
        successCount++;
        const remaining = res.headers.get('ratelimit-remaining');
        console.log(`[Request ${i}] 🟢 ALLOWED - Status: ${res.status} (Remaining: ${remaining})`);
      }
    } catch (error) {
      console.log(`[Request ${i}] ❌ ERROR - Server might be down or unreachable`);
    }
  }

  console.log(`\n========================================================================`);
  console.log(`🏁 Test Complete!`);
  console.log(`🟢 Allowed Requests: ${successCount}`);
  console.log(`🛑 Blocked Requests: ${blockedCount}`);
  if (blockedCount > 0) {
    console.log(`\n✅ Rate limiter is working perfectly!`);
  } else {
    console.log(`\n⚠️ Rate limiter did NOT trigger. Ensure your server is running and the limit is set to 100.`);
  }
}

runBruteForce();
