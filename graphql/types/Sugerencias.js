const {GraphQLObjectType, GraphQLString} = require("graphql");
const {GraphQLJSON} = require("graphql-type-json");


const SugerenciaType = new GraphQLObjectType({
    name: 'SugerenciasType',
    fields: {
        id: {type: GraphQLString},
        correo: {type: GraphQLString},
        numero: {type: GraphQLString},
        mensaje: {type: GraphQLString},
        created_at: {type: GraphQLString},
        readed_at: {type: GraphQLString},
        role_id: {type: GraphQLString},
        nombre: {type: GraphQLString},
        asunto: {type: GraphQLString},
        data: {type: GraphQLJSON}
    }
})
module.exports = SugerenciaType