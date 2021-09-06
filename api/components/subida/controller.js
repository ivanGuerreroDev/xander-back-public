const { nanoid } = require('nanoid')

const TABLA = 'subida'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.stored_procedure_without_params('get_subidas_precio_asc')
    }


    function upsert(data) {
        const { duracion, subidas_dia, precio } = data

        const subida = {
            id: data.id ? data.id : nanoid(),
            habilitado: data.habilitado ? data.habilitado : true,
            duracion,
            subidas_dia,
            precio
        }

        return store.upsert(TABLA, subida)
    }

    return {
        list,
        upsert,
    }
}