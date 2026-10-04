const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('schema_inspection_raw.json', 'utf8'));

console.log('Total Tables in Schema:', Object.keys(raw).length);

const summary = [];
for (const [name, info] of Object.entries(raw)) {
  summary.push({
    name,
    rowCount: info.rowCount,
    primaryKeys: info.primaryKeys,
    foreignKeys: info.foreignKeys.map(f => `${f.column_name}->${f.foreign_table_name}.${f.foreign_column_name}`),
    uniqueConstraints: info.uniqueConstraints.map(u => u.column_name),
    checkConstraints: info.checkConstraints.map(c => `${c.constraint_name}: ${c.check_clause}`),
    columns: info.columns.map(c => ({
      name: c.column_name,
      type: c.data_type,
      nullable: c.is_nullable === 'YES',
      default: c.column_default
    }))
  });
}

fs.writeFileSync('all_tables_summary.json', JSON.stringify(summary, null, 2));

console.log('\n--- ROW COUNTS ---');
summary.forEach(s => console.log(`${s.name.padEnd(18)} : ${s.rowCount} rows`));
