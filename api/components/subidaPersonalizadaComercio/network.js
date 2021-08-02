
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.post('/', upsert)

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then((data) => {
            response.success(req, res, data, 201)
        })
        .catch(next)
}

module.exports = router