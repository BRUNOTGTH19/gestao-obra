const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root123',
      database: 'gestao_obra'
    });
    console.log('✅ Conexão bem-sucedida!');
    await connection.end();
  } catch (error) {
    console.error('❌ Falha na conexão:', error.message);
  }
}

main();