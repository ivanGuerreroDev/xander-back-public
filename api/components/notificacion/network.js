const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.post('/', upsert)
router.get('/get-notificaciones', secure('checktoken'), getNotificaciones)
router.get('/get-no-leidas', secure('checktoken'), getNoLeidas)
router.put('/set-visto', secure('checktoken'), marcarComoLeido)
router.delete('/delete', secure('checktoken'), deleteNotificacion)

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function getNotificaciones (req, res, next) {
    Controller.getNotificaciones(req.user)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function getNoLeidas (req, res, next) {
    Controller.getNoLeidas(req.user)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function marcarComoLeido (req, res, next) {
    Controller.marcarComoLeido(req.body.id_notificacion) 
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function deleteNotificacion (req, res, next) {
    Controller.deleteNotificacion (req.body.id)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

module.exports = router