const { nanoid } = require('nanoid')
const moment = require('moment')

const TABLA = 'subida_personalizada_completa'

const ControllerSubidaPersonalizadaDetalle = require('../subidaPersonalizadaCompletaDetalle/index.js')
const ControllerSubidaPersonalizadaDetalleFecha = require('../subidaPersonalizadaCompletaDetalleFecha/index.js')
const ControllerComercio = require('../comercio/index')

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return store.stored_procedure_without_params("get_subida_comercio_completo_list")
    }

    function upsert({ dataHeader, dataArray }) {
        return new Promise(async (resolve, reject) => {
            const { idComercio, fechaInicio, fechaFin, destacar, id_transaccion, tipo_transaccion } = dataHeader 

            try {        
                // Objeto principal que sera guardado como referencia para luego realizar las subidas en el servidor
                const subidaPersonalizadaUltima = {
                    id: nanoid(),
                    id_comercio: idComercio,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    created_at: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
                    destacar,
                    id_transaccion, 
                    tipo_transaccion
                }
                const subidaPersonalizadaUltimaSaved = await store.upsert(TABLA, subidaPersonalizadaUltima)

                let subidasPersonalizadasCompletaDetalleSaved = []

                // Recorrer el array de subidas para luego guardarlo en la base de datos       
                for (let i = 0 ; i < dataArray.length ; i++) {
                    const { fechaInicio, fechaFin, incremento, subidas } = dataArray[i]

                    const subidaPersonalizadaCompletaDetalle = {
                        id: nanoid(),
                        id_subida_personalizada_completa: subidaPersonalizadaUltima.id,
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        subidas,
                        incremento
                    }

                    const subidaPersonalizadaCompletaDetalleSaved = await ControllerSubidaPersonalizadaDetalle.upsert(subidaPersonalizadaCompletaDetalle)
                    subidasPersonalizadasCompletaDetalleSaved.push(subidaPersonalizadaCompletaDetalleSaved)
                }

                // Update tabla comercio
                const comercio = {
                    id: idComercio,
                    id_subida_personalizada_completa: subidaPersonalizadaUltima.id,
                    update_at: subidaPersonalizadaUltima.fecha_inicio
                }

                await ControllerComercio.updateSubidaPersonalizada(comercio)

                resolve({
                    testing: true,
                    subidaPersonalizadaUltimaSaved,
                    subidasPersonalizadasCompletaDetalleSaved,
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    function getComerciosParaActualizar () {
        return store.stored_procedure_without_params('get_comercio_actualizar')
    }

    function getNextUpdates (date, idComercio) {
        return store.stored_procedure('get_next_updates', `'${ date }', '${ idComercio }'`)
    }

    return {
        list,
        upsert,
        getComerciosParaActualizar,
        getNextUpdates
    }
}