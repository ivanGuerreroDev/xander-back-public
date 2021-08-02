const { nanoid } = require('nanoid')

const TABLA = 'country'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    return {
        list,
    }
}