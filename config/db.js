const mysql = require('mysql2/promise');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'laravel',
    port: 3306
});
connection.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});
module.exports = connection;
