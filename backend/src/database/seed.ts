import pool from './connection';
import { hashPassword } from '../auth/password';
import {
  generateUser,
  generateAccount,
  generateTransactionsForAccount,
} from '../mock/generators';

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Starting database seed...');

    // Clear existing data (in reverse order of dependencies)
    // Delete from tables with foreign keys first
    await client.query('DELETE FROM scheduled_transfers');
    await client.query('DELETE FROM alerts');
    await client.query('DELETE FROM goals');
    await client.query('DELETE FROM transactions');
    await client.query('DELETE FROM accounts');
    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM users');

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await generateUser('admin');
    const adminResult = await client.query(
      `INSERT INTO users (email, password_hash, name, role, avatar)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         avatar = EXCLUDED.avatar
       RETURNING id, email, name, role, avatar`,
      [adminUser.email, adminUser.passwordHash, adminUser.name, adminUser.role, adminUser.avatar]
    );
    const adminId = adminResult.rows[0].id;
    console.log(`Created admin user: ${adminUser.email} (password: password123)`);

    // Create regular users
    const users = [];
    const usedEmails = new Set<string>();
    usedEmails.add(adminUser.email); // Track admin email to avoid duplicates
    
    for (let i = 0; i < 4; i++) {
      let user;
      let attempts = 0;
      // Generate unique email (retry if duplicate)
      do {
        user = await generateUser('user');
        attempts++;
        if (attempts > 10) {
          // Fallback: add timestamp to ensure uniqueness
          const timestamp = Date.now();
          user.email = user.email.replace('@', `+${timestamp}@`);
        }
      } while (usedEmails.has(user.email) && attempts <= 10);
      
      usedEmails.add(user.email);
      
      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, role, avatar)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, email, name, role, avatar`,
        [user.email, user.passwordHash, user.name, user.role, user.avatar]
      );
      
      if (result.rows.length > 0) {
        users.push({ ...result.rows[0], password: 'password123' });
      }
    }
    console.log(`Created ${users.length} regular users`);

    // Create accounts for each user
    const allAccounts = [];
    for (const user of [adminResult.rows[0], ...users]) {
      const accountCount = Math.floor(Math.random() * 2) + 3; // 3-4 accounts per user
      for (let i = 0; i < accountCount; i++) {
        const accountData = generateAccount(user.id, i);
        const accountResult = await client.query(
          `INSERT INTO accounts (user_id, name, type, balance, currency, status, account_number, "limit")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, user_id, name, type, balance, currency, status, account_number, "limit"`,
          [
            accountData.userId,
            accountData.name,
            accountData.type,
            accountData.balance,
            accountData.currency,
            accountData.status,
            accountData.accountNumber,
            accountData.limit,
          ]
        );
        allAccounts.push(accountResult.rows[0]);
      }
    }
    console.log(`Created ${allAccounts.length} accounts`);

    // Create transactions for each account
    let totalTransactions = 0;
    for (const account of allAccounts) {
      if (account.status === 'active') {
        const transactionCount = Math.floor(Math.random() * 20) + 10; // 10-30 transactions
        const transactions = generateTransactionsForAccount(
          account.id,
          transactionCount,
          new Date()
        );

        for (const transaction of transactions) {
          await client.query(
            `INSERT INTO transactions (account_id, date, merchant, category, amount, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              transaction.accountId,
              transaction.date,
              transaction.merchant,
              transaction.category,
              transaction.amount,
              transaction.status,
            ]
          );
        }
        totalTransactions += transactions.length;

        // Update account balance based on completed transactions
        const balanceResult = await client.query(
          `SELECT SUM(amount) as total FROM transactions 
           WHERE account_id = $1 AND status = 'completed'`,
          [account.id]
        );
        const newBalance = parseFloat(balanceResult.rows[0].total || '0');
        await client.query(
          'UPDATE accounts SET balance = $1 WHERE id = $2',
          [Math.max(0, newBalance), account.id]
        );
      }
    }
    console.log(`Created ${totalTransactions} transactions`);

    // Create some audit logs
    const auditActions = [
      'User Login',
      'Transaction Created',
      'Account Status Changed',
      'User Created',
      'Password Reset',
      'Failed Login Attempt',
    ];

    for (let i = 0; i < 10; i++) {
      const action = auditActions[Math.floor(Math.random() * auditActions.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      await client.query(
        `INSERT INTO audit_logs (user_id, action, details, timestamp)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP - INTERVAL '${i} days')`,
        [
          user.id,
          action,
          `Sample audit log entry for ${action}`,
        ]
      );
    }
    console.log('Created audit logs');

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log(`Admin: ${adminUser.email} / password123`);
    console.log(`Users: ${users.map(u => u.email).join(', ')} / password123`);
    
    // Fetch updated accounts with final balances after transactions
    const updatedAccountsResult = await client.query(
      `SELECT a.id, a.user_id, a.name, a.type, a.balance, a.account_number, a.status, u.email, u.name as user_name
       FROM accounts a
       JOIN users u ON a.user_id = u.id
       ORDER BY u.email, a.name`
    );
    const updatedAccounts = updatedAccountsResult.rows;
    
    // Display accounts for each user
    console.log('\n=== User Accounts ===');
    
    // Get admin accounts
    const adminAccounts = updatedAccounts.filter(acc => acc.user_id === adminId);
    console.log(`\nAdmin (${adminUser.email}):`);
    adminAccounts.forEach((account, index) => {
      const balance = parseFloat(account.balance).toFixed(2);
      const status = account.status === 'active' ? '✓' : account.status;
      console.log(`  ${index + 1}. ${account.name} (${account.type}) - ${account.account_number} - Balance: $${balance} [${status}]`);
    });
    
    // Get accounts for each regular user
    const userEmails = [...new Set(users.map(u => u.email))];
    for (const email of userEmails) {
      const user = users.find(u => u.email === email);
      if (user) {
        const userAccounts = updatedAccounts.filter(acc => acc.user_id === user.id);
        console.log(`\nUser (${email}):`);
        userAccounts.forEach((account, index) => {
          const balance = parseFloat(account.balance).toFixed(2);
          const status = account.status === 'active' ? '✓' : account.status;
          console.log(`  ${index + 1}. ${account.name} (${account.type}) - ${account.account_number} - Balance: $${balance} [${status}]`);
        });
      }
    }
    
    console.log('\n=== Transfer Testing ===');
    console.log('To transfer funds to another user, use their account number (e.g., ****1234 or just 1234)');
    console.log('Only active accounts (marked with ✓) can receive transfers.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };

