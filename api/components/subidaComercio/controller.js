const { nanoid } = require('nanoid')

const TABLA = 'subida_comercio'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.stored_procedure_without_params('get_subida_comercio_list')
    }

    function get(id) {
        return store.get(TABLA, id)
    }

    function getSubidasByComercio (id_comercio) {
        return store.stored_procedure('get_subidas_by_id_comercio', `'${ id_comercio }'`)
    }

    function listParaTop() {
        return store.stored_procedure_without_params('get_comercios_para_top')
    }

    function upsert(subidaComercio) {
        let guardar = subidaComercio
        if (!subidaComercio.id) {
            guardar.id = nanoid()
        }
        
        return store.upsert(TABLA, guardar)
    }

    function getByUser(user) {
        return store.stored_procedure('get_subida_comercio_by_id_usuario', `'${ user.id }'`)
    }

    return {
        list,
        get,
        getByUser,
        getSubidasByComercio,
        listParaTop,
        upsert
    }
}