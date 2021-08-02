const { nanoid } = require('nanoid')

const tagController = require('../tag/index')

const TABLA = 'tag_comercio'

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

    function getByIdComercio(id) {
        return store.stored_procedure('get_tags_by_id_comercio', `'${ id }'`)
    }


    async function upsert(body) {
        const tagComercio = {
            id_tag: body.id_tag,
            id_comercio: body.id_comercio
        }

        if (body.id) {
            tagComercio.id = body.id
        } else {
            tagComercio.id = nanoid()
        }

        return store.upsert(TABLA, tagComercio)
    }


    function deleteTagByIdComercio (idComercio) {
        return store.stored_procedure('delete_tags_comercio', `'${ idComercio }'`)
    }

    return {
        list,
        get,
        getByIdComercio,
        upsert,
        deleteTagByIdComercio
    }
}