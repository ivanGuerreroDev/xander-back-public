const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')

const secure = require('../user/secure')

const router = express.Router()

router.get('/', secure('admin'), list)
router.get('/get-id-paypal', getIdPaypal)
router.post('/', secure('admin'), upsert)
router.put('/', secure('admin'), upsert)
router.post('/set-paypal-activo', secure('admin'), setPaypalActivo)

function list (req, res, next) {
    Controller.list()
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function getIdPaypal (req, res, next) {
    Controller.getIdPaypal()
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function setPaypalActivo (req, res, next) {
    Controller.setPaypalActivo(req.body.id)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router