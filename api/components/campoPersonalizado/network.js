
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.get('/', list)
router.post('/', secure('admin'), upsert)
router.put('/', secure('admin'), upsert)

function list (req, res, next) {
    Controller.list(req.params.page)
        .then(tag => {
            response.success(req, res, tag, 200)
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