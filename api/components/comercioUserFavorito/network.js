const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.post('/', secure('checktoken'), upsert)
router.post('/es-favorito', secure('checktoken'), esFavorito)

function upsert (req, res, next) {
    Controller.upsert(req.user, req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function esFavorito (req, res, next) {
    Controller.esFavorito(req.user, req.body)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router