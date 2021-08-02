const { nanoid } = require('nanoid')

const TABLA = 'categoria'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    function get(id) {
        return store.get(TABLA, id)
    }

    async function upsert(body) {
        const tag = {
            nombre: body.nombre,
            habilitado: body.habilitado
        }

        if (body.id) {
            tag.id = body.id
        } else {
            tag.id = nanoid()
        }

        return store.upsert(TABLA, tag)
    }

    return {
        list,
        get,
        upsert
    }
}