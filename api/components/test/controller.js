const { nanoid } = require('nanoid')
const moment = require('moment')

const TABLA = 'test'


module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function get (date) {
        return store.upsert(TABLA, {
            id: nanoid(),
            date
        })
    }

    function date () {
        return new Promise(async (resolve, reject) => {
            try {
                const dates = await store.list(TABLA)

                resolve({
                    dates,
                    local: moment.utc(new Date()).format('YYYY-MM-DD HH:mm:ss')
                })
            } catch (error) {
                reject(error.message)
            }
        })
    }

    function upsert (data) {
        console.log(data)

        return store.upsert(TABLA, {
            id: nanoid(),
            date: data.momentDate
        })
    }

    return {
        get,
        date,
        upsert
    }
}