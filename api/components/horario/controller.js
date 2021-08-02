const { nanoid } = require('nanoid')

const TABLA = 'horario_comercio'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function upsert({dia, desde, hasta, id_comercio, numero_dia }) {
        let horario = {
            id: nanoid(),
            id_comercio,
            dia,
            desde,
            hasta, 
            numero_dia
        }

        return store.upsert(TABLA, horario)
    }

    function getByIdComercio (id_comercio) {
        return store.stored_procedure('get_horario_by_id_comercio', `'${ id_comercio }'`)
    }

    return {
        upsert,
        getByIdComercio
    }
}