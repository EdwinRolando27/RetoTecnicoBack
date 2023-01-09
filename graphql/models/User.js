
const {timestamp, passwordHash, uniqid} = require("../../scripts/utils")

const {db, pgp} = require("../../scripts/pgAdaptor")

const modelUSer = ({user}) => ({
    create: async ({
                       email, nombres, password,
                   }, t = null) => {
        const query = pgp.as.format('INSERT INTO users(email, nombres, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *')
        const values = [
            email, nombres, await passwordHash(password), timestamp(), timestamp()
        ]

        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    getByEmail: email => {
        const query = pgp.as.format('SELECT * FROM users where email=$1 AND deleted_at is NULL')

        return db.oneOrNone(query, [email]).then(res => res).catch(err => err)
    },
    getAll: () => {
        const query = pgp.as.format('SELECT * FROM users where deleted_at is null ORDER BY id DESC')
        return db.manyOrNone(query).then(res => res).catch(err => err)
    },
    getById: id => {
        const query = pgp.as.format('SELECT * FROM users WHERE id=$1')
        return db.oneOrNone(query, [id]).then(res => res).catch(err => err)
    },
    deleteActivateVerify: async (id, caso = 1) => {
        let query = ''
        // 1: activar , 2: eliminar, 3 verificar
        caso = Number(caso)
        switch (caso) {
            case 1:
                query = pgp.as.format(`UPDATE users SET deleted_at =null where id=$1 RETURNING*`)
                break
            case 2:
                query = pgp.as.format(`UPDATE users SET deleted_at =$2 where id=$1 RETURNING*`)
                break
            case 3:
                query = pgp.as.format(`UPDATE users SET email_verified_at =$2 where id=$1 RETURNING*`)
                break
        }
        return await db.oneOrNone(query, [id, timestamp()]).then(res => res).catch(err => err)
    },
    selectUsers: async () => {
        let query = pgp.as.format(`SELECT * FROM users`)
        return await db.manyOrNone(query).then(res => res).catch(err => err)
    }

})
module.exports = modelUSer