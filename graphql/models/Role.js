const {db, pgp} = require("../../scripts/pgAdaptor")
const {update, timestamp} = require("../../scripts/utils")

const modelRole = ({user}) => ({
    getAll: () => {
        const query = pgp.as.format('SELECT * FROM roles  ORDER BY id ASC')

        return db.manyOrNone(query).then(res => res).catch(err => err)
    },
    getById: id => {
        const query = pgp.as.format('SELECT * FROM roles where id=$1')

        return db.oneOrNone(query, [id]).then(res => res).catch(err => err)
    },
    update: (args, t = null) => {
        const {set, values} = update(args)

        const query = pgp.as.format(`UPDATE roles SET ${set} WHERE id=$1 RETURNING *`)

        return (t ? t : db).oneOrNone(query, values).then(res => res).catch(err => err)
    },
})
module.exports = modelRole