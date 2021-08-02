
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.post('/get-user-token', secure('checktoken'), getUserToken)
router.post('/get-comercio-token', secure('checktoken'), getComercioToken)
router.post('/get-chat-rooms-by-id-user-comercios', getChatRoomsByIdUserComercios)
router.get('/decode-token', secure('checkChatToken'), decodeToken)

function getUserToken (req, res, next) {
    Controller.getUserToken(req.body, req.user)
        .then((data) => {
            response.success(req, res, data, 200)
        })
        .catch(next)
}

function getComercioToken (req, res, next) {
    Controller.getComercioToken(req.body, req.user)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function getChatRoomsByIdUserComercios (req, res, next) {
    Controller.getChatRoomsByIdUserComercios (req.body.id_user)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function decodeToken (req, res, next) {
    Controller.decodeToken(req.chat)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router