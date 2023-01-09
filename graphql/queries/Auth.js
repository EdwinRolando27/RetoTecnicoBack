const {GraphQLNonNull, GraphQLString} = require("graphql"),
    bcrypt = require("bcrypt"),
    moment = require('moment')

const {createToken, decodeToken, verifyToken} = require("../../scripts/jwt"),
    {UserType} = require("../types")

module.exports={
    login:{
        type: UserType,
        args: {
            email: {type: GraphQLNonNull(GraphQLString)},
            password: {type: GraphQLNonNull(GraphQLString)}
        },
        async resolve(parent, args, {models}){

        }
    }
    ,
    refresh: {
        type: UserType,
        args: {
            refresh: {type: GraphQLNonNull(GraphQLString)}
        },
        async resolve(parent, {refresh}, {models}) {
            refresh = verifyToken(refresh.replace('Bearer ', ''))
            if (refresh.id) {
                let user = await models.User.getById(refresh.id)
                return createToken(user)
            }
            return null
        }
    },
    reset: {
        type: UserType,
        args: {
            email: {type: GraphQLNonNull(GraphQLString)}
        },
        async resolve(parent, {email}, {models}) {
            // let user = await models.User.getByEmail(email.toLowerCase())

            if (user)
                user.authentication = undefined

            if (user.email_verified_at === null)
                return {
                    authentication: 'reset'
                }

            if (user.email)
                // return await sendEmail({user, tipo: 'reset'})

            return null
        }
    }
}