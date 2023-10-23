const sql = require('mssql');

const dbConfig = {
    server: '',
    database: '',
    user: '',
    password: '',
    options: {
        encrypt: true, // Usar criptografia
    },
};

const pool = new sql.ConnectionPool(dbConfig);

const connectToDb = async () => {
    try {
        await pool.connect();
        console.log('Conexão com o banco de dados estabelecida.');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    }
}

connectToDb(); // Chame a função para conectar ao banco de dados

module.exports = pool;