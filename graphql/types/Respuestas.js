const {GraphQLObjectType, GraphQLString} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date");

const RespuestasType = new GraphQLObjectType({
    name: "Respuestas",
    fields: {
        id: {type: GraphQLString},
        descripcion: {type: GraphQLString},
        id_pregunta: {type: GraphQLString},
        deleted_at: {type: GraphQLDateTime},
        updated_at: {type: GraphQLDateTime},
        created_at: {type: GraphQLDateTime},
        id_user: {type: GraphQLString}
    }
})
module.exports = RespuestasType