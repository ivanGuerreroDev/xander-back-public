const { nanoid } = require('nanoid')

const TABLA = 'paypal'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    function getIdPaypal() {
        return store.query(TABLA, { activo: true })  
    }

    function upsert(data) {
        const { nombre, id_cliente } = data

        const insert = {
            id: data.id ? data.id : nanoid(),
            nombre,
            id_cliente,
            activo: data.activo ? data.activo : false
        }

        return store.upsert(TABLA, insert)
    }

    function setPaypalActivo(id) {
        return store.stored_procedure('set_paypal_activo', `'${ id }'`)
    }

    return {
        list,
        getIdPaypal,
        upsert,
        setPaypalActivo,
    }
}