const { nanoid } = require('nanoid')

const TABLA = 'pais'

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
                const paisEncontrado = await getByNombre(body.nombre)
            
                if (paisEncontrado.length > 0) {
                    return resolve({
                        data: paisEncontrado[0]
                    })
                }

                // Crear uno nuevo
                let pais = {
                    id: nanoid(),
                    nombre: body.nombre,
                    nombre_corto: body.nombre_corto
                }

                const paisCreado = await store.upsert(TABLA, pais)
                resolve(paisCreado)
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