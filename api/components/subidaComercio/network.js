
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')

const secure = require('../user/secure')

const router = express.Router()

router.get('/', list)
router.get('/get-by-user', secure('checktoken'), getByUser)
router.get('/get-subidas-by-comercio/:id', getSubidasByComercio)
router.post('/', upsert)

function list (req, res, next) {
    Controller.list()
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function getByUser (req, res, next) {
    Controller.getByUser(req.user)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function getSubidasByComercio (req, res, next) {
    Controller.getSubidasByComercio(req.params.id)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router