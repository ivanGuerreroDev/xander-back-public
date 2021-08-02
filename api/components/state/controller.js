const { nanoid } = require('nanoid')

const TABLA = 'state'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function getByIdCountry(id) {
        return store.stored_procedure('get_states_by_country_id', `'${ id }'`)
    }

    return {
        getByIdCountry,
    }
}