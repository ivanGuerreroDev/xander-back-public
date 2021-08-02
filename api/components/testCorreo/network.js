
const express = require('express')
const nodemailer = require('nodemailer')

const response = require('../../../network/response')
const ControllerCorreo = require('../correo/index')

const router = express.Router()


router.get('/', (req, res, next) => {
    ControllerCorreo.sendCorreo({
        to: 'corea@gmail.com',
        subject: 'Testing nice',
        text: 'Nice',
        html: '<h1>Just testing </h1>'
    })
        .then(data => response.success(req, res, data, 200))
        .catch(next)
})

module.exports = router