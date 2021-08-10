const { nanoid } = require('nanoid')
const authGlobal = require('../../../auth')

const ControllerCorreo = require('../correo/index')
const ControllerAuth = require('../auth/index')
const ControllerEmailVerify = require('../emailVerify/index')

const TABLA = 'user'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list() {
        return new Promise(async (resolve, reject) => {
            
            try {
                const lista = await store.list(TABLA)
                const response = []

                for (let i = 0 ; i < lista.length ; i++) {
                    const user = lista[i]

                    const authData = await ControllerAuth.getAuthById(user.id)
                    const { rol } = authData[0]

                    const comerciosResponse = await store.stored_procedure('get_comercios_by_id_user', `'${ user.id }'`)
                    const { comercios } = comerciosResponse[0]

                    const subidasResponse = await store.stored_procedure('get_subidas_by_id_user', `'${ user.id }'`)
                    const { subidas } = subidasResponse[0]

                    const subidasVigentesResponse = await store.stored_procedure('get_subidas_vigentes_by_id_user', `'${ user.id }'`)
                    const { subidas_vigentes } = subidasVigentesResponse[0]

                    user.rol = rol
                    user.comercios = comercios
                    user.subidas = subidas
                    user.subidas_vigentes = subidas_vigentes

                    response.push(user)
                }

                resolve(response)
            } catch (error) {
                reject('Error interno')
            }
        })
    }

    function get(id) {
        return store.get(TABLA, id)
    }

    const loginGoogle = tokenId => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await authGlobal.verifyGoogle(tokenId)

                const { userid, payload } = response
                const { email, name } = payload

                // Ver si ya hay un usuario con ese email verificado en google
                const emailsResponse = await store.query(TABLA, { email })
                let yaEstaEnGoogle = false
                let userToken = {}
                
                // Ya existe un usuario
                if (emailsResponse.length > 0) {
                    const authData = await ControllerAuth.getAuthById(emailsResponse[0].id)
                    yaEstaEnGoogle = authData[0].google_provider_id != null

                    if (!yaEstaEnGoogle) {
                        // Actualizar id de google
                        await ControllerAuth.updateGoogleId(authData[0].id, userid)
                    }

                    userToken = {
                        id: authData[0].id,
                        username: authData[0].username,
                        rol: authData[0].rol
                    }
                } else {
                    // Si no existe guardarlo
                    const user = {
                        id: nanoid(),
                        name,
                        username: userid,
                        email,
                        habilitado: true
                    }

                    // Guardar datos de auth
                    await ControllerAuth.upsert({
                        id: user.id,
                        username: userid,
                        google_provider_id: userid
                    })

                    await store.upsert(TABLA, user)

                    userToken = {
                        id: user.id,
                        username: user.username,
                        rol: 'usuario'
                    }
                }

                // Retornar el token firmado por el backend
                const tokenAuth = await authGlobal.sign(userToken)
                resolve(tokenAuth)

            } catch (error) {
                reject(error)
            }
        })
    }

    const loginFacebook = ({ accessToken, email, name, userID }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await authGlobal.verifyFacebook(accessToken, userID)

                // Todo ok
                if (response.info == 0) {
                    // Ver si ya existe en la bd
                    const emailsResponse = await store.query(TABLA, { email })
                    let yaEstaEnFacebook = false
                    let userToken = {}

                    // Ya existe un usuario
                    if (emailsResponse.length > 0) {
                        const authData = await ControllerAuth.getAuthById(emailsResponse[0].id)
                        yaEstaEnFacebook = authData[0].facebook_provider_id != null

                        if (!yaEstaEnFacebook) {
                            // Actualizar id de facebook
                            await ControllerAuth.updateFacebookId(authData[0].id, userID)
                        }

                        userToken = {
                            id: authData[0].id,
                            username: authData[0].username,
                            rol: authData[0].rol
                        }
                    } else {
                        // Si no existe guardarlo
                        const user = {
                            id: nanoid(),
                            name,
                            username: userID,
                            email,
                            habilitado: true
                        }

                        // Guardar datos de auth
                        await ControllerAuth.upsert({
                            id: user.id,
                            username: userID,
                            facebook_provider_id: userID
                        })

                        await store.upsert(TABLA, user)

                        userToken = {
                            id: user.id,
                            username: user.username,
                            rol: 'usuario'
                        }
                    }

                    // Retornar el token firmado por el backend
                    const tokenAuth = await authGlobal.sign(userToken)
                    resolve(tokenAuth)
                } else {
                    reject('Datos no válidos')
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    function upsert(email, body) {
        return new Promise(async (resolve, reject) => {
            try {
                // Si hay un error con el token
                if (email.info != 0) {
                    return resolve({
                        info: 1,
                        message: 'No autorizado'
                    })
                }

                // Si el token ya no es válido
                const emails = await ControllerEmailVerify.getByEmail(email.message.email)
                if (emails.length == 0) {
                    return resolve({
                        info: 1,
                        message: 'Token vencido'
                    })
                }

                // Acá todo esta bien, se borra de la tabla de email verify
                await ControllerEmailVerify.deleteById(body.email.message.id)

                // Ver si ya existe un usuario con ese correo
                const emailsResponse = await store.query(TABLA, { email: email.message.email })
                let yaEstaEnXander = false
                
                // Ya existe un usuario
                if (emailsResponse.length > 0) {
                    const authData = await ControllerAuth.getAuthById(emailsResponse[0].id)
                    yaEstaEnXander = authData[0].xander_provider
                    body.id = authData[0].id
                }

                // // Para hacer mas validaciones luego
                // if (yaEstaEnXander) {
                // }

                // Agregar el nuevo usuario
                const user = {
                    id: body.id ? body.id : nanoid(),
                    name: body.name,
                    username: body.username,
                    email: email.message.email,
                    habilitado: body.habilitado ? body.habilitado : true
                }

                if (body.password || body.username) {
                    await ControllerAuth.upsert({
                        id: user.id,
                        username: user.username,
                        password: body.password,
                        xander_provider: true
                    })
                }

                if (body.id) {
                    await ControllerAuth.updateXanderProvider(body.id, true)
                }

                const userStored = await store.upsert(TABLA, user)
                resolve({
                    info: 0,
                    user: userStored
                })
            } catch(error) {
                reject(error)
            }
        })
    }

    async function adminUpdate(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const usuarioResponse = await get(body.id)
                const usuario = usuarioResponse[0]
                let response = usuario

                const authResponse = await ControllerAuth.getAuthById(body.id)
                const auth = authResponse[0]

                if (usuario.habilitado != body.habilitado) {
                    usuario.habilitado = body.habilitado

                    await store.upsert(TABLA, usuario)
                    response.habilitado = usuario.habilitado
                }

                if (auth.rol !== body.rol) {
                    auth.rol = body.rol

                    await store.upsert('auth', auth)
                    response.rol = auth.rol
                }

                resolve(response)
            } catch(error) {
                reject('Error interno')
            }
        })
    }

    function getUser (req) {
        return new Promise(async (resolve, reject) => {
            try {
                const idUser = authGlobal.getIdUser(req)
                const auth = await ControllerAuth.getAuthById(idUser)
                const user = await store.get(TABLA, idUser)

                user[0].rol = auth[0].rol

                resolve(user)
            } catch (error) {
                throw error
            }
        })
        
        return store.get(TABLA, idUser)
    }

    function getTokenEmail (email, referer) {
        console.log('Nuevo ', referer)
        return new Promise(async (resolve, reject) => {
            try {
                // Ver si ya hay un usuario con ese email verificado
                const emailsResponse = await store.query(TABLA, { email })
                let yaEstaEnXander = false
                
                // Ya existe un usuario
                if (emailsResponse.length > 0) {
                    const authData = await ControllerAuth.getAuthById(emailsResponse[0].id)
                    yaEstaEnXander = authData[0].xander_provider
                }
    
                // Ya existe un usuario
                if (yaEstaEnXander) {
                    return resolve({
                        info: 1,
                        message: "Ya existe una cuenta asociada a ese correo"
                    })
                }

                // Guardar datos en email pendientes de verificacion
                const emailGuardado = await ControllerEmailVerify.upsert({ email })

                // Token que se enviará al correo
                const token = authGlobal.sign({
                    email,
                    id: emailGuardado.data.id
                })

                // Enviar correo
               /* const responseCorreo = await ControllerCorreo.sendCorreo({
                    to: email,
                    subject: 'Completa el registro',
                    html: `
                        <h1>Completa tu registro en xander</h1>
                        <p>Haz click en este enlace para completar tu registro en xander</p>
                        <a href=${ referer + `/${ token }` }>Completar registro</a>
                    `
                })*/

                console.log("url: ", referer + `/${ token }` )

                resolve({
                    info: 0,
                    message: "Se ha enviado un correo con el link para completar el registro"
                })
            } catch( error ) {
                console.log(error)
                reject(error)
            }
        })
    }

    return {
        list,
        get,
        upsert,
        adminUpdate,
        getUser,
        getTokenEmail,
        loginGoogle,
        loginFacebook
    }
}