
const express = require('express')
const secure = require('../user/secure')
const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()

router.post('/get-list', list)
router.get('/get-favoritos', secure('checktoken'), getFavoritosByUser)
router.get('/get-by-id/:id', get)
router.get('/admin-list/get', secure('admin'), adminList)
router.get('/get-by-user', secure('checktoken'), getByUser)
router.get('/get-by-slug/:slug', getBySlug)
router.get('/get-name-count/:name', getNameCount)
router.post('/', secure('checktoken'), upsert)
router.post('/actualizar', secure('checktoken'), update)
router.post('/subir-fotos', subirFotos)
router.post('/get-vistos', getVistos)
router.put('/info-general', updateInfoGeneral)
router.put('/actualizar-ubicacion-principal', updateUbicacion)

function list (req, res, next) {
    Controller.list(req.body)
        .then((lista) => {
            response.success(req, res, lista, 200)
        })
        .catch(next)
}

function getFavoritosByUser (req, res, next) {
    Controller.getFavoritosByUser(req.user)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function get(req, res, next) {
    Controller.get(req.params.id)
        .then((lista) => {
            response.success(req, res, lista, 200)
        })
        .catch(next)

}

function adminList (req, res, next) {
    Controller.adminList()
        .then((lista) => {
            response.success(req, res, lista, 200)
        })
        .catch(next)
}

function getByUser (req, res, next) {
    console.log('here')
    Controller.getByUser(req.user)
        .then(data => response.success(req, res,data, 200))
        .catch(next)
}

function getBySlug (req, res, next) {
    Controller.getBySlug(req.params.slug)
        .then(data => {
            response.success(req, res, data, 200)
        })
        .catch(next)   
}

function getNameCount (req, res, next) {
    Controller.getNameCount(req.params.name)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req, res)
        .then(user => {
            response.success(req, res, user, 201)
        })
        .catch(next)
}

function update (req, res, next) {
    Controller.update(req, res)
        .then(user => {
            response.success(req, res, user, 201)
        })
        .catch(next)
}

function subirFotos (req, res, next) {
    Controller.subirFotos(req, res)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function updateInfoGeneral (req, res, next) {
    Controller.updateInfoGeneral(req.body)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function getVistos (req, res, next) {
    Controller.getVistos(req.body)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function updateUbicacion (req, res, next) {
    Controller.updateUbicacion(req.body) 
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router