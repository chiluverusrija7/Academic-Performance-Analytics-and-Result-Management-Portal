const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'EduInsight',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Auto-sync sequence generators with actual max IDs in tables
async function syncSequences() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND column_default LIKE 'nextval(%'
    `);
    for (const row of res.rows) {
      const match = row.column_default.match(/nextval\('"?([^'"]+)"?'/);
      if (match && match[1]) {
        const seqName = match[1];
        await pool.query(`SELECT setval('${seqName}', COALESCE((SELECT MAX(${row.column_name}) FROM ${row.table_name}), 1))`);
      }
    }
    console.log('PostgreSQL sequence counters verified and synchronized.');
  } catch (err) {
    console.warn('Sequence sync warning:', err.message);
  }
}
syncSequences();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  syncSequences,
};

