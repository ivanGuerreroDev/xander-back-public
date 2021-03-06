
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const secure = require('../user/secure')

const router = express.Router()

router.get('/', secure("admin"), list)
router.post('/', secure("admin"), upsert)
router.get('/truncate-comercio-subidas', truncateData)
 
function list (req, res, next) {
    Controller.list()
        .then((lista) => {
            response.success(req, res, lista, 200)
        })
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function truncateData (req, res, next) {
    Controller.truncateData()
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router