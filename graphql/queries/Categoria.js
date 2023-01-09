const {GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean} = require("graphql")

const {CategoriaType} = require("../types")
const {GraphQLJSON} = require("graphql-type-json")
const {timestamp} = require("../../scripts/utils")
module.exports = {
    categorias: {
        type: GraphQLList(CategoriaType),
        description: 'Todos las Categorias de locales activos',
        async resolve(parent, args, {models}) {
            return await models.Categoria.getAll()
        }
    },
    categoria: {
        type: CategoriaType,
        description: 'Categoria por id',
        args: {
            id: {type: GraphQLNonNull(GraphQLString)}
        },
        resolve(parent, {id}, {models}) {

            return models.Categoria.getById(id)
        }
    },
    categoriaNoDeleted: {
        type: GraphQLList(CategoriaType),
       async resolve(parent, args, {models}){

           return await models.Categoria.categoriaNoDeleted()
        }
    }
}