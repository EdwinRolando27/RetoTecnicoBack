const {GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean} = require("graphql")
const {GraphQLJSON} = require("graphql-type-json")
const {timestamp} = require("../../scripts/utils")
const {NewsType} = require("../types")

module.exports = {
    createNews: {
        type: NewsType,
        args: {
            etiqueta: {type: GraphQLString},
            descripcion: {type: GraphQLString},
            contenido_html: {type: GraphQLString},
            foto: {type: GraphQLString}
        },
        async resolve(parent, {etiqueta, descripcion, contenido_html}, {models}) {
            return await models.News.create({etiqueta, descripcion, contenido_html})
        }
    },
    updateNews: {
        type: NewsType,
        args: {
            id: {type: GraphQLString},
            update: {type: GraphQLJSON}
        },
        async resolve(parent, {id, update}, {models}) {
            return await models.News.update({id, update})
        }
    },
    eliminarActivarNews: {
        type: NewsType,
        args: {
            id: {type: GraphQLString},
            eliminar: {type: GraphQLBoolean}
        },
        async resolve(parent, {id, eliminar}, {models}) {
            return await models.News.deleteActivateNews(id, eliminar)
        }
    },
    selectNews: {
        type: GraphQLList(NewsType),
        args: {
            mostrar: {
                type: GraphQLBoolean
            }
        },
        async resolve(parent, {mostrar}, {models}) {
            return await models.News.selectNews(mostrar)
        }
    },
    newsByID: {
        type: NewsType,
        args: {
            id: {type: GraphQLString}
        },
        async resolve(parent, {id}, {models}) {
            return await models.News.getById(id)
        }
    }

}