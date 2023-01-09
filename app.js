const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const fileUpload = require('express-fileupload')
const cors = require("cors")
const {createServer} = require('http')
const {ApolloServer, AuthenticationError} = require('apollo-server-express')

const indexRouter = require('./routes/index')
const schema = require("./graphql/schema")
const {getUser} = require("./scripts/utils")
const {
    modelUser, modelRole, modelMedico, modelCategoria, modelRecomendaciones, modelNews, modelSugerencias,
    modelRespuestas, modelPreguntas
} = require("./graphql/models")

require('dotenv').config()

const app = express()

const whitelist = [process.env.WEB, process.env.WEP_ITEC, process.env.WEP_BODY_FITNESS]
const corsOptions = {
    origin: '*'
}

app.use(fileUpload({createParentPath: true}))
app.use(cors(corsOptions))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json({limit: '10mb'}))
app.use(express.urlencoded({extended: false, limit: '10mb'}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31536000}))

app.use('/', indexRouter)


const server = new ApolloServer({
    cors: cors(corsOptions),
    schema,
    tracing: true,
    playground: true,
    context: async ({req, connection}) => {
        const token = req ? req.headers.authentication : ''
        const user = await getUser(token, modelUser({}))

        if (!user) throw new AuthenticationError('You must be logged in')
        return {
            user,
            models: {
                User: modelUser({user}),
                Role: modelRole({user}),
                Medicos: modelMedico({user}),
                Categoria: modelCategoria({user}),
                Recomendaciones: modelRecomendaciones({user}),
                News: modelNews({user}),
                Sugerencia: modelSugerencias({user}),
                Respuestas: modelRespuestas({user}),
                Preguntas: modelPreguntas({user})
            }
        }
    },
    subscriptions: {
        onConnect: async (params, webSocket, context) => {
            const token = params.headers ? params.headers.Authentication : ''

            const user = await getUser(token, modelUser({}))
            if (!user) throw new AuthenticationError('You must be logged in')
            return {user}
        },
        onDisconnect: (webSocket, context) => {
            // console.log('Disconnected!')
        }
    },
    uploads: {
        maxFileSize: 10000000, // 10 MB
        maxFiles: 20
    }
})


server.applyMiddleware({app, path: '/api', cors: false})

const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)
httpServer.setTimeout(15 * 60 * 1000)


app.use(function (req, res, next) {
    next(createError(404))
})

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})


httpServer.listen(process.env.PORT, () => {
    console.log(`🚀 Server ready at http://127.0.0.1:${process.env.PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://127.0.0.1:${process.env.PORT}${server.subscriptionsPath}`)
})

module.exports = app