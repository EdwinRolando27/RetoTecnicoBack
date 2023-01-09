const {db, pgp} = require("../../scripts/pgAdaptor")
const {timestamp, update} = require("../../scripts/utils")

const modelMedico = ({user}) => ({
    create: ({
                 nombres, apellidos, especialidad, dni, contenido_html = null,
                 foto
             }, t = null) => {
        foto = foto === '' || !foto ? null : foto
        const query = pgp.as.format(`INSERT INTO medicos(nombres, apellidos, especialidad, dni, contenido_html, foto, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING*`)
        const values = [nombres, apellidos, especialidad, dni, contenido_html, foto, timestamp(), timestamp()]
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update({id: args.id, update: args.update})
        const query = pgp.as.format(`UPDATE  medicos SET ${set} where id= $1 RETURNING*`)
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
    deleteActivateMedico: (id, eliminar = true) => {
        const query = pgp.as.format(`UPDATE  medicos SET deleted_at=$2 where id= $1 RETURNING*`)
        return (db).oneOrNone(query, [id, eliminar ? timestamp() : null]).then(res => res).catch(err => err)
    },
    selectMedicos: (mostrar = false) => {
        let query = pgp.as.format(`SELECT * FROM medicos`)
        query += mostrar ? ' where deleted_at is null' : ''
        return db.manyOrNone(query).then(res => res).catch(err => err)
    }
})
module.exports = modelMedico