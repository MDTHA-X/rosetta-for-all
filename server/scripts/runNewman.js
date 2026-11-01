// server/scripts/runNewman.js
const newman = require('newman');
const path = require('path');
const http = require('http');
const { startServer } = require('../server');

async function testRateLimiting(baseUrl) {
  console.log('\n--- Testing Authentication Rate Limiting (10 req/3 min) ---');
  let rateLimitedHit = false;
  let statusCodes = [];

  for (let i = 1; i <= 12; i++) {
    const res = await new Promise((resolve, reject) => {
      const data = JSON.stringify({ username: 'rate_test', password: 'bad' });
      const req = http.request(
        `${baseUrl}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, body }));
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    statusCodes.push(res.status);
    if (res.status === 429) {
      rateLimitedHit = true;
      console.log(`[RateLimit Test] Request #${i}: Successfully triggered 429 Too Many Requests!`);
      break;
    } else {
      console.log(`[RateLimit Test] Request #${i}: Status ${res.status}`);
    }
  }

  if (!rateLimitedHit) {
    throw new Error('Rate limiting failed to trigger 429 Too Many Requests after 10 requests');
  }
  console.log('✅ Rate Limiting Verification Passed!\n');
}

async function main() {
  console.log('[Runner] Booting server for Newman test suite...');
  const server = await startServer();
  const PORT = process.env.PORT || 5001;
  const baseUrl = `http://127.0.0.1:${PORT}/api`;

  const collectionPath = path.resolve(__dirname, '../../postman/rosetta_collection.json');
  const envPath = path.resolve(__dirname, '../../postman/rosetta_environment.json');

  newman.run(
    {
      collection: require(collectionPath),
      environment: require(envPath),
      reporters: 'cli',
      reporter: {
        cli: {
          noBanner: true,
          noSummary: false,
        },
      },
    },
    async (err, summary) => {
      let exitCode = 0;

      if (err || summary.run.failures.length > 0) {
        console.error('❌ Newman tests encountered failures!');
        exitCode = 1;
      } else {
        console.log('✅ All Newman collection tests passed successfully!');

        // Now run the rate limiting test
        try {
          await testRateLimiting(baseUrl);
        } catch (rlErr) {
          console.error('❌ Rate limit verification failed:', rlErr.message);
          exitCode = 1;
        }
      }

      server.close(() => {
        console.log('[Runner] Test server stopped.');
        process.exit(exitCode);
      });
    }
  );
}

main().catch((err) => {
  console.error('[Runner] Fatal Error:', err);
  process.exit(1);
});
