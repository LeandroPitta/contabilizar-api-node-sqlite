const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();
const db = require('../sqlitedb.js');

// Rota para obter histórico por ID
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
            res.json(jsonData); // Retorna um array de objetos JSON
        }
    });
});

// Rota para inserir um registro de histórico
router.post('/', (req, res) => {
    const { ID, HISTORICO, FUNCIONARIO } = req.body;

    // Obtenha a data atual em UTC
    const dataAtualUTC = moment.utc();
    const dataSaoPaulo = dataAtualUTC.tz('America/Sao_Paulo');

    // Aqui você pode adicionar lógica para limitar o número de registros conforme necessário
    const maxRegistrosPermitidos = 10; // Defina a quantidade máxima desejada

    if (maxRegistrosPermitidos) {
        // Implemente a verificação de limite de registros aqui
        // Verifique o número atual de registros para o ID e compare com maxRegistrosPermitidos
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
                    // Use a data em UTC ao inserir no banco de dados
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