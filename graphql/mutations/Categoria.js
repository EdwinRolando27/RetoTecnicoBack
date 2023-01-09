const {GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean} = require("graphql")
const {GraphQLJSON} = require("graphql-type-json")

const {CategoriaType} = require("../types")

module.exports = {
    createCategoria: {
        type: CategoriaType,
        description: 'Inserta una Categoria',
        args: {
            codigo: {type: GraphQLNonNull(GraphQLString)},
            nombre: {type: GraphQLNonNull(GraphQLString)},
        },
        async resolve(parent, {codigo, nombre}, {models}) {
            const verificar_codigo = await models.Categoria.getAll()
            if (!verificar_codigo.some(element => element.codigo === codigo))
                return models.Categoria.create({codigo, nombre})
            else
                return {id: false}

        }
    },
    updateCategoria: {
        type: CategoriaType,
        description: 'Actualiza una Categoria por id',
        args: {
            id: {type: GraphQLNonNull(GraphQLString)},
            update: {type: GraphQLNonNull(GraphQLJSON)},
        },
        async resolve(parent, {id, update}, {models}) {
            const categoria = await models.Categoria.getById(id)
            const verificar = await models.Categoria.getAll()
            if (categoria.codigo === update.codigo) {
                return models.Categoria.update({id, update})
            } else {
                if (!verificar.some(element => element.codigo === update.codigo)) {
                    return models.Categoria.update({id, update})
                } else {
                    return {id: false}
                }
            }

        }
    },
    deleteCategoria: {
        type: CategoriaType,
        description: 'Elimina una Categoria por id',
        args: {
            id: {type: GraphQLNonNull(GraphQLString)}
        },
        resolve(parent, {id}, {models}) {

            return models.Categoria.delete(id)
        }
    },
    activateCategoria: {
        type: CategoriaType,
        description: 'Activa una categoria por id',
        args: {
            id: {type: GraphQLNonNull(GraphQLString)}
        },
        resolve(parent, {id}, {models}) {
            return models.Categoria.activate(id)
        }
    }
}