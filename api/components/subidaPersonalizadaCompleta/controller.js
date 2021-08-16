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
    function listSubidaConf(zona) {
        let query = '';
        switch (zona) {
            case 'COUNTRY':
                query = `
                    SELECT MAX(a.subidas) as subidas_max , a.hora, a.zona, a.country FROM
                        (
                            SELECT 
                                SUM(detalle.subidas) as subidas,
                                detalle.fecha_inicio as hora,
                                country.name as country, country.name as zona
                            FROM subida_personalizada_completa_detalle as detalle
                            INNER JOIN subida_personalizada_completa as subida ON detalle.id_subida_personalizada_completa = subida.id
                            INNER JOIN comercio as comercio ON comercio.id = subida.id_comercio
                            INNER JOIN country as country ON country.id = comercio.country
                            WHERE detalle.fecha_inicio > NOW()
                            GROUP BY hora, zona
                        ) as a
                    GROUP BY a.zona
                `
                break;
            case 'STATE':
                query = `
                    SELECT MAX(a.subidas) as subidas_max , a.hora, a.zona, a.state FROM
                        (
                            SELECT 
                                SUM(detalle.subidas) as subidas,
                                detalle.fecha_inicio as hora,
                                country.name as country, country.name, state.name as zona
                            FROM subida_personalizada_completa_detalle as detalle
                            INNER JOIN subida_personalizada_completa as subida ON detalle.id_subida_personalizada_completa = subida.id
                            INNER JOIN comercio as comercio ON comercio.id = subida.id_comercio
                            INNER JOIN country as country ON country.id = comercio.country
                            INNER JOIN state as state ON state.id = comercio.state
                            WHERE detalle.fecha_inicio > NOW()
                            GROUP BY hora, zona
                        ) as a
                    GROUP BY a.zona
                `;
                break;
            case 'CITY':
                query = `
                    SELECT MAX(a.subidas) as subidas_max , a.hora, a.zona, a.state, a.city FROM
                        (
                            SELECT 
                                SUM(detalle.subidas) as subidas,
                                detalle.fecha_inicio as hora,
                                country.name as country, country.name, state.name as state, city.name as zona
                            FROM subida_personalizada_completa_detalle as detalle
                            INNER JOIN subida_personalizada_completa as subida ON detalle.id_subida_personalizada_completa = subida.id
                            INNER JOIN comercio as comercio ON comercio.id = subida.id_comercio
                            INNER JOIN country as country ON country.id = comercio.country
                            INNER JOIN state as state ON state.id = comercio.state
                            LEFT JOIN city as city ON city.id = comercio.city
                            WHERE detalle.fecha_inicio > NOW()
                            GROUP BY hora, zona
                        ) as a
                    GROUP BY a.zona
                `;
                break;
            default:
                break;
        }
        return store.customQuery(query)
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
        listSubidaConf,
        upsert,
        getComerciosParaActualizar,
        getNextUpdates
    }
}