const express = require('express')
const Controller = require('./index')

const router = express.Router()

router.post('/upload-notificacion', uploadNotificacion)

function uploadNotificacion (req, res, next) {
    Controller.uploadNotificacion(req, res)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(next)
}

module.exports = router