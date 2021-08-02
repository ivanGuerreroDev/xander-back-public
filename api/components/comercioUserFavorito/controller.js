const { nanoid } = require('nanoid')

const TABLA = 'comercio_user_favorito'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function upsert (user, { id }) {
        return new Promise(async (resolve, reject) => {
            try {
                const buscar = await store.stored_procedure('get_favorito_by_user_comercio', `'${ user.id }', '${ id }'`)
                let respuesta = {}
                console.log(buscar)

                if (buscar.length == 0) {
                    // Agregar
                    await store.upsert(TABLA, {
                        id: nanoid(),
                        id_comercio: id,
                        id_user: user.id
                    })
                    respuesta.status = 'agregado'
                } else {
                    // quitar
                    const id_favorito_eliminar = buscar[0].id
                    await store.stored_procedure('delete_comercio_user_favorito_by_id', `'${ id_favorito_eliminar }'`)
                    respuesta.status = 'eliminado'
                }

                resolve(respuesta)
            } catch (error) {
                reject(error)
            }
        })
    }

    function esFavorito (user, { id }) {
        return store.stored_procedure('get_favorito_by_user_comercio', `'${ user.id }', '${ id }'`)
    }

    return {
        upsert,
        esFavorito,
    }
}