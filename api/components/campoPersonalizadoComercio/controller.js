const { nanoid } = require('nanoid')
const moment = require('moment')

const TABLA = 'campo_personalizado_comercio'


module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function upsert ({ id_campo_personalizado, id_comercio, valor }) {
        const campo = {
            id: nanoid(),
            id_campo_personalizado,
            id_comercio,
            valor
        }

        return store.upsert(TABLA, campo)
    }

    function getByIdComercio (id) {
        return store.stored_procedure('get_campos_by_comercio_id', `'${ id }'`)
    }

    return {
        upsert,
        getByIdComercio
    }
}