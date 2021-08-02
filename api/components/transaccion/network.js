const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')

const secure = require('../user/secure')

const router = express.Router()

router.get('/', list)
router.get('/:id', secure('admin'), get)
router.post('/', upsert)

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

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then((user) => {
            response.success(req, res, user, 201)
        })
        .catch(next)
}

module.exports = router