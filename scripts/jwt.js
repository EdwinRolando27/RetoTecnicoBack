const jwt = require("jsonwebtoken")

require('dotenv').config()

module.exports = {
    createToken: async user => {
        const {id, email, nombres} = user
        return {
            authentication: jwt.sign({
                id, email, userName: `${nombres ? `${nombres} ` : ''}`,
            }, process.env.AUTH_JWT_SECRET, {expiresIn: "15m"}),
            authorization: jwt.sign({
                id
            }, process.env.AUTH_JWT_SECRET, {expiresIn: "15m"}),
            refresh: jwt.sign({id}, process.env.AUTH_JWT_SECRET, {expiresIn: "60m"})
        }
    },
    decodeToken: auth => jwt.decode(auth),
    verifyToken: auth => jwt.verify(auth, process.env.AUTH_JWT_SECRET)
}