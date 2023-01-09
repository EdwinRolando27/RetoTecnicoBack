const {db, pgp} = require("../../scripts/pgAdaptor")
const {timestamp, update} = require("../../scripts/utils")


const modelMedicos = () => ({
    create: ({nombres, apellidos, especialidad, dni}, t = null) => {
        const query = pgp.as.format(`INSERT INTO medicos(nombres, apellidos, especialidad, dni) VALUES ($1, $2, $3, $4) RETURNING*`)
        const values = [nombres, apellidos, especialidad, dni]
        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)

    }
})