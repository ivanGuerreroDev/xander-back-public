const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()

router.post('/login', login)
router.post('/get-user', getUser)

function login(req, res) {
    Controller.login(req.body.username, req.body.password)
        .then(token => {
            response.success(req, res, token, 200)
        })
        .catch(error => {
            response.error(req,res, 'Información inválida', 400)
        })
}

function getUser(req, res) {
    Controller.getUser(req)
        .then(user => {
            response.success(req, res, user, 200)
        })
        .catch(error => {
            response.error(req,res, 'Información inválida', 400)
        })
}

module.exports = router