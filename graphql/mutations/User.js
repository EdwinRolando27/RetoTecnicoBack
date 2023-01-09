const {GraphQLNonNull, GraphQLString, GraphQLBoolean} = require("graphql")
const {GraphQLJSON} = require("graphql-type-json")
const moment = require("moment")

const {UserType} = require("../types")
const {createToken} = require("../../scripts/jwt")

module.exports = {
    createUser: {
        type: UserType,
        args: {
            email: {type: GraphQLNonNull(GraphQLString)},
            nombres: {type: GraphQLNonNull(GraphQLString)},
            password: {type: GraphQLNonNull(GraphQLString)},
        },
        async resolve(parent, args, {models}) {
            let listblack = ['yopmail.com', 'dghetian.com', 'gexik.com', 'vusra.com', 'omibrown.com', 'd3bb.com', 'selectedovr.com', 'crepeau12.com', 'thejoker5.com', 'otozuz.com', 'wallypos.com', 'pebih.com', 'mnqlm.com', 'ichigo.me', 'mtlcz.com', 'stvbz.com', 'u461.com', 'xeiex.com', 'timevod.com', 'busantei.com', 'tmednews.com', 'ryj15.tk', 'decorbuz.com', 'gexik.com', 'cantouri.com', 'ergowiki.com', 'cantouri.com', 'wawue.com', 'mxgsby.com', 'aethiops.com', 'driely.com', 'bio123.net', 'nubenews.com', 'mustale.com', 'vusra.com', 'ofenbuy.com', 'reciaz.com', 'ospul.com', 'bylup.com', 'proxiesblog.com', 'cnxingye.com', '87708b.com', 'pebih.com', 'htpquiet.com', 'wondeaz.com', 'proxiesblog.com', 'merry.pink', 'goqoez.com', 'deypo.com', '0ranges.com', 'uxsolar.com', 'unicobd.com', 'biyac.com']
            let user = await models.User.getByEmail(args.email)

            if (user) return null
            if (listblack.find(item => item === args.email.split('@')[1])) return {id: 123}

            user = await models.User.create(args)

            const auth = createToken(user)
            user = {...user, ...auth}

            return user
        }
    }
}