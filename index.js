const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const contabilizarRoutes = require('./routes/contabilizar');
const historicoRoutes = require('./routes/historico');
const db = require('./sqlitedb.js');

// Configura o uso do middleware Cors para permitir requisições de domínios diferentes.
app.use(cors());

// Configura o uso do middleware Body Parser para interpretar dados no corpo das requisições em formato JSON.
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Bem-vindo à página inicial da sua aplicação!');
});

app.use('/api/contabilizar', contabilizarRoutes);
app.use('/api/historico', historicoRoutes);

app.listen(3000, () => {
    console.log('Servidor Node.js em execução na porta 3000');
});