const jwt = require('jsonwebtoken')
const { SECRET } = require('../config')
const db = require('../DB/connection')

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, SECRET);

        req.user = { id: decoded.id, mail: decoded.mail };

        const [user] = await db.query(`SELECT id FROM users WHERE id = ?`, [req.user.id]);

        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        next();
    } catch (error) {
        console.error(error);

        res.status(401).json({ message: 'Invalid token' });
    }
};
