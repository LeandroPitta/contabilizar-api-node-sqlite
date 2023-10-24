const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();
const db = require('../sqlitedb.js');

// Rota para obter o histórico de registros com base no ID fornecido.
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const sqlQuery = `SELECT * FROM Historico WHERE ID = ? ORDER BY DATAHISTORICO DESC`;

    db.all(sqlQuery, [id], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        } else {
            const jsonData = rows.map((row) => ({
                ID: row.ID,
                HISTORICO: row.Historico,
                DATAHISTORICO: row.DataHistorico,
                FUNCIONARIO: row.Funcionario,
            }));
            res.json(jsonData);
        }
    });
});

// Rota para adicionar um novo registro de histórico.
router.post('/', (req, res) => {
    const { ID, HISTORICO, FUNCIONARIO } = req.body;

    // Obtenção da data e hora atual em São Paulo no formato UTC.
    const dataAtualUTC = moment.utc();
    const dataSaoPaulo = dataAtualUTC.tz('America/Sao_Paulo');

    const maxRegistrosPermitidos = 10;

    if (maxRegistrosPermitidos) {
        const sqlCountQuery = `SELECT COUNT(*) as count FROM Historico WHERE ID = ?`;

        db.get(sqlCountQuery, [ID], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Erro ao verificar o limite de registros' });
            } else {
                const count = result.count;
                if (count >= maxRegistrosPermitidos) {
                    res.json({ maxRegistro: 1, success: 0 });
                } else {
                    const sqlQuery = `INSERT INTO Historico (ID, HISTORICO, DATAHISTORICO, FUNCIONARIO) VALUES (?, ?, ?, ?)`;

                    db.run(sqlQuery, [ID, HISTORICO, dataSaoPaulo.format('YYYY-MM-DD HH:mm:ss'), FUNCIONARIO], function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).json({ error: 'Erro ao inserir registro de histórico no banco de dados' });
                        } else {
                            res.json({ message: 'Registro de histórico inserido com sucesso', maxRegistro: 0, success: 1 });
                        }
                    });
                }
            }
        });
    }
});

module.exports = router;