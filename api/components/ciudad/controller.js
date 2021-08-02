const { nanoid } = require('nanoid')

const TABLA = 'ciudad'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function getById (id) {
        return store.get(TABLA, id)
    }

    function getByNombre (nombre) {
        return store.query(TABLA, { nombre })
    }

    function upsert(body) {

        return new Promise(async (resolve, reject) => {
            try {
                // Ver si ya existe en la base de datos
                const ciudadEncontrada = await getByNombre(body.nombre)
            
                if (ciudadEncontrada.length > 0) {
                    return resolve({
                        data: ciudadEncontrada[0]
                    })
                }

                // Crear uno nuevo
                let ciudad = {
                    id: nanoid(),
                    nombre: body.nombre,
                    nombre_corto: body.nombre_corto
                }

                const ciudadCreada = await store.upsert(TABLA, ciudad)
                resolve(ciudadCreada)
            } catch (error) {
                reject(error)
            }
        })
    }

    return {
        getById,
        getByNombre,
        upsert
    }
}