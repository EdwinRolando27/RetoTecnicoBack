const {GraphQLObjectType, GraphQLString, GraphQLList} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date")
const respuestasType= require("./Respuestas")


const PreguntasType = new GraphQLObjectType({
    name: "Preguntas",
    fields: {
        id: {type: GraphQLString},
        descripcion: {type: GraphQLString},
        encabezado: {type: GraphQLString},
        id_user: {type: GraphQLString},
        deleted_at: {type: GraphQLDateTime},
        updated_at: {type: GraphQLDateTime},
        created_at: {type: GraphQLDateTime},

        respuestas: {
            type: GraphQLList(respuestasType),
            resolve({id}, args, {models}) {
                return models.Respuestas.getByPregunta(id)
            }
        }
    }
})
module.exports = PreguntasType