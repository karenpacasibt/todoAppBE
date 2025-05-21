const express = require('express');
const app = express();
const connection = require('./config/db');

app.get('/test-db', async (req, res) => {
    try {
        const conn = await connection;
        const [rows] = await conn.query('SELECT * FROM tags');
        res.json(rows);
    } catch (err) {
        console.error('Error en la conexión:', err);
        res.status(500).send('Fallo en la conexión con la base de datos');
    }
});


app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});
