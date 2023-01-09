const {GraphQLObjectType, GraphQLString} = require("graphql")
const {GraphQLDateTime} = require("graphql-iso-date")


const UserType = new GraphQLObjectType({
    name: "UserBackup",
    fields: {
        id: {type: GraphQLString},
        email: {type: GraphQLString},
        nombres: {type: GraphQLString},
        deleted_at: {type: GraphQLDateTime},
        updated_at: {type: GraphQLDateTime},
        created_at: {type: GraphQLDateTime},
        authentication: {type: GraphQLString}
    }
})


module.exports = UserType