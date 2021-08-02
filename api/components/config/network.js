
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.get('/', secure('admin'), list)
router.post('/', secure('admin'), upsert)

function list (req, res, next) {
    Controller.list()
        .then((data) => { response.success(req, res, data, 200) })
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then((data) => { response.success(req, res, data, 200) })
        .catch(next)
}

module.exports = router