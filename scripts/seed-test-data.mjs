/**
 * Coinly Test Data Seeder
 * Creates a test account and populates it with realistic dummy transactions.
 *
 * Usage:
 *   node scripts/seed-test-data.mjs
 *
 * Test credentials:
 *   Email:    test@coinly.app
 *   Password: TestCoinly123!
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dbjozeozeuxvzsisqulj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiam96ZW96ZXV4dnpzaXNxdWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDQ3NTQsImV4cCI6MjA4OTI4MDc1NH0.8XuWhMGETMl0HJkf_jNL_s1hRv0cU7woLUt4EGoe9dg'
// Optional: set SUPABASE_SERVICE_ROLE_KEY env var to skip email confirmation
// Get it from: https://supabase.com/dashboard/project/dbjozeozeuxvzsisqulj/settings/api
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || null

const TEST_EMAIL = 'test@coinly.app'
const TEST_PASSWORD = 'TestCoinly123!'
const TEST_NAME = 'Test User'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
// Admin client (only available if SERVICE_ROLE_KEY is provided)
const supabaseAdmin = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null

// Helper: date string N days from today
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// Realistic dummy transactions (60 entries, ~6 months of data)
function buildTransactions(userId) {
  return [
    // ── INCOME ──────────────────────────────────────────────
    { user_id: userId, amount: 4500, type: 'income', category: 'Salary', description: 'Monthly Salary - March', date: daysAgo(2), notes: 'Direct deposit from employer' },
    { user_id: userId, amount: 4500, type: 'income', category: 'Salary', description: 'Monthly Salary - February', date: daysAgo(32), notes: null },
    { user_id: userId, amount: 4500, type: 'income', category: 'Salary', description: 'Monthly Salary - January', date: daysAgo(62), notes: null },
    { user_id: userId, amount: 4500, type: 'income', category: 'Salary', description: 'Monthly Salary - December', date: daysAgo(92), notes: null },
    { user_id: userId, amount: 4200, type: 'income', category: 'Salary', description: 'Monthly Salary - November', date: daysAgo(122), notes: null },
    { user_id: userId, amount: 4200, type: 'income', category: 'Salary', description: 'Monthly Salary - October', date: daysAgo(152), notes: null },
    { user_id: userId, amount: 850, type: 'income', category: 'Freelance', description: 'Logo design project', date: daysAgo(5), notes: 'Client: Acme Corp' },
    { user_id: userId, amount: 1200, type: 'income', category: 'Freelance', description: 'Website development', date: daysAgo(18), notes: 'Milestone 2 of 3' },
    { user_id: userId, amount: 600, type: 'income', category: 'Freelance', description: 'UI Consultation', date: daysAgo(45), notes: null },
    { user_id: userId, amount: 250, type: 'income', category: 'Investments', description: 'Stock dividends - Q1', date: daysAgo(10), notes: 'AAPL + MSFT' },
    { user_id: userId, amount: 180, type: 'income', category: 'Investments', description: 'ETF dividend payout', date: daysAgo(40), notes: 'VOO dividend' },
    { user_id: userId, amount: 75, type: 'income', category: 'Other Income', description: 'Cashback reward', date: daysAgo(8), notes: 'Credit card annual cashback' },
    { user_id: userId, amount: 320, type: 'income', category: 'Other Income', description: 'Sold old laptop', date: daysAgo(55), notes: 'Sold on Craigslist' },

    // ── FOOD & DINING ─────────────────────────────────────────
    { user_id: userId, amount: -12.50, type: 'expense', category: 'Food & Dining', description: 'Starbucks coffee', date: daysAgo(1), notes: null },
    { user_id: userId, amount: -68.40, type: 'expense', category: 'Food & Dining', description: 'Weekly grocery run', date: daysAgo(3), notes: 'Whole Foods' },
    { user_id: userId, amount: -24.80, type: 'expense', category: 'Food & Dining', description: 'Dinner with friends', date: daysAgo(4), notes: 'Thai Garden restaurant' },
    { user_id: userId, amount: -9.99, type: 'expense', category: 'Food & Dining', description: 'Lunch – Chipotle', date: daysAgo(6), notes: null },
    { user_id: userId, amount: -52.30, type: 'expense', category: 'Food & Dining', description: 'Grocery shopping', date: daysAgo(10), notes: 'Trader Joes' },
    { user_id: userId, amount: -34.60, type: 'expense', category: 'Food & Dining', description: 'Date night dinner', date: daysAgo(15), notes: 'Italian place downtown' },
    { user_id: userId, amount: -7.50, type: 'expense', category: 'Food & Dining', description: 'Morning coffee + bagel', date: daysAgo(20), notes: null },
    { user_id: userId, amount: -89.20, type: 'expense', category: 'Food & Dining', description: 'Weekly groceries', date: daysAgo(24), notes: 'Costco run' },
    { user_id: userId, amount: -16.40, type: 'expense', category: 'Food & Dining', description: 'Pizza delivery', date: daysAgo(28), notes: null },

    // ── HOUSING ───────────────────────────────────────────────
    { user_id: userId, amount: -1450, type: 'expense', category: 'Housing', description: 'March rent', date: daysAgo(2), notes: '2BR apartment' },
    { user_id: userId, amount: -1450, type: 'expense', category: 'Housing', description: 'February rent', date: daysAgo(32), notes: null },
    { user_id: userId, amount: -1450, type: 'expense', category: 'Housing', description: 'January rent', date: daysAgo(62), notes: null },
    { user_id: userId, amount: -1450, type: 'expense', category: 'Housing', description: 'December rent', date: daysAgo(92), notes: null },
    { user_id: userId, amount: -120, type: 'expense', category: 'Housing', description: 'Electricity bill', date: daysAgo(14), notes: 'PG&E - February' },
    { user_id: userId, amount: -45, type: 'expense', category: 'Housing', description: 'Water & sewage', date: daysAgo(14), notes: null },
    { user_id: userId, amount: -89, type: 'expense', category: 'Housing', description: 'Internet bill', date: daysAgo(7), notes: 'Comcast Xfinity' },

    // ── TRANSPORT ─────────────────────────────────────────────
    { user_id: userId, amount: -48.60, type: 'expense', category: 'Transport', description: 'Gas fill-up', date: daysAgo(5), notes: null },
    { user_id: userId, amount: -12.30, type: 'expense', category: 'Transport', description: 'Uber ride – airport', date: daysAgo(9), notes: null },
    { user_id: userId, amount: -160, type: 'expense', category: 'Transport', description: 'Monthly parking permit', date: daysAgo(3), notes: 'Downtown garage' },
    { user_id: userId, amount: -38.50, type: 'expense', category: 'Transport', description: 'Gas station', date: daysAgo(22), notes: null },
    { user_id: userId, amount: -250, type: 'expense', category: 'Transport', description: 'Car insurance – monthly', date: daysAgo(5), notes: 'State Farm' },

    // ── SHOPPING ──────────────────────────────────────────────
    { user_id: userId, amount: -79.99, type: 'expense', category: 'Shopping', description: 'Running shoes', date: daysAgo(7), notes: 'Nike Air Zoom' },
    { user_id: userId, amount: -34.99, type: 'expense', category: 'Shopping', description: 'Amazon – household items', date: daysAgo(11), notes: null },
    { user_id: userId, amount: -129.00, type: 'expense', category: 'Shopping', description: 'Winter jacket', date: daysAgo(85), notes: 'North Face sale' },
    { user_id: userId, amount: -19.99, type: 'expense', category: 'Shopping', description: 'Book – Atomic Habits', date: daysAgo(30), notes: null },
    { user_id: userId, amount: -249.00, type: 'expense', category: 'Shopping', description: 'AirPods Pro', date: daysAgo(50), notes: 'Black Friday deal' },

    // ── ENTERTAINMENT ─────────────────────────────────────────
    { user_id: userId, amount: -15.99, type: 'expense', category: 'Entertainment', description: 'Netflix subscription', date: daysAgo(5), notes: null },
    { user_id: userId, amount: -10.99, type: 'expense', category: 'Entertainment', description: 'Spotify Premium', date: daysAgo(5), notes: null },
    { user_id: userId, amount: -59.99, type: 'expense', category: 'Entertainment', description: 'Concert tickets', date: daysAgo(13), notes: 'Local jazz festival' },
    { user_id: userId, amount: -14.99, type: 'expense', category: 'Entertainment', description: 'Disney+ subscription', date: daysAgo(5), notes: null },
    { user_id: userId, amount: -24.00, type: 'expense', category: 'Entertainment', description: 'Movie night – 2 tickets', date: daysAgo(19), notes: null },

    // ── HEALTH ────────────────────────────────────────────────
    { user_id: userId, amount: -45.00, type: 'expense', category: 'Health & Fitness', description: 'Gym membership', date: daysAgo(4), notes: 'Planet Fitness monthly' },
    { user_id: userId, amount: -28.50, type: 'expense', category: 'Health & Fitness', description: 'Pharmacy – vitamins', date: daysAgo(16), notes: null },
    { user_id: userId, amount: -150.00, type: 'expense', category: 'Health & Fitness', description: 'Dentist co-pay', date: daysAgo(42), notes: 'Annual cleaning' },
    { user_id: userId, amount: -75.00, type: 'expense', category: 'Health & Fitness', description: 'Doctor visit co-pay', date: daysAgo(70), notes: null },

    // ── EDUCATION ─────────────────────────────────────────────
    { user_id: userId, amount: -29.99, type: 'expense', category: 'Education', description: 'Udemy course – React Advanced', date: daysAgo(25), notes: null },
    { user_id: userId, amount: -12.00, type: 'expense', category: 'Education', description: 'O\'Reilly subscription', date: daysAgo(5), notes: 'Monthly tech books' },

    // ── TRAVEL ────────────────────────────────────────────────
    { user_id: userId, amount: -420.00, type: 'expense', category: 'Travel', description: 'Flight – NYC round trip', date: daysAgo(60), notes: 'Spring break trip' },
    { user_id: userId, amount: -340.00, type: 'expense', category: 'Travel', description: 'Hotel – 2 nights', date: daysAgo(58), notes: 'Marriott downtown NYC' },
    { user_id: userId, amount: -85.00, type: 'expense', category: 'Travel', description: 'Restaurants & activities', date: daysAgo(57), notes: 'NYC trip spending' },

    // ── SAVINGS ───────────────────────────────────────────────
    { user_id: userId, amount: -500, type: 'expense', category: 'Savings', description: 'Emergency fund transfer', date: daysAgo(3), notes: 'Monthly savings goal' },
    { user_id: userId, amount: -300, type: 'expense', category: 'Savings', description: 'Investment contribution', date: daysAgo(3), notes: 'Roth IRA' },
  ]
}

async function seed() {
  console.log('🌱 Coinly Test Data Seeder\n')

  // 1. Try to sign in first (account may already exist)
  console.log('📧 Attempting sign-in with test account...')
  let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  let userId

  if (signInError) {
    if (supabaseAdmin) {
      // Use admin API to create a pre-confirmed user
      console.log('   Using admin API to create pre-confirmed account...')
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: TEST_NAME, currency: 'USD' },
      })

      if (adminError) {
        // User may already exist unconfirmed — try to confirm them
        if (adminError.message.includes('already been registered')) {
          console.log('   User exists, looking up to confirm...')
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
          const existing = listData?.users?.find(u => u.email === TEST_EMAIL)
          if (existing) {
            await supabaseAdmin.auth.admin.updateUserById(existing.id, { email_confirm: true })
            // Now sign in
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD })
            if (retryError) { console.error('❌', retryError.message); process.exit(1) }
            userId = retryData.session.user.id
            console.log('✅ Existing account confirmed and signed in!')
          }
        } else {
          console.error('❌ Admin create failed:', adminError.message)
          process.exit(1)
        }
      } else {
        userId = adminData.user.id
        // Sign in to get session for RLS
        const { data: retryData } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD })
        if (retryData?.session) userId = retryData.session.user.id
        console.log('✅ Account created via admin API!')
      }
    } else {
      // No admin key — try creating normally
      console.log('   Account not found, creating...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        options: { data: { full_name: TEST_NAME, currency: 'USD' } },
      })

      if (signUpError) {
        console.error('❌ Failed to create account:', signUpError.message)
        process.exit(1)
      }

      if (!signUpData.session) {
        console.log('\n⚠️  Email confirmation is enabled on your Supabase project.')
        console.log('\n   To fix this, choose ONE of these options:\n')
        console.log('   Option A — Disable email confirmation (easiest):')
        console.log('   👉 https://supabase.com/dashboard/project/dbjozeozeuxvzsisqulj/auth/providers')
        console.log('      → "Email" → toggle OFF "Confirm email"\n')
        console.log('   Option B — Manually confirm the test user:')
        console.log('   👉 https://supabase.com/dashboard/project/dbjozeozeuxvzsisqulj/auth/users')
        console.log('      → find test@coinly.app → click ⋯ → "Confirm email"\n')
        console.log('   Option C — Provide your service role key:')
        console.log('   👉 https://supabase.com/dashboard/project/dbjozeozeuxvzsisqulj/settings/api')
        console.log('      → copy "service_role" key → run:')
        console.log('      SUPABASE_SERVICE_ROLE_KEY=your-key node scripts/seed-test-data.mjs\n')
        console.log('   After fixing, re-run this script.')
        console.log('\n   Account created (awaiting confirmation):')
        console.log(`   Email:    ${TEST_EMAIL}`)
        console.log(`   Password: ${TEST_PASSWORD}`)
        process.exit(0)
      }

      userId = signUpData.session.user.id
      console.log('✅ Account created!')
    }
  } else {
    userId = signInData.session.user.id
    console.log('✅ Signed in successfully!')
  }

  console.log(`   User ID: ${userId}\n`)

  // 2. Clear existing transactions for this user (fresh slate)
  console.log('🗑  Clearing existing transactions...')
  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('❌ Failed to clear transactions:', deleteError.message)
  } else {
    console.log('   Done.\n')
  }

  // 3. Insert dummy transactions
  const transactions = buildTransactions(userId).map(t => ({
    ...t,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  console.log(`📝 Inserting ${transactions.length} dummy transactions...`)

  const { data: inserted, error: insertError } = await supabase
    .from('transactions')
    .insert(transactions)
    .select()

  if (insertError) {
    console.error('❌ Failed to insert transactions:', insertError.message)
    process.exit(1)
  }

  console.log(`✅ Inserted ${inserted.length} transactions!\n`)

  // 4. Summary
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
  const categories = [...new Set(transactions.map(t => t.category))]

  console.log('📊 Summary:')
  console.log(`   Total transactions: ${transactions.length}`)
  console.log(`   Total income:       $${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  console.log(`   Total expenses:     $${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  console.log(`   Balance:            $${(income - expenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  console.log(`   Categories:         ${categories.join(', ')}`)

  console.log('\n🎉 Test account ready!')
  console.log('─'.repeat(40))
  console.log(`   URL:      http://localhost:5173/login`)
  console.log(`   Email:    ${TEST_EMAIL}`)
  console.log(`   Password: ${TEST_PASSWORD}`)
  console.log('─'.repeat(40))
}

seed()
