const { nanoid } = require('nanoid')

const TABLA = 'localidad'

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
                const localidadEncontrada = await getByNombre(body.nombre)
            
                if (localidadEncontrada.length > 0) {
                    return resolve({
                        data: localidadEncontrada[0]
                    })
                }

                // Crear uno nuevo
                let localidad = {
                    id: nanoid(),
                    nombre: body.nombre,
                    nombre_corto: body.nombre_corto
                }

                const localidadCreada = await store.upsert(TABLA, localidad)
                resolve(localidadCreada)
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