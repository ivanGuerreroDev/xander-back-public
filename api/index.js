if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const cron = require('node-cron')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const config = require('../config.js')

// Socket
const mensajes = require('./socket/mensajes')

// CRON
const subirAnuncios = require('./cron/subirAnuncios')

// Network
const uploads = require('./components/uploads/network')
const user = require('./components/user/network')
const auth = require('./components/auth/network')
const tag = require('./components/tag/network')
const categoria = require('./components/categoria/network')
const subCategoria = require('./components/subCategoria/network')
const comercio = require('./components/comercio/network')
const tagComercio = require('./components/tagComercio/network')
const fotoComercio = require('./components/fotoComercio/network')
const subida = require('./components/subida/network')
const subidaComercio = require('./components/subidaComercio/network')
const comercioTop = require('./components/comercioTop/network')
const estilos = require('./components/estilos/network')
const paypal = require('./components/paypal/network')
const transaccion = require('./components/transaccion/network')
const ubicacionComercio = require('./components/ubicacionComercio/network')
const testCorreo = require('./components/testCorreo/network')
const emailVerify = require('./components/emailVerify/network')
const seo = require('./components/seo/network')
const configAdmin = require('./components/config/network')
const configSubidas = require('./components/configSubidas/network')
const subidaPersonalizada = require('./components/subidaPersonalizada/network')
const userComercioChat = require('./components/userComercioChat/network')
const mensaje = require('./components/mensaje/network')
const notificacion = require('./components/notificacion/network')
const comercioUserFavorito = require('./components/comercioUserFavorito/network')
const country = require('./components/country/network')
const state = require('./components/state/network')
const city = require('./components/city/network')
const subCategoriaComercio = require('./components/subCategoriaComercio/network')
const horario = require('./components/horario/network')
const campoPersonalizado = require('./components/campoPersonalizado/network')
const campoPersonalizadoComercio = require('./components/campoPersonalizadoComercio/network')
const subidaPersonalizadaComercio = require('./components/subidaPersonalizadaComercio/network')
const subidaPersonalizadaCompleta = require('./components/subidaPersonalizadaCompleta/network')
const subidaPersonalizadaCompletaDetalle = require('./components/subidaPersonalizadaCompletaDetalle/network')
const subidaPersonalizadaCompletaDetalleFecha = require('./components/subidaPersonalizadaCompletaDetalleFecha/network')
const subidaPersonalizadaConfig = require('./components/subidaPersonalizadaConfig/network')
const subidaPersonalizadaPrecio = require('./components/subidaPersonalizadaPrecio/network')


const test = require('./components/test/network')

const errors = require('../network/errors')

app.use(cors())

app.use(bodyParser.json())
app.use('/api/uploads', express.static('uploads'), uploads)
app.use('/api/user', user)
app.use('/api/auth', auth)
app.use('/api/tag', tag)
app.use('/api/categoria', categoria)
app.use('/api/sub-categoria', subCategoria)
app.use('/api/comercio', comercio)
app.use('/api/tag-comercio', tagComercio)
app.use('/api/foto-comercio', fotoComercio)
app.use('/api/subida', subida)
app.use('/api/subida-comercio', subidaComercio)
app.use('/api/comercio-top', comercioTop)
app.use('/api/estilos', estilos)
app.use('/api/paypal', paypal)
app.use('/api/transaccion', transaccion)
app.use('/api/ubicacion-comercio', ubicacionComercio)
app.use('/api/test-correo', testCorreo)
app.use('/api/email-verify', emailVerify)
app.use('/api/seo', seo)
app.use('/api/config', configAdmin)
app.use('/api/config/subidas', configSubidas)
app.use('/api/subida-personalizada', subidaPersonalizada)
app.use('/api/user-comercio-chat', userComercioChat)
app.use('/api/mensaje', mensaje)
app.use('/api/notificacion', notificacion)
app.use('/api/favorito', comercioUserFavorito)
app.use('/api/country', country)
app.use('/api/state', state)
app.use('/api/city', city)
app.use('/api/sub-categoria-comercio', subCategoriaComercio)
app.use('/api/horario', horario)
app.use('/api/campo-personalizado', campoPersonalizado)
app.use('/api/campo-personalizado-comercio', campoPersonalizadoComercio)
app.use('/api/subida-personalizada-comercio', subidaPersonalizadaComercio)
app.use('/api/subida-personalizada-completa', subidaPersonalizadaCompleta)
app.use('/api/subida-personalizada-completa-detalle', subidaPersonalizadaCompletaDetalle)
app.use('/api/subida-personalizada-completa-detalle-fecha', subidaPersonalizadaCompletaDetalleFecha)
app.use('/api/subida-personalizada-config', subidaPersonalizadaConfig)
app.use('/api/subida-personalizada-precio', subidaPersonalizadaPrecio)

app.use('/api/test', test)

app.use(errors)


const ControllerSubidasPersonalizadasConfig = require("./components/configSubidas/index")
const store = require('../store/mysql')
var cronObjects = {}
const cleanCronObjects = () => {
    Object.keys(cronObjects).forEach( zona => {
        cronObjects[zona] ? Object.keys(cronObjects[zona]).forEach( hora => {
            cronObjects[zona][hora] ? cronObjects[zona][hora].cron.stop() : null;
        }) : null
    })
    cronObjects = {}
}
const setCronListings = async () => {
    console.log('set crons')
    cleanCronObjects()
    const response = await ControllerSubidasPersonalizadasConfig.list()
    const {tipo, zona, avisos_x_cron, interval_seg_cron} = response[0]
    if(tipo === 'AUTOMATICO'){
        switch (zona) {
            case 'COUNTRY':
                query = `
                    SELECT 
                        SUM(detalle.subidas) as subidas,
                        detalle.fecha_inicio as hora,
                        country.name as country, country.name as zona
                    FROM subida_personalizada_completa_detalle as detalle
                    INNER JOIN subida_personalizada_completa as subida ON detalle.id_subida_personalizada_completa = subida.id
                    INNER JOIN comercio as comercio ON comercio.id = subida.id_comercio
                    INNER JOIN country as country ON country.id = comercio.country
                    WHERE detalle.fecha_inicio > NOW() AND detalle.fecha_inicio < DATE_ADD(NOW(), INTERVAL '1' HOUR)
                    GROUP BY hora, zona
                `
                break;
            case 'STATE':
                query = `
                    SELECT 
                        SUM(detalle.subidas) as subidas,
                        detalle.fecha_inicio as hora,
                        country.name as country, country.name, state.name as zona
                    FROM subida_personalizada_completa_detalle as detalle
                    INNER JOIN subida_personalizada_completa as subida ON detalle.id_subida_personalizada_completa = subida.id
                    INNER JOIN comercio as comercio ON comercio.id = subida.id_comercio
                    INNER JOIN country as country ON country.id = comercio.country
                    INNER JOIN state as state ON state.id = comercio.state
                    WHERE detalle.fecha_inicio > NOW() AND detalle.fecha_inicio < DATE_ADD(NOW(), INTERVAL '1' HOUR)
                    GROUP BY hora, zona
                `
                break;
            case 'CITY':
                query = `
                    SELECT 
                        SUM(detalle.subidas) as subidas,
                        detalle.fecha_inicio as hora,
                        country.name as country, country.name, state.name as state, (CASE WHEN city.name IS NOT NULL THEN city.name ELSE state.name END) as zona
                    FROM subida_personalizada_completa_detalle as detalle
                    INNER JOIN subida_personalizada_completa as subida ON detalle.id_subida_personalizada_completa = subida.id
                    INNER JOIN comercio as comercio ON comercio.id = subida.id_comercio
                    INNER JOIN country as country ON country.id = comercio.country
                    INNER JOIN state as state ON state.id = comercio.state
                    LEFT JOIN city as city ON city.id = comercio.city
                    WHERE detalle.fecha_inicio > NOW() AND detalle.fecha_inicio < DATE_ADD(NOW(), INTERVAL '1' HOUR)
                    GROUP BY hora, zona
                `
                break;
            default:
                break;
        }
        const listado_de_fecha_hora = await store.customQuery(query)
        
        listado_de_fecha_hora.forEach( cron => {
            let intervalo = get_subidas_seg(cron.hora.subidas)
            cronObjects[cron.zona][cron.hora] = {
                ...intervalo,
                cron: cron.schedule(
                    `*/${intervalo.interval} * * * * *`, subirAnuncios("AUTOMATICO", intervalo.subidas_maxima_x_cron, zona, cron.zona)
                )
            }
        })
    }else{
        cronObjects.unico = cron.schedule(
            `*/${interval_seg_cron} * * * * *`, subirAnuncios("MANUAL", avisos_x_cron)
        )
    }
}
cron.schedule(
    `0 0 */1 * * *`, setCronListings
)

setCronListings()


const get_subidas_seg = (subidas) => {
    var subidas_maxima_x_cron = 5, interval = 2;
    if(subidas < 2400){
        if(subidas < 600){
            subidas_maxima_x_cron = 5
            interval = 60 / ( ( subidas / 60 ) / 5);
        }else if(subidas >= 600 && subidas < 1200){
            subidas_maxima_x_cron = 10
            interval = 60 / ( ( subidas / 60 ) / 10);
        }else if(subidas >= 1200){
            subidas_maxima_x_cron = 20
            interval = 3600 / (subidas / 20);
        }
    }else{
        subidas_maxima_x_cron = 25
        interval = 3600 / (subidas / 25);
    }
    return {
        subidas_maxima_x_cron,
        interval 
    }
}

// CRON
// cron.schedule('* * * * *', actualizarTop);


// Socket

io.on('connection', socket => {
    // Mensajes
    socket.on('mensaje', data => {
        mensajes(socket, io, data)
    })



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
})

http.listen(config.api.port, () => {
    console.log('Api escuchando en el puerto', config.api.port)
})