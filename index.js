const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const contabilizarRoutes = require('./routes/contabilizar');
const historicoRoutes = require('./routes/historico');
const db = require('./sqlitedb.js');

// Configurações do CORS
app.use(cors());

// Configuração do parser para o corpo da requisição
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Bem-vindo à página inicial da sua aplicação!');
});

app.use('/api/contabilizar', contabilizarRoutes);
app.use('/api/historico', historicoRoutes);

app.listen(3000, () => {
    console.log('Servidor Node.js em execução na porta 3000');
});