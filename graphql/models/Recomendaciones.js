const {db, pgp} = require("../../scripts/pgAdaptor")
const {update, timestamp} = require("../../scripts/utils")

const modelRecomendaciones = ({user}) => ({
    create: ({orden, descripcion, categoria_id, contenido}) => {
        const query = pgp.as.format(`INSERT INTO recomendaciones(orden, descripcion, categoria_id, contenido, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`)
        const values = [orden, descripcion, categoria_id, contenido, timestamp(), timestamp()]
        return db.oneOrNone(query, values).then(res => res).catch(err => err)
    },
    getAll: () => {
        const query = pgp.as.format(`Select * from recomendaciones ORDER BY orden ASC`)
        return db.manyOrNone(query).then(res => res).catch(err => err)
    },
    getBYCategoria: (categoria_id) => {
        const query = pgp.as.format(`Select * from recomendaciones where categoria_id=$1 and deleted_at is null ORDER BY orden ASC`)
        return db.manyOrNone(query, [categoria_id]).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update({id: args.id, update: args.update})
        const query = pgp.as.format(`UPDATE recomendaciones SET ${set} where id= $1 RETURNING*`)
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    deleteActivateRecomendaciones: (id, eliminar = true) => {
        const query = pgp.as.format(`UPDATE  recomendaciones SET deleted_at=$2 where id= $1 RETURNING*`)
        return (db).oneOrNone(query, [id, eliminar ? timestamp() : null]).then(res => res).catch(err => err)
    },
})
module.exports = modelRecomendaciones