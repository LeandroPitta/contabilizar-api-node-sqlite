// Importa o módulo sqlite3 e inicializa uma conexão com um banco de dados SQLite chamado 'contabilizar.sqlite'.
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('contabilizar.sqlite');

// Exporta a conexão do banco de dados para que ela possa ser utilizada em outras partes da aplicação.
module.exports = db;
