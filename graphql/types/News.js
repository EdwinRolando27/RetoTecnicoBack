const {GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLFloat} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date")
const {GraphQLJSON} = require("graphql-type-json");

const NewsType = new GraphQLObjectType(
    {
        name: 'NewsType',
        fields: {
            id: {type: GraphQLString},
            descripcion: {type: GraphQLString},
            etiqueta: {type: GraphQLString},
            created_at: {type: GraphQLDateTime},
            updated_at: {type: GraphQLDateTime},
            deleted_at: {type: GraphQLString},
            contenido_html: {type: GraphQLString},
            foto: {type: GraphQLString}
        }
    }
)
module.exports = NewsType