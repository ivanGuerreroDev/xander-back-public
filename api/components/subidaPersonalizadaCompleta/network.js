
const express = require('express')

const response = require('../../../network/response')
const Controller = require('./index')
const configSubidas = require('../configSubidas')
const secure = require('../user/secure')

const router = express.Router()

router.get('/', secure("admin"), list)
router.get('/configurador', /*secure("admin"),*/ listSubidaConf)
router.post('/', upsert)

function list (req, res, next) {
    Controller.list()
        .then((lista) => {
            response.success(req, res, lista, 200)
        })
        .catch(next)
}

async function listSubidaConf (req, res, next) {
    const config = await configSubidas.list()
    const {tipo, zona, subidas_x_hora, avisos_x_cron, interval_seg_cron} = config[0]
    Controller.listSubidaConf(zona)
        .then((lista) => {
            console.log(lista)
            response.success(req, res, lista, 200)
        })
        .catch(next)
}

function upsert (req, res, next) {
    Controller.upsert(req.body)
        .then(data => response.success(req, res, data, 201))
        .catch(next)
}

module.exports = router