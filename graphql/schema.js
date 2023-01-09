const {GraphQLObjectType, GraphQLSchema} = require("graphql")
const {user, caseUser, selectUsers} = require("./queries/User")
const {createUser} = require("./mutations/User")
const {createCategoria, activateCategoria, deleteCategoria, updateCategoria} = require("./mutations/Categoria")
const {categoria, categorias, categoriaNoDeleted} = require("./queries/Categoria")
const {selectMedicos, createMedicos, eliminarActivarMedico, updateMedicos} = require("./queries/Medicos")
const {login} = require("./queries/User")
const {
    createRecomendacion, eliminarActivarRecomendacion, selectRecomendaciones, updateRecomendaciones
} = require("./queries/Recomendaciones")
const {selectNews, createNews, eliminarActivarNews, updateNews, newsByID} = require("./queries/News")
const {createSugerencias, updateRead, selectNoRead, sugerenciaId} = require("./queries/Sugerencias")


module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "RootQueryType",
        type: "Query",
        description: 'All Queries',
        fields: {
            user, login, selectUsers, caseUser,
            // medicos
            selectMedicos, createMedicos, eliminarActivarMedico, updateMedicos,
            //Categorias
            categoria, categorias, categoriaNoDeleted,
            //Recomendaciones
            createRecomendacion, eliminarActivarRecomendacion, selectRecomendaciones, updateRecomendaciones,
            //NEWS
            selectNews, createNews, eliminarActivarNews, updateNews, newsByID,
            //Sugerencias
            createSugerencias, updateRead, selectNoRead, sugerenciaId
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'RootMutationType',
        type: "Mutation",
        description: 'All Mutations',
        fields: {
            createUser,
            //Categorias
            createCategoria, activateCategoria, deleteCategoria, updateCategoria
        }
    })

})