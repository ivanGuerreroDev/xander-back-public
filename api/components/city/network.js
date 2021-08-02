const express = require('express')
const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.get('/get-by-id-state/:id', getByStateId)

function getByStateId (req, res, next) {
    Controller.getByStateId(req.params.id)
        .then((lista) => {
            response.success(req, res, lista, 200)
        })
        .catch(next)
}

module.exports = router