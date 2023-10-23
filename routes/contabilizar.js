const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();
const db = require('../sqlitedb.js');

function convertToISODate(dateString) {
    const match = dateString.match(/(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (match) {
        const [, year, month, day, hours, minutes, seconds] = match;
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    }
    return null; // Retorna nulo se a data não puder ser convertida
}

// Rota para obter lançamentos do banco
router.get('/', (req, res) => {
    // Implemente a consulta SQL para obter lançamentos do banco de dados
    const sqlQuery = 'SELECT ID, DataEfetiva, Credito, Debito, Status, UltimoStatus FROM Contabilizar ORDER BY DataEfetiva DESC';

    db.all(sqlQuery, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        } else {
            // Construa a resposta JSON a partir dos resultados da consulta
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

// Rota para obter um lançamento pelo ID no banco de dados (outra rota alternativa)
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

// Rota para atualizar o status de um lançamento
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
