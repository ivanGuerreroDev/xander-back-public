const { nanoid } = require('nanoid')
const moment = require('moment')
const authGlobal = require('../../../auth')

const TABLA = 'mensaje'

// Controladores
const CorreoController = require('../correo/index')
const UserController = require('../user/index')
const ComercioController = require('../comercio/index')

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function enviarMensaje ({ mensaje }, { id_user, id_comercio }) {
        return new Promise(async (resolve, reject) => {
            try {
                // Usuario
                const userResponse = await UserController.get(id_user)
                const user = userResponse[0]

                const comercioResponse = await ComercioController.get(id_comercio)
                const comercio = comercioResponse[0]

                // Enviar correo
                await CorreoController.sendCorreo({
                    to: comercio.email,
                    subject: `Tu comercio <${ comercio.nombre }> tiene un nuevo mensaje de ${ user.name }`,
                    html: `
                    <p>${ mensaje }</p>
                    <a href="mailto:${ user.email }?subject=${ comercio.nombre }&body=Saludos ${ user.name } gracias por contactarte con nosotros...">Iniciar una conversación con ${ user.name }</a>  
                    <p style="color: red;">Las respuestas enviadas a este correo seran ignoradas, usa el enlace de arriba para iniciar una conversación con ${ user.name }</p>
                    `
                })

                // Guardar los datos
                const mensajeAGuardar = {
                    id: nanoid(),
                    id_user,
                    id_comercio,
                    mensaje,
                    visto: false,
                    fecha: moment.utc().format('YYYY-MM-DD HH:mm:ss')
                }

                const mensajeGuardado = await store.upsert(TABLA, mensajeAGuardar)

                resolve(mensajeGuardado)
            } catch (error) {
                reject(error)
            }
        })
    }

    function getToken (id_comercio, user) {
        console.log(user)
        return new Promise(async (resolve, reject) => {
            try {
                const comercioData = await store.get(TABLA, id_comercio)
                const comercio = comercioData[0]

                const tokenInfo = {
                    id_user: user.id,
                    id_comercio
                }
                const tokenAuth = await authGlobal.sign(tokenInfo)

                resolve(tokenAuth)

            } catch (error) {
                reject(error)
            }
        })
    }

    function getTokenDecoded(tokenDecoded) {
        return new Promise((resolve, reject) => {
            resolve(tokenDecoded)
        })
    }

    function getMensajesByUser(user) {
        return store.stored_procedure('get_mensajes_by_id_user', `'${ user.id }'`)
    }

    function getMensajesNoLeidos(user) {
        return store.stored_procedure('get_mensajes_no_leidos_by_id_user', `'${ user.id }'`)
    }

    function setVisto(id_mensaje) {
        return store.stored_procedure('set_mensaje_visto', `'${ id_mensaje }'`)
    }

    function deleteById (id) {
        return store.stored_procedure('delete_mensaje_by_id', `'${ id }'`)
    }

    return {
        enviarMensaje,
        getToken,
        getTokenDecoded,
        getMensajesByUser,
        getMensajesNoLeidos,
        setVisto,
        deleteById
    }
}