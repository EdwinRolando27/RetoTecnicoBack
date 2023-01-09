const {db, pgp} = require("../../scripts/pgAdaptor")
const {update, timestamp} = require("../../scripts/utils")

const modelPreguntas = ({user}) => ({
    create: ({descripcion, encabezado, id_user}) => {
        const query = pgp.as.format(`INSERT INTO preguntas(descripcion, encabezado, id_user, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`)
        const values = [descripcion, encabezado, id_user, timestamp(), timestamp()]
        return db.oneOrNone(query, values).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update({id: args.id, update: args.update})
        const query = pgp.as.format(`UPDATE preguntas SET ${set} where id= $1 RETURNING*`)
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    getAll: () => {
        const query = pgp.as.format(`SELECT p.*, u.nombres FROM preguntas p inner joinn usuarios u on u.id=p.id_user`)
        return db.manyOrNone(query).then(res => res).catch(err => err)
    }
})
module.exports= modelPreguntas