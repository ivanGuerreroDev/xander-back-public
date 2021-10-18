const moment = require('moment')
const store = require('../../store/mysql')
const fullFormat = 'YYYY-MM-DD HH:mm:ss'
const fs = require('fs');

const ControllerSubidaPersonalizadaCompleta = require("../components/subidaPersonalizadaCompleta/index")
const ControllerComercio = require("../components/comercio/index")
var logger = require("../../logger");

const subirAnuncios = async (tipo, avisos_x_cron, tipo_zona = undefined, zona = undefined) => {
    /*
        *   Get de anuncios
        *   inicio <= update_at
        *   fin >=  update_at
        *   update_at < AHORA
    */
    let query;
    query = `
        SELECT c.id, c.posicion, c.nombre, c.update_at, spcd.fecha_inicio, spcd.fecha_fin, spc.fecha_fin as fecha_fin_total,
            spcd.incremento, NOW() as timestamp
        FROM comercio as c
        INNER JOIN subida_personalizada_completa as spc on c.id_subida_personalizada_completa = spc.id
        INNER JOIN subida_personalizada_completa_detalle as spcd ON spcd.id_subida_personalizada_completa = spc.id
        INNER JOIN country as country ON country.id = c.country
        LEFT JOIN state as state ON state.id = c.state
        LEFT JOIN city as city ON city.id = c.city
        WHERE spcd.fecha_fin >= c.update_at
        AND c.update_at <= NOW() AND TIMESTAMPDIFF(HOUR, NOW(), spcd.fecha_inicio) = 0
        AND ${tipo_zona.toLowerCase()}.name = '${zona}'
    `
    const anuncios = await store.customQuery(query)

    // Configuracion de subidas
    const cant_anuncios_por_subida = avisos_x_cron;
    /**
     * tabla de anuncios para subir
     */
    const tabla_anuncios_por_subir = anuncios.map(a => {
        return {
            id: a.id,
            posicion: a.posicion,
            update_at: a.update_at,
            fecha_inicio: a.fecha_inicio,
            fecha_fin: a.fecha_fin,
            fecha_fin_total: a.fecha_fin_total,
            incremento: a.incremento,
            nombre: a.nombre,
            timestamp: a.timestamp
        }
    })
    // Shuffle array
    const shuffled = await tabla_anuncios_por_subir.sort(() => 0.5 - Math.random());
    let anuncios_que_subiran = shuffled.slice(0, cant_anuncios_por_subida);
   
    logger.info(moment().utc().format(fullFormat)," - Anuncios subidos "+anuncios_que_subiran.length+ " en "+zona+ ":"+"\n")
    await anuncios_que_subiran.map(async anuncio => {
        const { id, nombre, update_at, fecha_fin, incremento, fecha_inicio } = anuncio
        const fechaFin = moment(fecha_fin)
        const updateAt = moment(update_at)
        let newUpdateAt = moment(fecha_inicio).utc().add(incremento, "minutes")
        if(moment(fecha_inicio) < updateAt){
            newUpdateAt = moment(update_at).utc().add(incremento, "minutes")
        }
        const ahora = moment().utc().format(fullFormat)
        /**
         * Sube el anuncio si:
         * - La siguiente fecha de incremento supera la fecha fin
         * - La ultima subida es menor que la siguiente fecha de incremento, lo cual quiere decir que no se ha subido aun
         */
        if (updateAt <= moment() && updateAt < fechaFin) {
            await ControllerComercio.update({
                id: id,
                posicion: ahora,
                update_at: newUpdateAt.format(fullFormat)
            })
        } else {
            /**
            * Buscar subidas para dias siguientes y colocar en update_at del comercio
            */
            const nextUpdates = await ControllerSubidaPersonalizadaCompleta.getNextUpdates(newUpdateAt, id)
            if (nextUpdates.length  === 0) {
                /**
                 * Eliminacion de subida de anuncio
                 */
                await ControllerComercio.update({
                    id,
                    update_at: null,
                    id_subida_personalizada_completa: null
                })
            }
        }
    })
    await anuncios_que_subiran.forEach(ad =>
        logger.info("Hora UTC : "+moment().utc().format(fullFormat)+ " - ID: "+ ad.id+ " - Nombre: "+ ad.nombre+"\n")
    )
    
}

module.exports = subirAnuncios