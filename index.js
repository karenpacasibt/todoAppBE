const express = require('express');
const connection = require('./config/db');
const categoryRoutes = require('./routes/categoryRoutes');
const app = express();
app.use(express.json());
app.use('/categories', categoryRoutes);



app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});


