const { nanoid } = require('nanoid')

const TABLA = 'tag'

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
        let tag = {
            nombre: body.nombre,
            habilitado: body.habilitado,
            admin: body.admin
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