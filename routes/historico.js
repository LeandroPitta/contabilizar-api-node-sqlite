const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();
const db = require('../db.js');

// Rota para obter histórico por ID
router.get('/:id', async (req, res) => {
    try {
        const pool = await db;
        const id = req.params.id;
        const sqlQuery = `SELECT * FROM Historico WHERE ID = ${id} ORDER BY DATAHISTORICO DESC`;
        const result = await pool.query(sqlQuery);

        if (result.recordset.length === 0) {
            res.status(404).json({ error: 'No data found for given ID' });
        } else {
            const jsonData = result.recordset.map((row) => ({
                ID: row.ID,
                HISTORICO: row.Historico,
                DATAHISTORICO: row.DataHistorico,
                FUNCIONARIO: row.Funcionario,
            }));
            res.json(jsonData); // Retorna um array de objetos JSON
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
    }
});

// Rota para inserir um registro de histórico
router.post('/', async (req, res) => {
    try {
        const pool = await db;
        const { ID, HISTORICO, FUNCIONARIO } = req.body;
        const dataAtualUTC = moment.utc();
        const dataSaoPaulo = dataAtualUTC.tz('America/Sao_Paulo');

        const countQuery = `SELECT COUNT(*) as count FROM Historico WHERE ID = ${ID}`;
        const countResult = await pool.query(countQuery);

        const count = countResult.recordset[0].count;
        if (count >= 10) {
            res.json({ maxRegistro: 1, success: 0 });
        } else {
            const sqlQuery = `INSERT INTO Historico (ID, HISTORICO, DATAHISTORICO, FUNCIONARIO) VALUES (${ID}, '${HISTORICO}', '${dataSaoPaulo.format('YYYY-MM-DD HH:mm:ss')}', '${FUNCIONARIO}')`;
            await pool.query(sqlQuery);
            res.json({ message: 'Registro de histórico inserido com sucesso', maxRegistro: 0, success: 1 });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao inserir registro de histórico no banco de dados' });
    }
});

module.exports = router;