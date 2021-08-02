const { nanoid } = require('nanoid')
const moment = require('moment')

const TABLA = 'subida_personalizada_config'


module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.list(TABLA)
    }

    function upsert({ cronSegundos, subidasMinimas, porcentajeExceso }) {
        return new Promise(async (resolve, reject) => {

            try {        
                
                const response = await store.upsert(TABLA, {
                    id: "config",
                    subidas_minimas: subidasMinimas,
                    porcentaje_restante: porcentajeExceso,
                    cron_segundos: cronSegundos
                })
                
                resolve(response)
            } catch (error) {
                reject(error)
            }
        })
    }

    function truncateData () {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await store.stored_procedure_without_params('truncate_data')
                resolve("Datos eliminados")
            } catch (error) {
                reject(error)
            }
        })
    }

    return {
        list,
        upsert,
        truncateData
    }
}