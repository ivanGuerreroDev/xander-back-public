const jwt = require('jsonwebtoken')
const config = require('../config')
const fetch = require('node-fetch')
const { OAuth2Client } = require('google-auth-library')

const error = require('../utils/error')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const secret = config.jwt.secret

function sign (data) {
    return jwt.sign(data, secret)
}

function verify (token) {
    return jwt.verify(token, secret)
}

const check = {
    own: function (req, owner) {
        const decoded = decodeHeader(req)

        if (decoded.id !== owner) {
            throw error('No puedes hacer esto', 401)
        }
    },
    admin: function (rol) {
        if (rol !== 'admin') {
            throw error('No puedes hacer esto', 401)
        }
    },
    getUser: function (req) {
        try {
            const user = decodeHeader(req)
            req.user = user
        } catch (e) {
            throw error ('No puedes hacer esto', 401)
        }
    },
    getChatToken: function (req) {
        try {
            const chat = decodeHeader(req)
            req.chat = chat
        } catch (e) {
            throw error ('No puedes hacer esto', 401)
        }
    },
    getEmail: function (req) {
        try {
            const email = decodeHeader(req)
            req.email = {
                info: 0,
                message: email
            }
        } catch (e) {
            req.email = {
                info: 1,
                message: 'Token inválido'
            }
        }
    }
}

function getToken (auth) {
    if (!auth) {
        throw error('No viene token', 401)
    }

    if (auth.indexOf('Bearer ') === -1) {
        throw error('Formato inválido', 401)
    }

    let token = auth.replace('Bearer ' , '')

    return token
}

function decodeHeader(req) {
    const authorization = req.headers.authorization || ''
    const token = getToken(authorization)
    const decoded = verify(token)

    req.user = decoded

    return decoded
}

function getIdUser (req) {
    return decodeHeader(req).id
}



async function verifyGoogle(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        payload,
        userid
    }
}

async function verifyFacebook(token, userID) {
    // Is valid
    const data = await fetch(`https://graph.facebook.com/debug_token?input_token=${ token }&access_token=${ process.env.FACEBOOK_ACCESS_TOKEN }`)
    const response = await data.json()

    if (!response.data.is_valid) {
        return {
            info: 1,
            user_id: 'Token no válido'
        }
    }

    // Verificar dueño
    if (response.data.user_id != userID) {
        return {
            info: 2,
            user_id: 'No pertenece al usuario asociado'
        }
    }

    return {
        info: 0,
        user_id: response.data.user_id
    }
}

module.exports = {
    sign,
    getIdUser,
    verify,
    verifyGoogle,
    verifyFacebook,
    check,
}