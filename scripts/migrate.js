const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');

const migrationsDir = path.join(__dirname, '..', 'sql', 'migrations');
const maxAttempts = Number(process.env.MIGRATE_MAX_ATTEMPTS || 20);
const retryDelayMs = Number(process.env.MIGRATE_RETRY_DELAY_MS || 1500);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createPool() {
  return new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

async function waitForDatabase(pool) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      console.log(`Banco indisponivel. Tentando novamente (${attempt}/${maxAttempts})...`);
      await sleep(retryDelayMs);
    }
  }
}

async function ensureControlTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function loadAppliedMigrations(pool) {
  const result = await pool.query('SELECT filename FROM schema_migrations');

  return new Set(result.rows.map((row) => row.filename));
}

async function loadMigrationFiles() {
  const entries = await fs.readdir(migrationsDir);

  return entries
    .filter((entry) => entry.endsWith('.sql'))
    .sort();
}

async function applyMigration(pool, filename) {
  const fullPath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(fullPath, 'utf8');

  await pool.query('BEGIN');

  try {
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    await pool.query('COMMIT');
    console.log(`Migration aplicada: ${filename}`);
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

async function migrate() {
  const pool = createPool();

  try {
    await waitForDatabase(pool);
    await ensureControlTable(pool);

    const applied = await loadAppliedMigrations(pool);
    const files = await loadMigrationFiles();
    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('Nenhuma migration pendente.');
      return;
    }

    for (const filename of pending) {
      await applyMigration(pool, filename);
    }
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Falha ao aplicar migrations.');
  console.error(error);
  process.exit(1);
});
