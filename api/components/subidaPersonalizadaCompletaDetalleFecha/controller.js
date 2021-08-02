const { nanoid } = require('nanoid')
const moment = require('moment')

const TABLA = 'subida_personalizada_completa_detalle_fecha'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    function upsert(subidaPersonalizadaCompletaDetalleFecha) {
        return store.upsert(TABLA, subidaPersonalizadaCompletaDetalleFecha)
    }

    return {
        list,
        upsert
    }
}