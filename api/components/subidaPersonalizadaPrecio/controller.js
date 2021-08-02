const { nanoid } = require('nanoid')
const moment = require('moment')

const TABLA = 'subida_personalizada_precio'


module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.stored_procedure_without_params("get_table_precios_personalizados")
    }

    function upsert({ rangoMaximo, precio }) {
        return new Promise(async (resolve, reject) => {
            const allData = await list()
            var id = nanoid()
            allData.map(a => {
                if (a.maximo == rangoMaximo) {
                    id = a.id
                }
            })

            try {        
                const response = await store.upsert(TABLA, {
                    id,
                    maximo: rangoMaximo,
                    precio,
                })
                
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    }

    return {
        list,
        upsert,
    }
}