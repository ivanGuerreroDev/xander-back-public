const { nanoid } = require('nanoid')

const TABLA = 'state'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function getByStateId(id) {
        return store.stored_procedure('get_cities_by_state_id', `'${ id }'`)
    }

    return {
        getByStateId,
    }
}