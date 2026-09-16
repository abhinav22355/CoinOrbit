const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');

// Import app components
const User = require('./models/User');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

let mongoServer;
let server;
let baseUrl;

async function runTests() {
  console.log('--- Starting CoinOrbit Backend Verification ---');
  process.env.JWT_SECRET = 'test_secret_key_12345';

  // 1. In-memory Mongo setup
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✓ Connected to MongoMemoryServer for isolated testing');

  // 2. Setup Express test app
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/budget', budgetRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use(notFound);
  app.use(errorHandler);

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}/api`;
  console.log(`✓ Test Express server listening on port ${port}`);

  // Test helpers using native fetch
  async function request(endpoint, options = {}) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  try {
    // 3. Register User A
    console.log('\n[Test 1] User Registration:');
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Abhinav',
        email: 'abhinav@example.com',
        password: 'password123',
      }),
    });
    if (regRes.status !== 201 || !regRes.data.token || regRes.data.user.password) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    }
    const tokenA = regRes.data.token;
    const userA = regRes.data.user;
    console.log('✓ User A registered successfully. Password not leaked in response.');

    // 4. Duplicate Registration
    const dupRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Abhinav Duplicate',
        email: 'abhinav@example.com',
        password: 'password123',
      }),
    });
    if (dupRes.status !== 400) {
      throw new Error(`Duplicate check failed: status ${dupRes.status}`);
    }
    console.log('✓ Duplicate email registration rejected with 400.');

    // 5. Short Password Check
    const shortPassRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Short',
        email: 'short@example.com',
        password: '123',
      }),
    });
    if (shortPassRes.status !== 400) {
      throw new Error('Short password was not rejected with 400');
    }
    console.log('✓ Short password rejected with 400.');

    // 6. Login User A
    console.log('\n[Test 2] User Login:');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'abhinav@example.com',
        password: 'password123',
      }),
    });
    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    console.log('✓ User A logged in successfully. Received valid JWT.');

    // 7. Wrong Password
    const wrongPassRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'abhinav@example.com',
        password: 'wrongpassword',
      }),
    });
    if (wrongPassRes.status !== 401) {
      throw new Error('Wrong password was not rejected with 401');
    }
    console.log('✓ Wrong password rejected with 401.');

    // 8. Protected route without token
    console.log('\n[Test 3] Authentication Middleware:');
    const noTokenRes = await request('/expenses');
    if (noTokenRes.status !== 401) {
      throw new Error(`Unauthenticated request returned status ${noTokenRes.status}`);
    }
    console.log('✓ Request without token correctly rejected with 401.');

    // 9. Register User B
    const regB = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
      }),
    });
    const tokenB = regB.data.token;
    console.log('✓ User B registered for multi-user security tests.');

    // 10. Add expenses for User A
    console.log('\n[Test 4] Expense CRUD & Validation:');
    const exp1 = await request('/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        amount: 450,
        category: 'Food',
        note: 'Lunch at Cafe',
        date: '2026-09-16T12:00:00Z',
      }),
    });
    if (exp1.status !== 201) throw new Error(`Add expense failed: ${JSON.stringify(exp1.data)}`);
    const expenseAId = exp1.data.data._id;
    console.log('✓ Expense 1 created: Food - ₹450');

    const exp2 = await request('/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        amount: 1200,
        category: 'Clothes',
        note: 'Blue Jeans',
        date: '2026-09-15T15:00:00Z',
      }),
    });
    if (exp2.status !== 201) throw new Error(`Add expense 2 failed: ${JSON.stringify(exp2.data)}`);
    console.log('✓ Expense 2 created: Clothes - ₹1200');

    const exp3 = await request('/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        amount: 350,
        category: 'Entertainment',
        note: 'Movie night',
        date: '2026-09-15T20:00:00Z',
      }),
    });
    if (exp3.status !== 201) throw new Error(`Add expense 3 failed: ${JSON.stringify(exp3.data)}`);
    console.log('✓ Expense 3 created: Entertainment - ₹350');

    // 11. Security Check: User B tries to view/modify User A's expense
    console.log('\n[Test 5] Security & User Ownership Isolation:');
    const crossView = await request(`/expenses/${expenseAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (crossView.status !== 403) {
      throw new Error(`Unauthorized cross-user view should return 403, got ${crossView.status}`);
    }
    console.log('✓ User B cannot view User A\'s expense (received 403 Forbidden).');

    const crossEdit = await request(`/expenses/${expenseAId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ amount: 9999 }),
    });
    if (crossEdit.status !== 403) {
      throw new Error(`Unauthorized cross-user edit should return 403, got ${crossEdit.status}`);
    }
    console.log('✓ User B cannot edit User A\'s expense (received 403 Forbidden).');

    // 12. Monthly Expenses & Filtering
    console.log('\n[Test 6] Monthly Query & Filtering:');
    const monthlyRes = await request('/expenses/monthly?month=9&year=2026', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (monthlyRes.status !== 200 || monthlyRes.data.data.length !== 3) {
      throw new Error(`Monthly query count mismatch: ${monthlyRes.data.data.length}`);
    }
    console.log(`✓ Monthly filter returned ${monthlyRes.data.data.length} expenses for September 2026.`);

    // 13. Search Filtering
    const searchRes = await request('/expenses?search=Jeans', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (searchRes.status !== 200 || searchRes.data.data.length !== 1) {
      throw new Error(`Search filter failed: ${JSON.stringify(searchRes.data)}`);
    }
    console.log('✓ Search by keyword "Jeans" returned exactly 1 matching expense.');

    // 14. Budget API
    console.log('\n[Test 7] Budget API:');
    const setBudgetRes = await request('/budget', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        month: 9,
        year: 2026,
        amount: 20000,
      }),
    });
    if (setBudgetRes.status !== 200 || setBudgetRes.data.data.amount !== 20000) {
      throw new Error(`Set budget failed: ${JSON.stringify(setBudgetRes.data)}`);
    }
    console.log('✓ Monthly budget set to ₹20,000 for September 2026.');

    const getBudgetRes = await request('/budget?month=9&year=2026', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (getBudgetRes.status !== 200 || getBudgetRes.data.data.amount !== 20000) {
      throw new Error(`Get budget failed: ${JSON.stringify(getBudgetRes.data)}`);
    }
    console.log('✓ Monthly budget retrieved successfully.');

    // 15. Analytics API
    console.log('\n[Test 8] Analytics API:');
    const analyticsRes = await request('/analytics/monthly?month=9&year=2026', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (analyticsRes.status !== 200) {
      throw new Error(`Analytics failed: ${JSON.stringify(analyticsRes.data)}`);
    }
    const analytics = analyticsRes.data;
    console.log('Analytics Response:', JSON.stringify(analytics, null, 2));

    // Expected total: 450 + 1200 + 350 = 2000
    if (analytics.total !== 2000) throw new Error(`Total expected 2000, got ${analytics.total}`);
    if (analytics.categoryTotals.Food !== 450) throw new Error('Food total mismatch');
    if (analytics.categoryTotals.Clothes !== 1200) throw new Error('Clothes total mismatch');
    if (analytics.categoryTotals.Entertainment !== 350) throw new Error('Entertainment total mismatch');
    if (analytics.highestExpense !== 1200) throw new Error('Highest expense mismatch');
    if (analytics.highestSpendingDay !== '2026-09-15') throw new Error(`Highest spending day mismatch: ${analytics.highestSpendingDay}`);
    if (analytics.remainingBudget !== 18000) throw new Error('Remaining budget mismatch');
    if (analytics.budgetPercentage !== 10.0) throw new Error(`Budget percentage mismatch: ${analytics.budgetPercentage}`);
    console.log('✓ All analytics calculations verified with 100% precision.');

    console.log('\n=============================================');
    console.log('✓ ALL BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================\n');
  } finally {
    if (server) server.close();
    if (mongoose.connection) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
