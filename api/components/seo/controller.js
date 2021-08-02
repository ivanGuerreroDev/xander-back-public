const { nanoid } = require('nanoid')

const TABLA = 'seo'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list () {
        return store.list(TABLA)
    }

    function get(page) {
        return store.query(TABLA, { page })
    }

    function upsert (seo) {
        return new Promise(async (resolve, reject) => {
            try {
                const seoResponse = await store.query(TABLA, { page: seo.page })
                let seoStore = seoResponse.length == 0 ? { id: nanoid() } : seoResponse[0]

                seoStore.page = seo.page
                seoStore.title = seo.title
                seoStore.description = seo.description

                const stored = await store.upsert(TABLA, seoStore)                

                resolve({
                    stored
                })
            } catch( error ) {
                reject(error)
            }
        })
    }

    return {
        list,
        get,
        upsert
    }
}