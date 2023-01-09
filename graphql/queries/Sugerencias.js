const {GraphQLString, GraphQLList, GraphQLBoolean, GraphQLFloat} = require("graphql")
const {GraphQLJSON} = require("graphql-type-json")
const {SugerenciasType} = require("../types");

module.exports = {
    createSugerencias: {
        type: SugerenciasType,
        args: {
            correo: {type: GraphQLString},
            numero: {type: GraphQLString},
            mensaje: {type: GraphQLString},
            nombre: {type: GraphQLString},
            asunto: {type: GraphQLString}
        },
        async resolve(parent, {correo, numero, mensaje, nombre, asunto}, {models}) {
            return await models.Sugerencia.create({
                correo, numero, mensaje, asunto, nombre, role_id: 'ea7e35be-220b-11ec-bdf8-13a4a75f3041'
            })
        }
    },
    updateRead: {
        type: SugerenciasType,
        args: {
            id: {type: GraphQLString}
        },
        async resolve(parent, {id}, {models}) {
            return await models.Sugerencia.updateRead(id)
        }
    },
    selectNoRead: {
        type: SugerenciasType,
        args: {
            no_read: {type: GraphQLBoolean}
        },
        async resolve(parent, {no_read}, {models}) {
            return {data: await models.Sugerencia.getNotRead(no_read)}
        }
    },
    sugerenciaId: {
        type: SugerenciasType,
        args: {
            id: {type: GraphQLString}
        },
        async resolve(parent, {id}, {models}) {
            return {data:await models.Sugerencia.getByid(id)}
        }
    }

}