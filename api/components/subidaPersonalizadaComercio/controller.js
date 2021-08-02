const { nanoid } = require('nanoid')

const TABLA = 'subida_personalizada_comercio'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    async function upsert({ id_comercio, starts_at, expires_at, data}) {

        const dataJSON = JSON.parse(data)

        const subidaPersonalizadaComercio = {
            id: nanoid(),
            id_comercio,
            starts_at,
            expires_at
        }

        const subidaPersonalizadaComercioStored = await store.upsert(TABLA, subidaPersonalizadaComercio)
        console.log(subidaPersonalizadaComercioStored)

        dataJSON.map(dj => {
            // Guardar el detalle
            const detalleSubidaPersonalizadaComercio = {
                id: nanoid(),
                id_subida_personalizada_comercio: subidaPersonalizadaComercio.id,
                subidas: dj.subidas,
                fecha_inicio: dj.fechas[0]
            }

            // Guardar


            dj.fechas.map(f => {
                // Guardar la fecha

                // Guardar
            })
        })

        // let subida = {
        //     id: nanoid(),
        //     id_comercio,
        //     starts_at,
        //     expires_at
        // }

        // return store.upsert(TABLA, subida)
    }

    return {
        upsert
    }
}