const globalAuth = require('../../auth/index')

// Controllers
const ControllerComercio = require('../components/comercio/index')

// Mensajes
module.exports = async function (socket, io, data) {
    const { msg, chatRoom } = data
    const { id_comercio, id_user, id_user_comercio_chat, sender } = chatRoom

    const comercioResponse = await ControllerComercio.get(id_comercio)
    const comercio = comercioResponse[0]

    // Enviar mensaje al dueño del comercio
    io.emit(comercio.id_user, {
        msg,
        chatRoom,
    })
    // Enviar mensaje a quien lo esta enviando
    io.emit(id_user, {
        msg,
        chatRoom,
    })

    

    // const { tokenChatRoom, authToken } = data

    // try {
    //     // Confirmar que los tokens son válidos
    //     const tokenChatRoomData = globalAuth.verify(tokenChatRoom)
    //     const tokenUserData = globalAuth.verify(authToken)
    //     const sender = tokenChatRoomData.id_user == tokenUserData.id ? 'user' : 'comercio'
        
    //     socket.emit('confirmarConversacion', {
    //         tokenChatRoomData,
    //         tokenUserData,
    //         sender
    //     })
    // } catch (error) {
    //     socket.emit('tokenNoValido', 'UNAUTHORIZED')
    // }

    // socket.on('mensaje', (msgData) => {
    //     const { msg, tokenChatRoom, authToken } = msgData
    //     try {
    //         // Confirmar que los tokens son válidos
    //         const tokenChatRoomData = globalAuth.verify(tokenChatRoom)
    //         const tokenUserData = globalAuth.verify(authToken)
    //         const sender = tokenChatRoomData.id_user == tokenUserData.id ? 'user' : 'comercio'

    //         // Almacenar mensajes y emitir el mensaje a los usuarios conectados
    //         console.log({
    //             sender,
    //             tokenChatRoomData,
    //             tokenUserData,
    //             msg
    //         })

    //         // Enviar mensaje
    //         io.emit(tokenChatRoomData.id_user_comercio_chat, {
    //             sender,
    //             msg
    //         })
    //     } catch (error) {
    //         // reject error
    //         console.log(error)
    //     }
    // })



    

    // // To current user
    // socket.emit('message', 'Example')

    // // Broadcast when a user connects
    // socket.broadcast.emit()

    // // To everyone
    // io.emit('message', 'A user has join the chat')

    // // Runs when client desconnects
    // socket.on('disconnect', () => {
    //     io.emit('message', 'A user has left the chat')
    // })

    // // Listen for chatMessage
    // socket.on('chatMessage', (message) => {
    //     console.log(message)
    // })
}