
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()

router.get('/get-by-id-comercio/:id', getByIdComercio)
router.post('/', upsert)

function getByIdComercio (req, res, next) {
    Controller.getByIdComercio(req.params.id)
        .then(tagComercio => {
            response.success(req, res, tagComercio, 200)
        })
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then((user) => {
            response.success(req, res, user, 201)
        })
        .catch(next)
}

module.exports = router