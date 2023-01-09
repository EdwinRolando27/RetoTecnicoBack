const {GraphQLNonNull, GraphQLString, GraphQLList} = require("graphql")
const {UserType} = require("../types")
const bcrypt = require("bcrypt");
const {createToken} = require("../../scripts/jwt");
module.exports = {
    user: {
        type: UserType,
        description: 'User por id',
        args: {
            id: {type: GraphQLNonNull(GraphQLString)}
        },
        resolve(parent, {id}, {models}) {
            return models.User.getById(id)
        }
    },
    login: {
        type: UserType,
        args: {
            email: {type: GraphQLNonNull(GraphQLString)},
            password: {type: GraphQLNonNull(GraphQLString)}
        },
        async resolve(parent, args, {models}) {
            let user = await models.User.getByEmail(args.email.toLowerCase())
            if (!user) return null
            if (user.email_verified_at === null) return {authentication: 'verify'}

            if (user.email && await bcrypt.compare(args.password, user.password)) {
                return {...user, ...await createToken(user)}
            }
            return null
        }
    },
    selectUsers: {
        type: GraphQLList(UserType),
        async resolve(parent, args, {models}) {
            return await models.User.selectUsers()
        }
    },
    caseUser: {
        type: UserType,
        args: {
            id: {type: GraphQLString},
            caso: {type: GraphQLString}
        },
        async resolve(parent, {id, caso}, {models}) {
            return await models.User.deleteActivateVerify(id, caso)
        }
    },
    getAllUser: {
        type: UserType,
        async resolve(parent, args, {models}) {
            return await models.User.getAll()
        }
    }
}