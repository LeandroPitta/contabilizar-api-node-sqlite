const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();
const db = require('../sqlitedb.js');

// Função para converter uma data e hora em um formato ISO.
function convertToISODate(dateString) {
    const match = dateString.match(/(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (match) {
        const [, year, month, day, hours, minutes, seconds] = match;
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    }
    return null;
}

// Rota para listar todos os registros da tabela 'Contabilizar'.
router.get('/', (req, res) => {
    const sqlQuery = 'SELECT ID, DataEfetiva, Credito, Debito, Status, UltimoStatus FROM Contabilizar ORDER BY DataEfetiva DESC';

    db.all(sqlQuery, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        } else {
            const jsonData = rows.map((row) => ({
                ID: row.ID,
                DataEfetiva: convertToISODate(row.DataEfetiva),
                UltimoStatus: convertToISODate(row.UltimoStatus),
                Credito: row.Credito,
                Debito: row.Debito,
                Status: row.Status,
            }));
            res.setHeader('Content-Type', 'application/json');
            res.json(jsonData);
        }
    });
});

// Rota para obter um registro específico da tabela 'Contabilizar' com base no ID.
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const sqlQuery = 'SELECT * FROM Contabilizar WHERE ID = ?';

    db.get(sqlQuery, [id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        } else if (!row) {
            res.status(404).json({ error: 'No data found for given ID' });
        } else {
            const jsonData = {
                ID: row.ID,
                DataEfetiva: moment.utc(convertToISODate(row.DataEfetiva)).format('DD/MM/YYYY HH:mm:ss'),
                UltimoStatus: moment.utc(convertToISODate(row.UltimoStatus)).format('DD/MM/YYYY HH:mm:ss'),
                Credito: row.Credito,
                Debito: row.Debito,
                Status: row.Status,
            };

            res.setHeader('Content-Type', 'application/json');
            res.json(jsonData);
        }
    });
});

// Rota para atualizar o status de um registro na tabela 'Contabilizar'.
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { Status, UltimoStatus } = req.body;

    // Proteção básica contra SQL Injection
    const safeStatus = Status.replace(/'/g, "''");
    const safeUltimoStatus = UltimoStatus.replace(/'/g, "''");

    const sqlQuery = `UPDATE Contabilizar SET Status = ?, UltimoStatus = ? WHERE ID = ?`;
    db.run(sqlQuery, [safeStatus, safeUltimoStatus, id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao atualizar o status no banco de dados' });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.json({ message: 'Sucesso na atualização' });
        }
    });
});

module.exports = router;
