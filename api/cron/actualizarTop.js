const moment = require('moment')
const subidaComercioController = require('../components/subidaComercio/index')
const comercioTopController = require('../components/comercioTop/index')
const comercioTop = require('../components/comercioTop/index')

const fullFormat = 'YYYY-MM-DD HH:mm:ss'

const actualizarTop = () => {
    console.log('NEW')

    // Fecja y hora actual
    const date = moment.utc(new Date())
    let subidasNuevas = 0
    let subidasActualizaciones = 0

    // Revisar actualizaciones
    comercioTopController.list()
        .then(response => {
            response.forEach(res => {
                const { actual, actualizacion, id } = res

                const dateActual = moment.utc(actual)
                const dateActualizacion = moment.utc(actualizacion)

                console.log('Actual actualización')
                console.log(dateActual.format(fullFormat), dateActualizacion.format(fullFormat))
                console.log(date.format(fullFormat))

                if (dateActualizacion.format(fullFormat) <= date.format(fullFormat) && subidasActualizaciones < 5) {
                    subidasActualizaciones++
                    console.log(subidasActualizaciones)
                    console.log('Actualizar')

                    subidaComercioController.get(res.id_subida_comercio)
                        .then(response => {
                            const { fecha_fin, fecha_inicio, horas, subidas_dia, id, id_comercio } = response[0]           
                            const fechaFin = moment.utc(fecha_fin)
                            const fechaInicio = moment.utc(fecha_inicio)

                            const data = actualizar(date.format(fullFormat), fechaInicio.format(fullFormat), fechaFin.format(fullFormat), fechaInicio.hours(), horas, subidas_dia)
                            
                            if (data.actual > fechaFin) {
                                comercioTopController.borrar(id)
                                    .then(data => {
                                        console.log(data)
                                    })
                                    .catch(error => {
                                        console.log(error)
                                    })
                                return
                            }

                            let updateComercioTop = res
                            updateComercioTop.actual = data.actual
                            updateComercioTop.actualizacion = data.nextUpdate
                            comercioTopController.upsert(updateComercioTop)
                                .then(ctActualizado => console.log(ctActualizado))
                                .catch(error => console.log(error))
                        })
                        .catch(error => {
                            console.log(error)
                        })

                    
                } else {
                    console.log('NO ACTUALIZAR ')
                }
            })
        })
        .catch(error => {
            console.log(error)
        })

    // Agregar de 0
    subidaComercioController.listParaTop()
        .then(response => {
            response.forEach(res => {
                const { fecha_fin, fecha_inicio, horas, subidas_dia, id, id_comercio } = res
                const fechaFin = moment.utc(fecha_fin)
                const fechaInicio = moment.utc(fecha_inicio)
                
                console.log('Rango fechas')
                console.log(fechaInicio.format(fullFormat), fechaFin.format(fullFormat))
                console.log(date.format(fullFormat))

                if (fechaInicio.format(fullFormat) <= date.format(fullFormat) && date.format(fullFormat) <= fechaFin.format(fullFormat)  && (subidasNuevas < 5)) {
                    subidasNuevas++
                    console.log(subidasNuevas)
                    console.log('FECHA SI')
    
                    const data = actualizar(date.format(fullFormat), fechaInicio.format(fullFormat), fechaFin.format(fullFormat), fechaInicio.hours(), horas, subidas_dia)
                    console.log(data)
                    
                    comercioTopController.upsert({
                        id_comercio,
                        id_subida_comercio: id,
                        actual: data.actual,
                        actualizacion: data.nextUpdate
                    })
                        .then(data => {
                            console.log('Agregado', data)
                        })
                        .catch(error => {
                            console.log(error)
                        })
                } else {
                    console.log('FECHA NO')
                } 
            })
            
        })
        .catch(error => {
            console.error(error)
        })
}


/** Este método se va a llamar desde un CRON JOB para actualizar la tabla temporal de tops, sólo cuando:
 *      1. la fecha y hora actual es mayor que la primera fecha y hora de la contratación de una subida (subida_comercio)
 *      2. la fecha y hora actual es mayor que la fecha de actualización de la tabla temporal de subidas tops
 */
const actualizar = (fechaActual, fechaInicio, fechaFin, hora1, horas, times) => {
    const data = actualizar2(fechaActual, fechaFin, hora1, horas, times)

    const fechaActualSinHora = moment(fechaActual).format('YYYY-MM-DD')

    if (fechaActual < data.actual && fechaActual > fechaInicio) {
        data.nextUpdate = data.actual
        data.actual = moment(new Date(`${ moment(fechaActualSinHora).format('YYYY-MM-DD') } ${ moment(fechaFin).hours() }:00:00`)).format('YYYY-MM-DD HH:mm:ss')
    }

    return data
} 

const actualizar2 = (fechaActual, fechaFin, hora1, horas, times) => {

    const fechaActualSinHora = moment(fechaActual).format('YYYY-MM-DD')

    let array = getHoras(fechaActualSinHora, hora1, horas, times)

    if(fechaActual < array[0] && (moment(fechaActual).hours() < moment(fechaFin).hours())) {
        const fechaActualMenos1 = moment(fechaActualSinHora).subtract(1, 'days').format('YYYY-MM-DD')
        array = getHoras(fechaActualMenos1, hora1, horas, times)
    }

    console.log(array)
    const ultimaActualizacionFechaActual = array[array.length - 1]
    

    if (fechaActual >= ultimaActualizacionFechaActual) {
        const ultimoArray = getHoras(fechaFin, hora1, horas, times)
        const ultimaActualizacionFechaFinal = ultimoArray[ultimoArray.length - 1]

        if (fechaActual >= ultimaActualizacionFechaFinal) {
            return {
                actual: ultimaActualizacionFechaFinal,
                nextUpdate: null
            }
        }



        return {
            actual: ultimaActualizacionFechaActual,
            nextUpdate: moment(new Date(`${ moment(fechaActual).add(1, 'day').format('YYYY-MM-DD') } ${ hora1 }:00:00`)).format('YYYY-MM-DD HH:mm:ss')
        }
    }

    for (let i = 0 ; i < array.length ; i++) {
        if (array[i] > fechaActual) {
            return {
                actual: array[i == 0 ? i : i - 1],
                nextUpdate: array[i == 0 ? i + 1 : i]
            }            
        }
    }
}

const getHoras = (dateActual, hora1, horas, times) => {
    const subirCadaMinutos = ((horas / ((times - 1))) * 60)
    let fechas = []

    for (let i = 0 ; i < times ; i++) {
        fechas.push(moment(new Date(dateActual + " 00:00:00")).add((hora1 * 60) + (subirCadaMinutos * i), 'minutes').format('YYYY-MM-DD HH:mm:ss'))
    }

    return fechas
}

module.exports = actualizarTop