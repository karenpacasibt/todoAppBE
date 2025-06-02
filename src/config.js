require('dotenv').config();

const config = {
    HOST_BE: process.env.HOST_BE || '127.0.0.1',
    PORT_BE: process.env.PORT_BE || 3000,
    
    HOST_FE : process.env.HOST_FE,
    PORT_FE : process.env.PORT_FE,

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'todo',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'supersecret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },

    env: process.env.NODE_ENV || 'development'
};

module.exports = config;