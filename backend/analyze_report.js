const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('schema_inspection_raw.json', 'utf8'));

console.log('=== TABLE SUMMARY & RECORD COUNTS ===');
for (const [table, data] of Object.entries(raw)) {
  console.log(`Table: ${table} | Rows: ${data.rowCount} | PK: [${data.primaryKeys.join(', ')}]`);
}

console.log('\n=== DETAILED TABLE SPECS ===');
for (const [table, data] of Object.entries(raw)) {
  console.log(`\n======================================================`);
  console.log(`TABLE: ${table} (Records: ${data.rowCount})`);
  console.log(`------------------------------------------------------`);
  console.log('Columns:');
  data.columns.forEach(col => {
    const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    const def = col.column_default ? ` DEFAULT ${col.column_default}` : '';
    console.log(`  - ${col.column_name}: ${col.data_type} (${col.udt_name}) ${nullable}${def}`);
  });

  if (data.primaryKeys.length > 0) {
    console.log(`Primary Key: ${data.primaryKeys.join(', ')}`);
  } else {
    console.log(`Primary Key: NONE`);
  }

  if (data.foreignKeys.length > 0) {
    console.log('Foreign Keys:');
    data.foreignKeys.forEach(fk => {
      console.log(`  - ${fk.column_name} -> ${fk.foreign_table_name}(${fk.foreign_column_name}) [ON UPDATE ${fk.update_rule}, ON DELETE ${fk.delete_rule}]`);
    });
  } else {
    console.log('Foreign Keys: NONE');
  }

  if (data.uniqueConstraints.length > 0) {
    console.log('Unique Constraints:');
    data.uniqueConstraints.forEach(uq => {
      console.log(`  - ${uq.constraint_name} (${uq.column_name})`);
    });
  }

  if (data.checkConstraints.length > 0) {
    console.log('Check Constraints:');
    data.checkConstraints.forEach(chk => {
      console.log(`  - ${chk.constraint_name}: ${chk.check_clause}`);
    });
  }

  console.log('Sample Data:');
  if (data.sampleRows.length === 0) {
    console.log('  [EMPTY TABLE]');
  } else {
    console.log(JSON.stringify(data.sampleRows, null, 2));
  }
}
