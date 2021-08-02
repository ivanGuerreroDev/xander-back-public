const { nanoid } = require('nanoid')
const authGlobal = require('../../../auth')

const ControllerUser = require('../user/index')

const TABLA = 'user_comercio_chat'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }
    
    function getUserToken (body, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id_comercio } = body
                const { id: id_user } = user
                let token_user_comercio_chat = {}

                // Revisar si ya existe un registro asociado a ese usuario y comercio
                const responseSearch = await store.stored_procedure('get_chat_room_by_user_comercio', `'${ id_user }', '${ id_comercio }'`)

                // Si no existe, crear la sala
                if (responseSearch.length == 0) {
                    const room = {
                        id: nanoid(),
                        id_user,
                        id_comercio
                    }

                    await store.upsert(TABLA, room)

                    token_user_comercio_chat = {
                        id_user_comercio_chat: room.id,
                        id_user,
                        id_comercio
                    }
                } else {
                    // Si ya existe retornar el token
                    token_user_comercio_chat = {
                        id_user_comercio_chat: responseSearch[0].id,
                        id_user,
                        id_comercio
                    }
                }

                token_user_comercio_chat.sender = 'usuario'
    
                // Retornar el token firmado por el backend
                const tokenAuth = await authGlobal.sign(token_user_comercio_chat)
                resolve(tokenAuth)

            } catch (error) {
                reject(error)
            }
        })
    }

    function getComercioToken (body, user) {
        return new Promise(async (resolve, reject) => {

            const { id_user, id_comercio } = body
            
            // Verificar si el comercio pertenece en realidad a user
            //

            // Obtener el objeto de la sala
            const responseSearch = await store.stored_procedure('get_chat_room_by_user_comercio', `'${ id_user }', '${ id_comercio }'`)
            
            // Crear el token
            token_user_comercio_chat = {
                id_user_comercio_chat: responseSearch[0].id,
                id_user,
                id_comercio,
                sender: 'comercio'
            }

            // Retornar el token firmado por el backend
            const tokenAuth = await authGlobal.sign(token_user_comercio_chat)
            resolve(tokenAuth)
        })
    }

    function getChatRoomsByIdUserComercios (id_user) {
        return new Promise(async (resolve, reject) => {
            try {
                const rooms = await store.stored_procedure('get_chat_rooms_by_comercios_id_user', `'${ id_user }'`)
                const roomsReturn = []

                for (let i = 0 ; i < rooms.length ; i++) {
                    const { id, id_user, id_comercio, nombre } = rooms[i]
                    const user = await ControllerUser.get(id_user)
                    const { name, email } = user[0]
                    roomsReturn.push({
                        id,
                        user: {
                            id_user, 
                            name, 
                            email
                        },
                        comercio: {
                            id: id_comercio,
                            nombre
                        }
                    })
                }

                resolve(roomsReturn)

            } catch (error) {
                reject(error)
            }
        })
    }

    function decodeToken (chat) {
        return new Promise((resolve, reject) => {
            try {
                // const tokenChatRoomData = globalAuth.verify(tokenChatRoom)
                // const tokenUserData = globalAuth.verify(authToken)
                resolve(chat)
            } catch (error) {
                reject(error)
            }
            
        })
    }

    return {
        getUserToken,
        getComercioToken,
        getChatRoomsByIdUserComercios,
        decodeToken
    }
}