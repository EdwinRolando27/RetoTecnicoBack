const {GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLList} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date")
const {GraphQLJSON} = require("graphql-type-json")
const RecomendacionesType = require("./Recomendaciones");

const CategoriaType = new GraphQLObjectType({
    name: "Categoria",
    fields: {
        id: {type: GraphQLString},
        codigo: {type: GraphQLString},
        nombre: {type: GraphQLString},
        created_at: {type: GraphQLDateTime},
        updated_at: {type: GraphQLDateTime},
        deleted_at: {type: GraphQLDateTime},
        result: {type: GraphQLJSON},
        status: {type: GraphQLBoolean},
        recomendaciones: {
            type: GraphQLList(RecomendacionesType),
            async resolve({id}, args, {models}) {
                return await models.Recomendaciones.getBYCategoria(id)
            }
        }

    }
})

module.exports = CategoriaType