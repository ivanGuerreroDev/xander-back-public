const { nanoid } = require('nanoid')

const TABLA = 'email_verify'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function getById (id) {
        return store.get(TABLA, id)
    }

    function getByEmail (email) {
        return store.query(TABLA, { email })
    }

    function upsert(body) {

        return new Promise(async (resolve, reject) => {
            try {
                // Ver si ya existe en la base de datos
                const emailVerifyEncontrado = await getByEmail(body.email)
            
                if (emailVerifyEncontrado.length > 0) {
                    return resolve({
                        data: emailVerifyEncontrado[0]
                    })
                }

                // Crear uno nuevo
                let emailVerify = {
                    id: nanoid(),
                    email: body.email
                }

                const emailCreado = await store.upsert(TABLA, emailVerify)
                resolve(emailCreado)
            } catch (error) {
                reject(error)
            }
        })
    }

    function verifyToken (req) {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.email.info == 0) {
                    const emails = await getByEmail(req.email.message.email)
                    
                    if (emails.length == 0) {
                        resolve({
                            info: 2,
                            message: 'Token expirado'
                        })
                    }
                }

                resolve(req.email)
            } catch (error) {
                reject (error)
            }
        })
    }

    function deleteById (id) {
        return store.stored_procedure('delete_email_verify_por_id', `'${ id }'`)
    }

    return {
        getById,
        getByEmail,
        upsert,
        verifyToken,
        deleteById
    }
}