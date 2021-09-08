const { nanoid } = require('nanoid')

const TABLA = 'config'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    async function upsert(body) {

        const { fotos_s3, home_v, permitir_lives, correos_ses, anuncios_zona } = body

        let tag = {
            id: body.id ? body.id : nanoid(),
            fotos_s3,
            home_v,
            permitir_lives,
            correos_ses,
            anuncios_zona
        }

        return store.upsert(TABLA, tag)
    }

    return {
        list,
        upsert
    }
}