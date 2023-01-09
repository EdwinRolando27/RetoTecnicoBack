const {GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLFloat} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date")
const {GraphQLJSON} = require("graphql-type-json");

const RecomendacionesType = new GraphQLObjectType(
    {
        name: 'RecomendacionesType',
        fields: {
            id: {type: GraphQLString},
            orden: {type: GraphQLFloat},
            categoria_id: {type: GraphQLString},
            contenido: {type: GraphQLString},
            descripcion: {type: GraphQLString},
            created_at: {type: GraphQLString},
            updated_at: {type: GraphQLString},
            deleted_at: {type: GraphQLString}
        }
    }
)
module.exports = RecomendacionesType