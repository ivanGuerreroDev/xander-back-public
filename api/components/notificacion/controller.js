const { nanoid } = require('nanoid')
const moment = require('moment')

const ControllerCorreo = require('../correo/index')

const TABLA = 'notificacion'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function upsert ({ to, html, subject }) {
        return new Promise(async (resolve, reject) => {

            // Enviar correos
            // const correoResponse = await ControllerCorreo.sendCorreo({to: to.map(t => t.email), subject, text: '', html})

            // Guardar en la base de datos
            const notificacionResponse = await store.upsert(TABLA, {
                id: nanoid(),
                subject,
                notificacion: html,
                fecha: moment.utc().format('YYYY-MM-DD HH-mm-ss')
            })
            for (let i = 0 ; i < to.length ; i++) {
                await store.upsert(`${ TABLA }_user`, {
                    id: nanoid(),
                    id_notificacion: notificacionResponse.data.id,
                    id_user: to[i].id,
                    visto: false
                })
            }

            resolve({
                to,
                html,
                correoResponse: null
            })
        })
    }

    function getNotificaciones (user) {
        return store.stored_procedure('get_notificaciones_by_id_user', `'${ user.id }'`)
    }

    function getNoLeidas (user) {
        return store.stored_procedure('get_notificaciones_no_leidos_by_id_user', `'${ user.id }'`)
    }

    function marcarComoLeido (id) {
        return store.stored_procedure('set_notificacion_vista', `'${ id }'`)
    }

    function deleteNotificacion (id) {
        return store.stored_procedure('delete_notificacion_by_id', `'${ id }'`)
    }

    return {
        upsert,
        getNotificaciones,
        getNoLeidas,
        marcarComoLeido,
        deleteNotificacion
    }
}