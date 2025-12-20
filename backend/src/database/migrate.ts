import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import pool from './connection';

interface Migration {
  name: string;
  sql: string;
}

async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await pool.query('SELECT name FROM migrations ORDER BY name');
    return result.rows.map((row) => row.name);
  } catch (error) {
    // If migrations table doesn't exist, return empty array
    if ((error as any).code === '42P01') {
      return [];
    }
    throw error;
  }
}

async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = join(__dirname, 'migrations');
  const files = await readdir(migrationsDir);
  const sqlFiles = files
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const migrations: Migration[] = [];

  for (const file of sqlFiles) {
    const sql = await readFile(join(migrationsDir, file), 'utf-8');
    migrations.push({
      name: file,
      sql,
    });
  }

  return migrations;
}

async function applyMigration(name: string, sql: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`✓ Applied migration: ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations(): Promise<void> {
  try {
    console.log('Starting database migrations...');
    
    const appliedMigrations = await getAppliedMigrations();
    const allMigrations = await loadMigrations();

    const pendingMigrations = allMigrations.filter(
      (migration) => !appliedMigrations.includes(migration.name)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s)`);

    for (const migration of pendingMigrations) {
      await applyMigration(migration.name, migration.sql);
    }

    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };

