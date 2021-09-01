const { nanoid } = require('nanoid')
const moment = require('moment')

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    async function subidas(body) {
        const { pais, zona, fecha} = body;
        const date = moment(fecha);
        const from_date = date.startOf('week').format('YYYY-MM-DD HH:mm:ss');
        const to_date = date.endOf('week').format('YYYY-MM-DD HH:mm:ss');
        const queryDays = `
            SELECT sum(d.subidas) as subidas, DAYOFWEEK(d.fecha_inicio) as weekday 
            FROM subida_personalizada_completa_detalle as d
            INNER JOIN subida_personalizada_completa as s on d.id_subida_personalizada_completa = s.id
            INNER JOIN comercio as c on s.id_comercio = c.id
            INNER JOIN country as country ON country.id = c.country
            LEFT JOIN state as state ON state.id = c.state
            LEFT JOIN city as city ON city.id = c.city
            WHERE 
                country.name = '${pais}' 
                AND (country.name = '${zona}' OR state.name = '${zona}' OR city.name = '${zona}')
                AND (d.fecha_inicio >= '${from_date}' AND d.fecha_fin <= '${to_date}')
            GROUP BY weekday
        `
        const days = await store.customQuery(queryDays)

        const from_hour = moment(fecha).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const to_hour = moment(fecha).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        const queryHours = `
            SELECT d.subidas, d.fecha_inicio
            FROM subida_personalizada_completa_detalle as d
            INNER JOIN subida_personalizada_completa as s on d.id_subida_personalizada_completa = s.id
            INNER JOIN comercio as c on s.id_comercio = c.id
            INNER JOIN country as country ON country.id = c.country
            LEFT JOIN state as state ON state.id = c.state
            LEFT JOIN city as city ON city.id = c.city
            WHERE 
                country.name = '${pais}' 
                AND (country.name = '${zona}' OR state.name = '${zona}' OR city.name = '${zona}')
                AND (d.fecha_inicio >= '${from_hour}' AND d.fecha_fin <= '${to_hour}')
        `
        const hours = await store.customQuery(queryHours)

        return { days, hours }
    }

    return {
        subidas,
    }
}