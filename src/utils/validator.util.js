const db = require('../DB/connection.js');
const { comparePassword } = require('./hash.util.js');

exports.userExists = async (mail) => {
    const [users] = await db.query('SELECT id FROM users WHERE mail = ?', [mail]);
    return users.length > 0;
};

exports.getUserBymail = async (mail) => {
    const [users] = await db.query('SELECT * FROM users WHERE mail = ?', [mail]);
    return users[0] || null;
};

exports.validatePassword = async (inputPassword, hashedPassword) => {
    return await comparePassword(inputPassword, hashedPassword);
};