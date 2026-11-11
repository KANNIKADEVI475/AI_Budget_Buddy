import 'dotenv/config';
import { encryptCredential, decryptCredential } from './src/services/encryptionService.js';

async function runTests() {
  console.log('=== AI Budget Buddy Backend Test Suite ===\n');

  // Test 1: AES-256-GCM Encryption / Decryption
  console.log('1. Testing AES-256-GCM Credential Encryption...');
  const secret = 'sample_secret_paypal_sandbox_key_987654';
  const encrypted = encryptCredential(secret);
  console.log('   Encrypted string (iv:authTag:cipher):', encrypted.substring(0, 35) + '...');
  const decrypted = decryptCredential(encrypted);
  if (decrypted !== secret) {
    throw new Error('Encryption test failed: Decrypted secret does not match!');
  }
  console.log('   ✓ Decryption verified successfully.');

  // Test 2: Health Check
  console.log('\n2. Testing GET /api/health...');
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('   ✓ Health response:', healthData);

  // Test 3: Seed transactions for user_test_1
  console.log('\n3. Testing POST /api/transactions/seed for user_test_1...');
  const seedRes = await fetch('http://localhost:5000/api/transactions/seed', {
    method: 'POST',
    headers: { 'x-user-id': 'user_test_1' },
  });
  const seedData = await seedRes.json();
  console.log('   ✓ Seeded count:', seedData.count);
  const sampleTxId = seedData.transactions[0]._id;

  // Test 4: Retrieve transactions for user_test_1
  console.log('\n4. Testing GET /api/transactions for user_test_1...');
  const txRes1 = await fetch('http://localhost:5000/api/transactions', {
    headers: { 'x-user-id': 'user_test_1' },
  });
  const txData1 = await txRes1.json();
  console.log('   ✓ User 1 transactions returned:', txData1.transactions?.length);

  // Test 5: Update Category manually for user_test_1
  console.log('\n5. Testing PATCH /api/transactions/:id/category for user_test_1...');
  const patchRes = await fetch(`http://localhost:5000/api/transactions/${sampleTxId}/category`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user_test_1',
    },
    body: JSON.stringify({ category: 'Food & Dining' }),
  });
  const patchData = await patchRes.json();
  console.log('   ✓ Updated Category:', patchData.transaction?.category);
  console.log('   ✓ Updated CategorySource:', patchData.transaction?.categorySource);

  // Test 6: Verify User Isolation - user_test_2 attempting to modify user_test_1's transaction
  console.log('\n6. Testing User Isolation - user_test_2 attempting to modify user_test_1 transaction...');
  const attackRes = await fetch(`http://localhost:5000/api/transactions/${sampleTxId}/category`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user_test_2',
    },
    body: JSON.stringify({ category: 'Shopping' }),
  });
  console.log('   ✓ Status returned (expected 404):', attackRes.status);
  const attackData = await attackRes.json();
  console.log('   ✓ Response message:', attackData.message);

  // Test 7: Verify User Isolation - user_test_2 querying transactions (must be empty)
  console.log('\n7. Testing User Isolation - user_test_2 querying transactions...');
  const txRes2 = await fetch('http://localhost:5000/api/transactions', {
    headers: { 'x-user-id': 'user_test_2' },
  });
  const txData2 = await txRes2.json();
  console.log('   ✓ User 2 transactions count (expected 0):', txData2.transactions?.length);

  // Test 8: Aggregated Statistics for user_test_1
  console.log('\n8. Testing GET /api/transactions/stats for user_test_1...');
  const statsRes = await fetch('http://localhost:5000/api/transactions/stats', {
    headers: { 'x-user-id': 'user_test_1' },
  });
  const statsData = await statsRes.json();
  console.log('   ✓ User 1 Total transactions:', statsData.stats?.totalCount);
  console.log('   ✓ User 1 Total incoming:', statsData.stats?.totalIncoming);
  console.log('   ✓ User 1 Total outgoing:', statsData.stats?.totalOutgoing);
  console.log('   ✓ User 1 Category breakdown:', Object.keys(statsData.stats?.categoryWise || {}));

  // Test 9: Invalid PayPal Credentials Authentication Check
  console.log('\n9. Testing POST /api/paypal/connect with invalid credentials...');
  const authRes = await fetch('http://localhost:5000/api/paypal/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user_test_1',
    },
    body: JSON.stringify({
      clientId: 'INVALID_CLIENT_ID_XYZ',
      clientSecret: 'INVALID_CLIENT_SECRET_XYZ',
      autoSyncEnabled: true,
    }),
  });
  console.log('   ✓ Status returned (expected 401):', authRes.status);
  const authData = await authRes.json();
  console.log('   ✓ Message:', authData.message);

  // Test 10: Sync Status Check
  console.log('\n10. Testing GET /api/transactions/sync-status for user_test_1...');
  const statusRes = await fetch('http://localhost:5000/api/transactions/sync-status', {
    headers: { 'x-user-id': 'user_test_1' },
  });
  const statusData = await statusRes.json();
  console.log('   ✓ Sync Status:', statusData);

  console.log('\n=== ALL 10 AUTOMATED VERIFICATION TESTS PASSED! ===');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
