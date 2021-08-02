const express = require('express')

const secure = require('./secure')
const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()

router.get('/', secure('admin'), list)
router.get('/:id', get)
router.post('/', secure('checkEmailToken'), upsert)
router.post('/get-user', getUser)
router.put('/', upsert)
router.put('/admin-update', secure("admin"), adminUpdate)
router.post('/get-token-email', getTokenEmail)
router.post('/login-google', loginGoogle)
router.post('/login-facebook', loginFacebook)

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
    Controller.upsert(req.email, req.body)
        .then((user) => {
            response.success(req, res, user, 201)
        })
        .catch(next)
}

function adminUpdate (req, res, next) {
    Controller.adminUpdate(req.body)
        .then((user) => {
            response.success(req, res, user, 201)
        })
        .catch(next)
}

function getUser (req, res, next) {
    Controller.getUser(req)
        .then(user => {
            response.success(req, res, user, 200)
        })
        .catch(next)
}

function getTokenEmail (req, res, next) {
    Controller.getTokenEmail(req.body.email, req.body.url)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

function loginGoogle(req, res, next) {
    Controller.loginGoogle(req.body.token_id)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

function loginFacebook(req, res, next) {
    Controller.loginFacebook(req.body)
        .then(data => response.success(req, res, data, 200))
        .catch(next)
}

module.exports = router