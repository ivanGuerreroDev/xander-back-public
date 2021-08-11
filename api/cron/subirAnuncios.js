const moment = require('moment')

const fullFormat = 'YYYY-MM-DD HH:mm:ss'



const ControllerSubidaPersonalizadaCompleta = require("../components/subidaPersonalizadaCompleta/index")
const ControllerComercio = require("../components/comercio/index")
const ControllerSubidaPersonalizadaConfig = require("../components/subidaPersonalizadaConfig/index")

const actualizarSubidasPersonalizadas = async () => {
    var actualizar = await ControllerSubidaPersonalizadaCompleta.getComerciosParaActualizar()
    console.table(actualizar)
    const config = await ControllerSubidaPersonalizadaConfig.list()

    const { cron_segundos } = config[0]
    console.log(`Running every ${ cron_segundos } second(s)`)

    actualizar.map(async a => {
        const { id, posicion, update_at, fecha_inicio, fecha_fin, fecha_fin_total, incremento } = a

        const fechaInicio = moment(fecha_inicio).utc().format("YYYY-MM-DD HH:mm:ss")
        const fechaFin = moment(fecha_fin).utc().format("YYYY-MM-DD HH:mm:ss")
        const fechaFinTotal = moment(fecha_fin_total).utc().format("YYYY-MM-DD HH:mm:ss")
        const posicionFormateada = moment(posicion).utc().format("YYYY-MM-DD HH:mm:ss")
        const updateAt = moment(update_at).utc().format("YYYY-MM-DD HH:mm:ss")
        const newUpdateAt = moment(update_at).add(incremento, "minutes").utc().format("YYYY-MM-DD HH:mm:ss")

        // console.log("Fecha Inicio:", fechaInicio, "Fecha fin:", fechaFin)
        // console.log("-- ---- --- --- ")
        // console.log("Posicion Actual:", posicionFormateada, "Actualizar:", updateAt)
        // console.log("-- ---- --- --- ")
        // console.log("Nuevo Actualizar:", newUpdateAt, "Fecha Fin total:", fechaFinTotal)
        // console.log("-- ---- --- --- ")

        if (newUpdateAt <= fechaFin) {
            // Actualizar
            await ControllerComercio.updateSubidaPersonalizada({
                id,
                posicion: updateAt,
                update_at: newUpdateAt
            })
        } else {
            // Actualizar al siguiente subida personalizada detalle
            const nextUpdates = await ControllerSubidaPersonalizadaCompleta.getNextUpdates(newUpdateAt, id)
            console.table(nextUpdates)            
            if (nextUpdates.length > 0) {
                const { fecha_inicio, fecha_fin, incremento } = nextUpdates[0]

                const fInicio = moment(fecha_inicio).utc().format("YYYY-MM-DD HH:mm:ss")
                const fFin = moment(fecha_fin).utc().format("YYYY-MM-DD HH:mm:ss")

                console.log(fInicio, fFin)

                await ControllerComercio.updateSubidaPersonalizada({
                    id,
                    posicion: updateAt,
                    update_at: fInicio
                })
            } else {
                await ControllerComercio.updateSubidaPersonalizada({
                    id,
                    posicion: updateAt,
                    update_at: null,
                    id_subida_personalizada_completa: null
                })
            }
        }
    })
}

const subirAnuncios = async () => {
    /*
        *   Get de anuncios
        *   inicio <= update_at
        *   fin >=  update_at
        *   update_at < AHORA
    */
    var anuncios = await ControllerSubidaPersonalizadaCompleta.getComerciosParaActualizar()

    // Configuracion de subidas
    const config = await ControllerSubidaPersonalizadaConfig.list()
    const { cron_segundos, subidas_minimas, porcentaje_restante } = config[0]
    console.log(`Cada ${ cron_segundos } segundos, se sube ${ subidas_minimas } anuncios con porcentaje de exceso de  ${ porcentaje_restante }`)
    const cant_anuncios_por_subida = parseInt(subidas_minimas * ( porcentaje_restante + 1 ))
    /**
     * tabla de anuncios para subir
     */
    const tabla_anuncios_por_subir = anuncios.map( a => {
        return {
            id: a.id,
            posicion: a.posicion,
            update_at: a.update_at,
            fecha_inicio: a.fecha_inicio,
            fecha_fin: a.fecha_fin,
            fecha_fin_total: a.fecha_fin_total,
            incremento:  a.incremento
        }
    })
    // Shuffle array
    const shuffled = await tabla_anuncios_por_subir.sort(() => 0.5 - Math.random());
    let anuncios_que_subiran = shuffled.slice(0, cant_anuncios_por_subida);
    await anuncios_que_subiran.map( async anuncio => {
        const {id, update_at, fecha_fin, incremento } = anuncio
        const fechaFin = moment(fecha_fin).utc().format(fullFormat)
        const updateAt = moment(update_at).utc().format(fullFormat)
        const newUpdateAt = moment(update_at).add(incremento, "minutes").utc().format(fullFormat)
        /**
         * Sube el anuncio si:
         * - La siguiente fecha de incremento supera la fecha fin
         * - La ultima subida es menor que la siguiente fecha de incremento, lo cual quiere decir que no se ha subido aun
         */
        if (newUpdateAt <= fechaFin) {
            await ControllerComercio.updateSubidaPersonalizada({
                id,
                posicion: updateAt,
                update_at: newUpdateAt
            })
        }else{
            /**
            * Buscar subidas para dias siguientes y colocar en update_at del comercio
            */
            const nextUpdates = await ControllerSubidaPersonalizadaCompleta.getNextUpdates(newUpdateAt, id)
            console.table(nextUpdates) 
            if (nextUpdates.length > 0) {
                const { fecha_inicio } = nextUpdates[0]
                const fInicio = moment(fecha_inicio).utc().format(fullFormat)
                await ControllerComercio.updateSubidaPersonalizada({
                    id,
                    posicion: updateAt,
                    update_at: fInicio
                })
            } else {
                /**
                 * Eliminacion de subida de anuncio
                 */
                await ControllerComercio.updateSubidaPersonalizada({
                    id,
                    posicion: updateAt,
                    update_at: null,
                    id_subida_personalizada_completa: null
                })                
            }
        }
    })
}

module.exports = subirAnuncios