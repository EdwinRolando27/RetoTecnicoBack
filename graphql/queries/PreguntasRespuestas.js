const {GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean} = require("graphql")
const {GraphQLJSON} = require("graphql-type-json")
const {PreguntasType} = require("../types");

module.exports={
    createPreguntas: {
        type: PreguntasType,
        args: {
            descripcion: {type: GraphQLString},
            encabezado: {type: GraphQLString},
            id_user: {type: GraphQLString},
        }
    },
    async resolve(parent, args, {models}){
        return await models.Preguntas.create(args)
    }
}