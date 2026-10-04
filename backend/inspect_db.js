const { pool } = require('./config/db');

async function runInspection() {
  const client = await pool.connect();
  try {
    console.log('Connected successfully to PostgreSQL database: EduInsight\n');

    // 1. Get all tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tableNames.length} tables in database EduInsight:`, tableNames.join(', '));
    console.log('--------------------------------------------------\n');

    const schemaReport = {};

    for (const tableName of tableNames) {
      console.log(`>>> Inspecting Table: "${tableName}"`);

      // Record count
      const countRes = await client.query(`SELECT COUNT(*) AS total FROM "${tableName}";`);
      const rowCount = parseInt(countRes.rows[0].total, 10);

      // Columns and data types, nullability, defaults
      const colsRes = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          udt_name,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          is_nullable, 
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      // Primary keys
      const pkRes = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1
        ORDER BY kcu.ordinal_position;
      `, [tableName]);
      const primaryKeys = pkRes.rows.map(r => r.column_name);

      // Foreign keys
      const fkRes = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.update_rule,
          rc.delete_rule,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1;
      `, [tableName]);

      // Unique constraints
      const uqRes = await client.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'UNIQUE'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1;
      `, [tableName]);

      // Check constraints
      const chkRes = await client.query(`
        SELECT
          tc.constraint_name,
          cc.check_clause
        FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc
          ON tc.constraint_name = cc.constraint_name
        WHERE tc.constraint_type = 'CHECK'
          AND tc.table_schema = 'public'
          AND tc.table_name = $1;
      `, [tableName]);

      // Sample records (up to 5)
      const sampleRes = await client.query(`SELECT * FROM "${tableName}" LIMIT 5;`);

      schemaReport[tableName] = {
        tableName,
        rowCount,
        columns: colsRes.rows,
        primaryKeys,
        foreignKeys: fkRes.rows,
        uniqueConstraints: uqRes.rows,
        checkConstraints: chkRes.rows,
        sampleRows: sampleRes.rows,
      };
    }

    // Save output report to scratch directory for structured presentation
    const fs = require('fs');
    fs.writeFileSync('schema_inspection_raw.json', JSON.stringify(schemaReport, null, 2));
    console.log('\nInspection complete! Full raw metadata saved to schema_inspection_raw.json');

  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runInspection();
