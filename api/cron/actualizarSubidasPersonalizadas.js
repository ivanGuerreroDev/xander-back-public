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

module.exports = actualizarSubidasPersonalizadas