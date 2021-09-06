const { nanoid } = require('nanoid')

const TABLA = 'config_subidas'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    async function upsert(body) {
        const { zona, tipo, subidas_x_hora, avisos_x_cron, interval_seg_cron } = body
        let data = {
            id: 1,
            zona,
            tipo,
            subidas_x_hora,
            avisos_x_cron,
            interval_seg_cron
        }
        return store.upsert(TABLA, data)
    }


    return {
        list,
        upsert
    }
}