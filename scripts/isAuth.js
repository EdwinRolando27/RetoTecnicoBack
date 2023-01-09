const jwt = require('jsonwebtoken')

const {modelUser} = require('../graphql/models')
// const {decodeToken, verifyToken} = require("./jwt")

require('dotenv').config()

module.exports = async (req, res, next) => {
    try {
        const {operationName} = req.body
        let {authentication} = req.headers
        const operations = ['createToken', 'createUser', 'resetPassword', 'refreshToken', 'confirmationEmail', 'resetVerify',
            'modulos', 'sendVerific', 'passwordReset', 'createRelamation', 'createPdfReclamation', 'ubigeoByParam',
            'documentoslist', 'getGmail', 'searchReclamation', 'selectMedicos', 'categoriaNoDeleted', 'newsByID', 'selectNews', 'createSugerencias']
        if (operations.includes(operationName)) return next()

        authentication = authentication ? authentication.replace('Bearer ', '') : ''
        const {id, uniqued} = jwt.verify(authentication, process.env.AUTH_JWT_SECRET)
        const user = await modelUser({}).getById(id)
        if (uniqued === user.logout_session) return next()
        return res.status(402).json({error: new Error('Nueva Sessión')})
    } catch ({message}) {
        res.status(401).json({error: new Error(message)})
    }
}