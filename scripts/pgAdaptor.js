const pgPromise = require('pg-promise')
require('dotenv').config()

const pgp = pgPromise({schema: 'public'})

const {TransactionMode, isolationLevel} = pgp.txMode

module.exports = {
    db: pgp({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    }),
    pgp,
    mode: new TransactionMode({tiLevel: isolationLevel.serializable})
}
