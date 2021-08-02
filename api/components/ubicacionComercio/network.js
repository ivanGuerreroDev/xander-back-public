
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')

const secure = require('../user/secure')

const router = express.Router()

router.get('/get-by-id-comercio/:id_comercio', getByIdComercio)
router.post('/', upsert)

function getByIdComercio (req, res, next) {
    Controller.getByIdComercio(req.params.id_comercio)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

module.exports = router