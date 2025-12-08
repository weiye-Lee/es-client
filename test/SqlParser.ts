import { parseSQL, conditionToES } from '../src/core/util/file/SqlParser';

// bun 环境测试
// const testSQL = `
//     SELECT CONCAT(name, '!!') AS \`full name\`, DATE_FORMAT(created_at, '%Y') 
//     FROM users 
//     WHERE (age >= 18 AND status TERM 'active') 
//       AND (role = 'admin' OR role = 'moderator')
//       AND email IS NOT NULL
//       AND name LIKE 'john%'
//     ORDER BY created_at DESC
//     LIMIT 10 OFFSET 20
//   `;

// try {
//   const ast = parseSQL(testSQL);
//   console.log('✅ AST:', JSON.stringify(ast, null, 2));
//   if (ast.where) {
//     console.log('✅ ES DSL:', JSON.stringify(conditionToES(ast.where), null, 2));
//   }
// } catch (e) {
//   console.error('❌ Parse error:', e);
// }

try {
  const ast = parseSQL("select * from users")
  console.log('✅ AST:', JSON.stringify(ast, null, 2));
} catch (e) {
  console.error('❌ Parse error:', e);
}