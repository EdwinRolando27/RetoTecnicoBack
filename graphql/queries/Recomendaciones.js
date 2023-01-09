const {GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLFloat} = require("graphql")
const {GraphQLJSON} = require("graphql-type-json")
const {timestamp} = require("../../scripts/utils")
const {RecomendacionesType} = require("../types")

module.exports = {
    createRecomendacion: {
        type: RecomendacionesType,
        args: {
            orden: {type: GraphQLFloat},
            descripcion: {type: GraphQLString},
            categoria_id: {type: GraphQLString},
            contenido: {type: GraphQLString}
        },
        async resolve(parent, {orden, descripcion, categoria_id, contenido}, {models}) {
            return await models.Recomendaciones.create({orden, descripcion, categoria_id, contenido})
        }
    },
    updateRecomendaciones: {
        type: RecomendacionesType,
        args: {
            id: {type: GraphQLString},
            update: {type: GraphQLJSON},
        },
        async resolve(parent, {id, update}, {models}) {
            return await models.Recomendaciones.update({id, update})
        }
    },
    eliminarActivarRecomendacion: {
        type: RecomendacionesType,
        args: {
            id: {type: GraphQLString},
            eliminar: {type: GraphQLBoolean}
        },
        async resolve(parent, {id, eliminar}, {models}) {
            return await models.Recomendaciones.deleteActivateRecomendaciones(id, eliminar)
        }
    },
    selectRecomendaciones: {
        type: GraphQLList(RecomendacionesType),
        async resolve(parent, args, {models}) {
            return await models.Recomendaciones.getAll()
        }
    }
}