const TABLA = 'estilos'


module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    function upsert (data) {
        return store.upsert(TABLA, data)
    }


    return {
        list,
        upsert
    }
}