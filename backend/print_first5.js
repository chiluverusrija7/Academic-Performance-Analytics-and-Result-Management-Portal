const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('schema_inspection_raw.json', 'utf8'));

const first5 = ['admission', 'attendance', 'course', 'department', 'enrollment'];

for (const table of first5) {
  const data = raw[table];
  console.log(`### Table: \`${table}\` (${data.rowCount} rows)`);
  console.log(`- **Columns**:`);
  data.columns.forEach(c => {
    let typeStr = c.data_type;
    if (c.character_maximum_length) typeStr += `(${c.character_maximum_length})`;
    else if (c.numeric_precision) typeStr += `(${c.numeric_precision},${c.numeric_scale})`;
    const nullStr = c.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
    const defStr = c.column_default ? ` DEFAULT ${c.column_default}` : '';
    console.log(`  * \`${c.column_name}\`: \`${typeStr}\` ${nullStr}${defStr}`);
  });
  console.log(`- **Primary Key**: ${data.primaryKeys.length > 0 ? data.primaryKeys.map(k => `\`${k}\``).join(', ') : 'None'}`);
  console.log(`- **Foreign Keys**: ${data.foreignKeys.length > 0 ? data.foreignKeys.map(f => `\`${f.column_name}\` -> \`${f.foreign_table_name}(${f.foreign_column_name})\``).join(', ') : 'None'}`);
  console.log(`- **Unique Constraints**: ${data.uniqueConstraints.length > 0 ? data.uniqueConstraints.map(u => `\`${u.column_name}\` (${u.constraint_name})`).join(', ') : 'None'}`);
  console.log(`- **Check Constraints**: ${data.checkConstraints.length > 0 ? data.checkConstraints.map(c => `\`${c.constraint_name}\`: \`${c.check_clause}\``).join(', ') : 'None'}`);
  console.log('');
}
