
const bcrypt = require('bcrypt')

const auth = require('../../../auth')
const TABLA = 'auth'


module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }
       

    async function login (username, password) {
        const response = await store.query(TABLA, { username: username })
        const data = response[0]
        
        return bcrypt.compare(password, data.password)
            .then(sonIguales => {
                if (sonIguales === true) {
                    return auth.sign({
                        id: data.id,
                        username: data.username,
                        rol: data.rol
                    })
                } else {
                    throw new Error('Información inválida')
                }
            })
    }

    const getByProviderId = (id, provider) => {
        return new Promise(async (resolve, reject) => {
            try {
                const usuariosResponse = await store.query(TABLA, { provider_id: id })
                const usuarios = await usuariosResponse.filter(user => ( user.provider == provider ))

                resolve(usuarios)
            } catch(error) {
                reject(error)
            }
        })
    }

    function getAuthById (id) {
        return store.query(TABLA, { id })
    }

    async function getUser (req) {
        const idUser = auth.getIdUser(req)

        return idUser
    }

    async function upsert (data) {
        const authData = {
            id: data.id,
            rol: data.rol ? data.rol : 'usuario',
        }

        if (data.username) {
            authData.username = data.username
        }

        if (data.password) {
            authData.password = await bcrypt.hash(data.password, 5)
        }

        if (data.xander_provider) {
            authData.xander_provider = data.xander_provider  
        }

        if (data.google_provider_id) {
            authData.google_provider_id = data.google_provider_id
        }

        if (data.facebook_provider_id) {
            authData.facebook_provider_id = data.facebook_provider_id
        }

        return store.upsert(TABLA, authData)
    }

    function updateGoogleId (id, google_provider_id) {
        return store.upsert(TABLA, {
            id,
            google_provider_id
        })
    }

    function updateFacebookId (id, facebook_provider_id) {
        return store.upsert(TABLA, {
            id,
            facebook_provider_id
        })
    }

    function updateXanderProvider (id, xander_provider) {
        return store.upsert(TABLA, {
            id,
            xander_provider
        })
    }


    return {
        upsert,
        getUser,
        getAuthById,
        login,
        getByProviderId,
        updateGoogleId,
        updateFacebookId,
        updateXanderProvider
    }
}