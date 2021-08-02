const { nanoid } = require('nanoid')

const ControllerPais = require('../pais/index')
const ControllerCiudad = require('../ciudad/index')
const ControllerLocalidad = require('../localidad/index')

const TABLA = 'ubicacion_comercio'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function get (id) {
        return store.get(TABLA, id)
    }

    function getByIdComercio (id_comercio) {
        return new Promise(async (resolve, reject) => {
            try {
                const ubicaciones = await store.query(TABLA, { id_comercio })
                const ubicacionesReturn = []
                for (let i = 0 ; i < ubicaciones.length ; i++ ){
                    const { id, direccion, direccion_detallada, id_pais, id_ciudad, id_localidad } = ubicaciones[i]

                    const pais = await ControllerPais.getById(id_pais)
                    const ciudad = await ControllerCiudad.getById(id_ciudad)
                    const localidad = await ControllerLocalidad.getById(id_localidad)

                    console.log(id_localidad)

                    const u = {
                        id,
                        pais,
                        ciudad,
                        localidad,
                        direccion, 
                        direccion_detallada
                    }
                    ubicacionesReturn.push(u)
                }         

                resolve(ubicacionesReturn)
            } catch (error) {
                reject(error)
            }
        })
    }

    function upsert(body) {

        const { pais, ciudad, localidad, id_comercio, direccion, direccion_detallada, latitud, longitud } = body

        return new Promise(async (resolve, reject) => {
            try {
                const paisResponse = await ControllerPais.upsert(pais)
                const ciudadResponse = await ControllerCiudad.upsert(ciudad)
                const localidadResponse = await ControllerLocalidad.upsert(localidad)
                
                const ubicacion = {
                    id: nanoid(),
                    id_comercio,
                    latitud,
                    longitud,
                    id_pais: paisResponse.data.id,
                    id_ciudad: ciudadResponse.data.id,
                    id_localidad: localidadResponse.data.id,
                    direccion,
                    direccion_detallada
                }

                const ubicacionIngresada = await store.upsert(TABLA, ubicacion)
                resolve(ubicacionIngresada)
            } catch (error) {
                reject(error)
            }
        })
    }

    return {
        get,
        getByIdComercio,
        upsert
    }
}