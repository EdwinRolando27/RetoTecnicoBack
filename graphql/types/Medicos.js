const {GraphQLObjectType, GraphQLString, GraphQLBoolean} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date")
const {GraphQLJSON} = require("graphql-type-json");

const MedicosType = new GraphQLObjectType({
    name: "MedicosType",
    fields: {
        id: {type: GraphQLString},
        nombres: {type: GraphQLString},
        apellidos: {type: GraphQLString},
        especialidad: {type: GraphQLString},
        dni: {type: GraphQLString},
        fecha_nacimiento: {type: GraphQLString},
        contenido_html: {type: GraphQLString},
        created_at: {type: GraphQLDateTime},
        updated_at: {type: GraphQLDateTime},
        deleted_at: {type: GraphQLDateTime},
        foto: {type: GraphQLString},
        data: {type: GraphQLJSON},
        status: {type: GraphQLBoolean}
    }
})
module.exports = MedicosType