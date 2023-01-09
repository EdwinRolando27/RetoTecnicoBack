const {GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean} = require("graphql")
const {GraphQLJSON} = require("graphql-type-json")
const {timestamp} = require("../../scripts/utils")
const {MedicosType} = require("../types")

module.exports = {
    createMedicos: {
        type: MedicosType,
        args: {
            nombres: {type: GraphQLString},
            apellidos: {type: GraphQLString},
            especialidad: {type: GraphQLString},
            dni: {type: GraphQLString},
            contenido_html: {type: GraphQLString},
            foto: {type: GraphQLString}
        },
        async resolve(parent, {nombres, apellidos, especialidad, dni, contenido_html, foto}, {models}) {
            return await models.Medicos.create({nombres, apellidos, especialidad, dni, contenido_html, foto})
        }
    },
    updateMedicos: {
        type: MedicosType,
        args: {
            id: {type: GraphQLString},
            update: {type: GraphQLJSON},
        },
        async resolve(parent, {id, update}, {models}) {
            return await models.Medicos.update({id, update})
        }
    },
    eliminarActivarMedico: {
        type: MedicosType,
        args: {
            id: {type: GraphQLString},
            eliminar: {type: GraphQLBoolean}
        },
        async resolve(parent, {id, eliminar}, {models}) {
            return await models.Medicos.deleteActivateMedico(id, eliminar)
        }
    },
    selectMedicos: {
        type: GraphQLList(MedicosType),
        args: {
            mostrar: {type: GraphQLBoolean}
        },
        async resolve(parent, {mostrar}, {models}) {
            return await models.Medicos.selectMedicos(mostrar)
        }
    }
}