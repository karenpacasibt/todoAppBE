const mysql = require('mysql2/promise');
const { db } = require('../config')

const connection = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.name,
    port: db.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = connection;
