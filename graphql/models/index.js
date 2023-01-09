const modelUser = require("./User")
const modelRole = require("./Role")
const modelMedico = require("./Medico")
const modelCategoria = require("./Categoria")
const modelRecomendaciones = require("./Recomendaciones")
const modelNews = require("./News")
const modelSugerencias = require("./Sugerencias")
const modelRespuestas= require("./Respuestas")
const modelPreguntas= require("./Preguntas")

module.exports = {
    modelUser: ({user}) => modelUser({user}),
    modelRole: ({user}) => modelRole({user}),
    modelMedico: ({user}) => modelMedico({user}),
    modelCategoria: ({user}) => modelCategoria({user}),
    modelRecomendaciones: ({user}) => modelRecomendaciones({user}),
    modelNews: ({user}) => modelNews({user}),
    modelSugerencias: ({user}) => modelSugerencias({user}),
    modelRespuestas: ({user})=>modelRespuestas({user}),
    modelPreguntas: ({user})=>modelPreguntas({user})
}