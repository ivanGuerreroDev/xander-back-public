
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()

router.get('/', list)
router.get('/:id', get)
router.get('/get-by-id-comercio/:id', getByIdComercio)
router.post('/', upsert)
router.put('/', upsert)

function list (req, res, next) {
    Controller.list()
        .then((lista) => {
            response.success(req, res, lista, 200)
        })
        .catch(next)
}

function get (req, res, next) {
    Controller.get(req.params.id)
        .then((user) => {
            response.success(req, res, user, 200)
        })
        .catch(next)   
}

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