module.exports = {
    api: {
        port: process.env.PORT || 4001
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'secretKey'
    },
    mysql: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.DB
    }
}