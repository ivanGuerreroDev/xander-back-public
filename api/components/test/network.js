
const express = require('express')
const moment = require('moment')

const response = require('../../../network/response')
const Controller = require('./index')

const router = express.Router()


router.get('/', (req, res, next) => {
    const date = new Date()

    Controller.get(moment.utc(date).format('YYYY-MM-DD HH:mm:ss'))
        .then(result => response.success(req, res, result, 200))
        .catch(next)
})

router.get('/date', (req, res, next) => {
    Controller.date()
        .then(result => response.success(req, res, result, 200))
        .catch(next)
})

router.post('/', (req, res, next) => {
    Controller.upsert(req.body)
        .then(result => response.success(req, res, result, 200))
        .catch(next)
})

module.exports = router