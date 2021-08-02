const { nanoid } = require('nanoid')

const TABLA = 'foto_comercio'

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

    function getByIdComercio(id_comercio) {
        return store.query(TABLA, { id_comercio })
    }

    async function upsert(body) {
        const { url, id_comercio, tipo } = body

        const foto = {
            url,
            id_comercio,
            tipo
        }

        if (body.id) {
            foto.id = body.id
        } else {
            foto.id = nanoid()
        }

        return store.upsert(TABLA, foto)
    }

    async function deleteById(id) {
        return store.stored_procedure('delete_foto_comercio', `'${ id }'`)
    }

    return {
        list,
        get,
        getByIdComercio,
        upsert,
        deleteById
    }
}