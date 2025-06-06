const db = require('../DB/connection');
const jwt = require('jsonwebtoken');
const { encryptPassword, comparePassword } = require('../utils/hash.util');
const { jwt: jwtConfig } = require('../config');

exports.register = async (req, res) => {
    try {
        const { full_name, mail, password } = req.body;
        const [users] = await db.query(
            `SELECT full_name, mail FROM users WHERE full_name = ? OR mail = ?`,
            [full_name, mail]
        );

        if (users.length > 0) {
            const user = users[0];
            if (user.full_name === full_name) {
                return res.status(400).json({ message: 'The name user already exists' });
                return res.status(422).json({ message: 'The name user already exists' });
            }
            if (user.mail === mail) {
                return res.status(400).json({ message: 'The mail already exists' });
            }

            if (user.password.length > 8) {
                return res.status(400).json({ message: 'The password must be at least 8 characters long.' });
            }
        }
        const hashedPassword = await encryptPassword(req.body.password);
        const [newUser] = await db.query('INSERT INTO users (full_name, mail, password) VALUES (?, ?, ?)',
            [full_name, mail, hashedPassword]);

        const token = jwt.sign({ id: newUser.insertId, mail }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
        res.status(201).json({ token });

    } catch (error) {

        res.status(500).json({ message: 'Error registering user' })
    }

}
exports.login = async (req, res) => {
    try {
        const { mail } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE mail = ?', [mail]);
        if (users.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = users[0];

        const valid = await comparePassword(req.body.password, user.password);

        if (!valid) return res.status(401).json({ message: 'Incorrect password' });

        const token = jwt.sign({
            id: user.id,
            mail: user.mail
        }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

        res.json({ token });
    } catch (error) {
        res.status(401).json(error);
    }
};

exports.getProfile = async (req, res) => {
    const { id } = req.user;

    const [users] = await db.query('SELECT id, full_name, mail FROM users WHERE id = ?', [id]);

    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json(users[0]);
};

