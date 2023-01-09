const {db, pgp} = require("../../scripts/pgAdaptor")
const {timestamp, update} = require("../../scripts/utils")

const modelNews = ({user}) => ({
    create: ({etiqueta, descripcion, contenido_html = null, foto = null}, t = null) => {

        const query = pgp.as.format(`INSERT INTO news(etiqueta, descripcion, contenido_html, foto,created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING*`)
        const values = [etiqueta, descripcion, contenido_html, foto, timestamp(), timestamp()]
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update({id: args.id, update: args.update})
        const query = pgp.as.format(`UPDATE  news SET ${set} where id= $1 RETURNING*`)
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },

    deleteActivateNews: (id, eliminar = true) => {
        const query = pgp.as.format(`UPDATE  news SET deleted_at=$2 where id= $1 RETURNING*`)
        return (db).oneOrNone(query, [id, eliminar ? timestamp() : null]).then(res => res).catch(err => err)
    },
    selectNews: (mostrar = false) => {
        let query = pgp.as.format(`SELECT * FROM news`)
        query += mostrar ? ' where deleted_at is null order by updated_at desc' : ' order by updated_at desc'
        return db.manyOrNone(query).then(res => res).catch(err => err)
    },
    getById: (id) => {
        const query = pgp.as.format(`select * from news where id=$1`)
        return db.oneOrNone(query, [id]).then(res => res).catch(err => err)
    }
})
module.exports = modelNews