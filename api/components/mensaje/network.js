
const express = require('express')
const secure = require('../user/secure')

const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()

router.post('/', secure('checkChatToken'), enviarMensaje)
router.post('/get-token', secure('checktoken'), getToken)
router.get('/get-token-decoded', secure('checkChatToken'), getTokenDecoded)
router.get('/get-mensajes', secure('checktoken'), getMensajesByUser)
router.get('/get-no-leidos', secure('checktoken'), getMensajesNoLeidos)
router.put('/set-visto', secure('checktoken'), setVisto)
router.delete('/delete', secure('checktoken'), deleteById)

function enviarMensaje (req, res, next) {
    Controller.enviarMensaje(req.body, req.chat)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function getToken(req, res, next) {
    Controller.getToken(req.body.id_comercio, req.user)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function getTokenDecoded (req, res, next) {
    Controller.getTokenDecoded(req.chat)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function getMensajesByUser (req, res, next) {
    Controller.getMensajesByUser(req.user)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function setVisto (req, res, next) {
    Controller.setVisto(req.body.id_mensaje)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function deleteById (req, res, next) {
    Controller.deleteById(req.body.id)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function getMensajesNoLeidos (req, res, next) {
    Controller.getMensajesNoLeidos(req.user)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

module.exports = router