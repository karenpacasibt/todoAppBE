const jwt = require('jsonwebtoken')
const { jwt: jwtConfig } = require('../config');

const db = require('../DB/connection')

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader && authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);

        req.user = { id: decoded.id, mail: decoded.mail };

        const [user] = await db.query(`SELECT id FROM users WHERE id = ?`, [req.user.id]);

        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
