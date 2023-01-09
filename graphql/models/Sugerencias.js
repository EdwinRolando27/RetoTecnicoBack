const {db, pgp} = require("../../scripts/pgAdaptor")
const {update, timestamp} = require("../../scripts/utils")

const modelSugerencias = ({user}) => ({
    create: ({correo, numero, mensaje, asunto, nombre, role_id}) => {
        const query = pgp.as.format(`INSERT INTO sugerencias(correo, numero, mensaje, asunto, nombre, role_id, created_at) 
                                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING*`)
        const values = [correo, numero, mensaje, asunto, nombre, role_id, timestamp()]
        return db.oneOrNone(query, values).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update({id: args.id, update: args.update})
        const query = pgp.as.format(`UPDATE sugerencias SET ${set} where id= $1 RETURNING*`)
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    getNotRead: (no_read = true) => {
        let query = pgp.as.format(`SELECT created_at::text,* FROM sugerencias`)
        if (no_read) query += ` where readed_at is null`
        return db.manyOrNone(query).then(res => res).catch(err => err)
    },
    getByid: (id) => {
        const query = pgp.as.format(`SELECT * FROM sugerencias where id=$1`)
        return db.oneOrNone(query, [id]).then(res => res).catch(err => err)
    },
    updateRead: (id) => {
        const query = pgp.as.format(`UPDATE sugerencias set readed_at= $2 where id=$1 RETURNING*`)
        return db.oneOrNone(query, [id, timestamp()]).then(res => res).catch(err => err)
    }

})
module.exports = modelSugerencias