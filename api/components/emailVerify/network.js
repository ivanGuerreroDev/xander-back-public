const express = require('express')

const secure = require('../user/secure')
const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()

router.get('/verify-token', secure('checkEmailToken'), verifyToken)

function verifyToken (req, res, next) {
    Controller.verifyToken(req)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router