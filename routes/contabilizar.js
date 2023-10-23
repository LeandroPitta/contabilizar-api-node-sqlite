const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();
const db = require('../db.js'); 

// Rota para obter lançamentos do banco
router.get('/', async (req, res) => {
    try {
        const pool = await db;

        // Implemente a consulta SQL para obter lançamentos do banco de dados
        const result = await pool.query('SELECT ID, DataEfetiva, Credito, Debito, [Status], UltimoStatus FROM Contabilizar ORDER BY DataEfetiva DESC');

        // Construindo resposta JSON a partir dos resultados da consulta
        const jsonData = result.recordset.map((row) => ({
            ID: row.ID,
            DataEfetiva: moment.utc(row.DataEfetiva),
            UltimoStatus: moment.utc(row.UltimoStatus),
            Credito: row.Credito,
            Debito: row.Debito,
            Status: row.Status,
        }));

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(jsonData));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
    }
});

// Rota para obter um lançamento pelo ID no banco de dados e retornar um JSON (outra rota alternativa)
router.get('/:id', async (req, res) => {
    try {
        const pool = await db;

        const id = req.params.id;
        const sqlQuery = `SELECT * FROM Contabilizar WHERE ID = ${id}`;
        const result = await pool.query(sqlQuery);

        if (result.recordset.length === 0) {
            res.status(404).json({ error: 'No data found for given ID' });
        } else {
            const row = result.recordset[0];
            const jsonData = {
                ID: row.ID,
                DataEfetiva: moment.utc(row.DataEfetiva).format('DD/MM/YYYY HH:mm:ss'),
                UltimoStatus: moment.utc(row.UltimoStatus).format('DD/MM/YYYY HH:mm:ss'),
                Credito: row.Credito,
                Debito: row.Debito,
                Status: row.Status,
            };

            res.setHeader('Content-Type', 'application/json');
            res.json(jsonData);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
    }
});

// Rota para atualizar o status de um lançamento
router.put('/:id', async (req, res) => {
    try {
        const pool = await db;

        const id = req.params.id;
        const { Status, UltimoStatus } = req.body;

        // Proteção básica contra SQL Injection
        const safeStatus = Status.replace(/'/g, "''");
        const safeUltimoStatus = UltimoStatus.replace(/'/g, "''");

        const sqlQuery = `UPDATE Contabilizar SET Status = '${safeStatus}', UltimoStatus = '${safeUltimoStatus}' WHERE ID = ${id}`;
        await pool.query(sqlQuery);

        res.setHeader('Content-Type', 'application/json');
        res.json({ message: 'Sucesso na atualização' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar o status no banco de dados' });
    }
});

module.exports = router;