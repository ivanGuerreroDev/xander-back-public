const { nanoid } = require('nanoid')

const TABLA = 'transaccion'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    function get(id) {
        return store.get(TABLA, id)
    }

    function upsert(paypal) {

        const transaccion = {
            id: nanoid(),
            created: new Date(paypal.create_time),
            id_paypal: paypal.id,
            email_payer: paypal.payer.email_address,
            name: paypal.payer.name.given_name + ' ' + paypal.payer.name.surname,
            amount: paypal.purchase_units[0].amount.value,
            currency: paypal.purchase_units[0].amount.currency_code,
            status: paypal.status,
            meta: JSON.stringify(paypal)
        }

        return store.upsert(TABLA, transaccion)
    }

    return {
        list,
        get,
        upsert,
    }
}