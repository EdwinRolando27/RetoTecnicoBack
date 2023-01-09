const {db, pgp} = require("../../scripts/pgAdaptor")
const {update, timestamp} = require("../../scripts/utils")

const modelRespuestas = ({user}) => ({
    create: ({descripcion, id_user, id_pregunta}) => {
        const query = pgp.as.format(`INSERT INTO respuestas(encabezado, id_user, id_pregunta, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`)
        const values = [descripcion, id_user, id_pregunta, timestamp(), timestamp()]
        return db.oneOrNone(query, values).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update({id: args.id, update: args.update})
        const query = pgp.as.format(`UPDATE respuestas SET ${set} where id= $1 RETURNING*`)
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    getByPregunta: (id_pregunta) => {
        const query = pgp.as.format(`SELECT * FROM respuestas where id_pregunta=$1 and deleted_at is null`)
        return db.manyOrNone(query, [id_pregunta]).then(res => res).catch(err => err)
    }
})
module.exports = modelRespuestas