const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('contabilizar.sqlite');

module.exports = db;
