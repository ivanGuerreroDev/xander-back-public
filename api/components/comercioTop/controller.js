const { nanoid } = require('nanoid')

const TABLA = 'comercio_top'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    function upsert(comercioTop) {
        let guardar = comercioTop
        if (!comercioTop.id) {
            guardar.id = nanoid()
        }
        
        return store.upsert(TABLA, guardar)
    }

    function borrar (id) {
        return store.stored_procedure('delete_comercio_de_top', `'${ id }'`)
    }

    return {
        list,
        upsert,
        borrar
    }
}