const { nanoid } = require('nanoid')
const moment = require('moment')

const TABLA = 'campo_personalizado'


module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list () {
        return store.list(TABLA)
    }

    async function upsert(body) {
        let campoPersonalizado = {
            nombre: body.nombre,
            habilitado: body.habilitado
        }

        if (body.id) {
            campoPersonalizado.id = body.id
        } else {
            campoPersonalizado.id = nanoid()
        }

        return store.upsert(TABLA, campoPersonalizado)
    }

    return {
        list,
        upsert
    }
}