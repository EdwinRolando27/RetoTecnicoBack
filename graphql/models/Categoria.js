const {db, pgp} = require("../../scripts/pgAdaptor")
const {update, timestamp} = require("../../scripts/utils")

const modelCategoria = ({user}) => ({
    create: ({codigo, nombre}, t = null) => {
        const query = pgp.as.format('INSERT INTO categorias(codigo, nombre, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *')

        const values = [
            codigo, nombre, timestamp(), timestamp()
        ]

        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    getAll: () => {
        const query = pgp.as.format('SELECT * FROM categorias ORDER BY created_at ASC')
        return db.manyOrNone(query).then(res => res).catch(err => err)
    },
    getById: id => {
        const query = pgp.as.format('SELECT * FROM categorias where id=$1')

        return db.oneOrNone(query, [id]).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update({id: args.id, update: args.update})

        const query = pgp.as.format(`UPDATE categorias SET ${set} WHERE id=$1 RETURNING *`)

        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    delete: (id, t = null) => {
        const query = pgp.as.format(`UPDATE categorias SET deleted_at=$2 WHERE id=$1 RETURNING *`)
        const values = [
            id,
            timestamp()
        ]

        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    activate: (id, t = null) => {
        const query = pgp.as.format(`UPDATE categorias SET deleted_at = null WHERE id=$1 RETURNING *`)
        const values = [
            id
        ]

        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    getByCodigo: (codigo) => {
        const query = pgp.as.format(`SELECT * FROM categorias WHERE codigo =$1`)
        return db.oneOrNone(query, [codigo]).then(res => res).catch(err => err)
    },
    categoriaNoDeleted: () => {
        const query = pgp.as.format('SELECT * FROM categorias where deleted_at is null ORDER BY created_at ASC')
        return db.manyOrNone(query).then(res => res).catch(err => err)
    }
})
module.exports = modelCategoria