const { nanoid } = require('nanoid')

const TABLA = 'sub_categoria_comercio'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function getByIdComercio(id) {
        return store.stored_procedure('get_tags_by_id_comercio', `'${ id }'`)
    }


    async function upsert(body) {
        const subCategoriaComercio = {
            id_sub_categoria: body.id_sub_categoria,
            id_comercio: body.id_comercio
        }

        if (body.id) {
            subCategoriaComercio.id = body.id
        } else {
            subCategoriaComercio.id = nanoid()
        }

        return store.upsert(TABLA, subCategoriaComercio)
    }


    function deleteTagByIdComercio (idComercio) {
        return store.stored_procedure('delete_tags_comercio', `'${ idComercio }'`)
    }

    return {
        getByIdComercio,
        upsert,
        deleteTagByIdComercio
    }
}