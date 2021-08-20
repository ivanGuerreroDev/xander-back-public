const { nanoid } = require('nanoid')
const slugify = require('slugify')

const authGlobal = require('../../../auth')

const tagController = require('../tag/index')
const tagComercioController = require('../tagComercio/index')
const fotoComercioController = require('../fotoComercio/index')
const subCategoriaController = require('../subCategoria/index')
const categoriaController = require('../categoria/index')
const ubicacionComercioController = require('../ubicacionComercio/index')
const ciudadController = require('../ciudad/index')
const UsuarioController = require('../user/index')
const UploadsController = require('../uploads/index')
const horarioController = require('../horario/index')
const campoPersonalizadoComercioController = require('../campoPersonalizadoComercio/index')
const SubCategoriaComercioController = require('../subCategoriaComercio/index')
const moment = require('moment')

const TABLA = 'comercio'

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    function list(body) {
        return new Promise(async (resolve, reject) => {
            try {
                let comerciosTopData

                if (body.pais) {
                    comerciosTopData = await store.stored_procedure('get_comercios_top_pais_localidad', `'${ body.pais }', '${ body.localidad }'`)
                } else {
                    comerciosTopData = await store.stored_procedure_without_params('get_comercios_top_homepage')
                }

                const comerciosTop = []
                
                for (let i = 0 ; i < comerciosTopData.length ; i++) {
                    const c = comerciosTopData[i]

                    const tags = await tagComercioController.getByIdComercio(c.id)
                    c.tags = tags

                    const fotos = await fotoComercioController.getByIdComercio(c.id)
                    c.fotos = fotos

                    comerciosTop.push(c)
                }


                let comerciosData
                if (body.pais) {
                    comerciosData = await store.stored_procedure('get_comercios_fuera_de_top_pais_localidad', `'${ body.pais }', '${ body.localidad }'`)
                } else {
                    comerciosData = await store.stored_procedure_without_params('get_comercios_homepage')
                }
                const comercios = []
                
                for (let i = 0 ; i < comerciosData.length ; i++) {
                    const c = comerciosData[i]

                    const topFilter = comerciosTopData.filter(ctd => (ctd.id == c.id))
                    if (topFilter.length > 0) {
                        continue
                    }

                    const tags = await tagComercioController.getByIdComercio(c.id)
                    c.tags = tags

                    const fotos = await fotoComercioController.getByIdComercio(c.id)
                    c.fotos = fotos

                    comercios.push(c)
                }


                resolve({
                    comerciosTop,
                    comercios
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    function getFavoritosByUser (user) {
        return new Promise(async (resolve, reject) => {
            const comerciosFavoritos = await store.stored_procedure('get_favoritos_by_user', `'${ user.id }'`)

            const comercios = []
                
            for (let i = 0 ; i < comerciosFavoritos.length ; i++) {
                const c = comerciosFavoritos[i]

                const tags = await tagComercioController.getByIdComercio(c.id)
                c.tags = tags

                const fotos = await fotoComercioController.getByIdComercio(c.id)
                c.fotos = fotos

                comercios.push(c)
            }

            resolve({
                comercios
            })
        })
    }

    function get (id) {
        return store.query(TABLA, { id })
    }

    function adminList() {
        return new Promise(async (resolve, reject) => {
            try {
                const comerciosData = await store.list(TABLA)
                const comercios = []
                
                for (let i = 0 ; i < comerciosData.length ; i++) {
                    const c = {}
                    c.id = comerciosData[i].id
                    c.nombre = comerciosData[i].nombre
                    c.slug = comerciosData[i].slug
                    c.email = comerciosData[i].email
                    c.celular = comerciosData[i].celular
                    c.whatsapp = comerciosData[i].whatsapp
                    c.skype = comerciosData[i].skype
                    // console.log(comerciosData[i])
                    // const subCategoria = await subCategoriaController.get(c.id_sub_categoria)
                    // c.subCategoria = subCategoria[0]

                    const usuario = await UsuarioController.get(comerciosData[i].id_user)
                    c.usuario = usuario[0]

                    comercios.push(c)
                }

                resolve(comercios)
            } catch (error) {
                reject(error)
            }
        })
    }
    
    function getByUser(user) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(user)
                const comerciosData = await store.query(TABLA, { id_user: user.id})
                const comercios = []
                
                for (let i = 0 ; i < comerciosData.length ; i++) {
                    const c = {}
                    c.id = comerciosData[i].id
                    c.nombre = comerciosData[i].nombre
                    c.slug = comerciosData[i].slug
                    c.email = comerciosData[i].email
                    c.celular = comerciosData[i].celular
                    c.whatsapp = comerciosData[i].whatsapp
                    c.skype = comerciosData[i].skype
    
                    comercios.push(c)
                }
    
                resolve(comercios)
            } catch (error) {
                reject(error)
            }
        })
    }

    function getBySlug(slug) {
        return new Promise(async (resolve, reject) => {
            try {
                const comercioData = await store.query(TABLA, { slug })
                let comercio = comercioData[0]

                const fotos = await fotoComercioController.getByIdComercio(comercio.id)
                comercio.fotos = fotos

                const tags = await tagComercioController.getByIdComercio(comercio.id)
                comercio.tags = tags                

                resolve(comercio)
            } catch (error) {
                reject(error)
            }
        })
    }

    function getNameCount (name) {
        return store.stored_procedure('get_same_name_count', `'${ name }'`)
    }
    
    async function upsert(req, res) {
        return new Promise(async (resolve, reject) => {

            try {
                // Guardar fotos
                const uploadsResponse = await UploadsController.insert(req, res)

                // Sacar datos
                const { user } = req
                const { body, uploads } = uploadsResponse
                const { tags, celular, descripcion, direccion, distrito, email, envios_provincia_exterior,
                    experiencia, facebook, id_city, nombre, numero_signal, skype, telegram,
                    tipo_venta, vende, web, whatsapp, tags_usuario, posicion, id_sub_categoria, 
                    horario, camposPersonalizados, country, state, city } = body
                const { tipo, files } = uploads
                
                const tagsData = JSON.parse(tags)
                const tagsUsuario = JSON.parse(tags_usuario)
                const horarioData = JSON.parse(horario)
                const { lat, lng } = JSON.parse(posicion)
                const campos = JSON.parse(camposPersonalizados)

                let slug = null;
                let count = 0;
                while (slug == null) {
                    const data = await store.query(TABLA, { slug: slugify(`${nombre}${ count == 0 ? '' : (' ' + count) }`) })
                    if (data.length == 0) {
                        slug = slugify(`${nombre}${ count == 0 ? '' : (' ' + count) }`)
                    }
                    count++
                }
        
                // Guardar comercio
                const comercio = {
                    id: nanoid(),
                    id_user: user.id,
                    longitud: lng,
                    latitud: lat,
                    id_sub_categoria,
                    id_city,
                    id_subida_personalizada_completa: null,
                    nombre,
                    slug,
                    descripcion,
                    tipo_venta,
                    envios_provincia_exterior: envios_provincia_exterior === 'true',
                    experiencia,
                    vende,
                    email,
                    celular,
                    whatsapp,
                    telegram,
                    numero_signal,
                    facebook,
                    web,
                    direccion,
                    country : country ? parseInt(country) : null,
                    state : state ? parseInt(state) : null,
                    city : city ? parseInt(city) :null,
                    distrito,
                    skype,
                    created_at: moment().utc().format('YYYY-MM-DD HH-mm-ss'),
                    posicion: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
                    update_at: null
                }
                console.log(comercio)
                const comercioStored = await store.upsert(TABLA, comercio)
                
                // Sacar tags usuario
                const tagsUsuarioData = await tagController.list()

                for (let i = 0 ; i < tagsUsuario.length ; i++) {
                    const tagEncontrado = tagsUsuarioData.filter(t => t.nombre.toLowerCase() == tagsUsuario[i].toLowerCase())

                    if (tagEncontrado.length > 0) {
                        // Ya hay un tag creado
                        tagsData.push({ id: tagEncontrado[0].id })
                    } else {
                        // Crearlo
                        const tagStored = await tagController.upsert({
                            nombre: tagsUsuario[i],
                            habilitado: true,
                            admin: false
                        })

                        tagsData.push({ id: tagStored.data.id })
                    }
                }

                // Guardar tags
                let tagsStored = []
        
                for (let i = 0 ; i < tagsData.length ; i++) {
                    const storedTagComercio = await tagComercioController.upsert({
                        id_tag: tagsData[i].id,
                        id_comercio: comercioStored.data.id
                    })
        
                    tagsStored.push(storedTagComercio)
                }

                // Guardar sub categorias
                // let subCategoriasStored = []

                // for (let i = 0 ; i < subCategoriasData.length ; i++) {
                //     const storedSubCategoriaComercio = await SubCategoriaComercioController.upsert({
                //         id_sub_categoria: subCategoriasData[i].id,
                //         id_comercio: comercioStored.data.id
                //     })

                //     subCategoriasStored.push(storedSubCategoriaComercio)
                // }
        
                // Guardar links de fotos
                let fotosStored = []
                for (let i = 0 ; i < files.length ; i++) {
                    const storedFoto = await fotoComercioController.upsert({
                        url: tipo == 'servidor' ? files[i].path : files[i].location,
                        id_comercio: comercioStored.data.id,
                        tipo
                    })
        
                    fotosStored.push(storedFoto)
                }

                // Guardar horario
                let horarioStored = []
                for (let i = 0 ; i < horarioData.length ; i++) {
                    const { dia, desde, hasta, numero_dia } = horarioData[i]

                    const storedHorario = await horarioController.upsert({
                        id_comercio: comercioStored.data.id,
                        dia,
                        desde,
                        hasta, 
                        numero_dia
                    })

                    horarioStored.push(storedHorario)
                }

                // Guardar campos
                let camposStored = []
                for (let i = 0 ; i < campos.length ; i++) {
                    const { id, value } = campos[i]

                    const storedCampo = await campoPersonalizadoComercioController.upsert({
                        id_campo_personalizado: id,
                        id_comercio: comercioStored.data.id,
                        valor: value
                    })

                    camposStored.push(storedCampo)
                }

                resolve({
                    files,
                    comercio,
                    tags: tagsStored,
                    fotos: fotosStored,
                    horario: horarioStored,
                    campos: camposStored
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    function subirFotos (req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                // Guardar fotos
                const uploadsResponse = await UploadsController.insert(req, res)

                // Sacar datos
                const { body, uploads } = uploadsResponse
                const { id_comercio } = body
                const { files, tipo } = uploads

                let fotosStored = []
                for (let i = 0 ; i < files.length ; i++) {
                    const storedFoto = await fotoComercioController.upsert({
                        url: tipo == 'servidor' ? files[i].path : files[i].location,
                        id_comercio,
                        tipo
                    })
        
                    fotosStored.push(storedFoto.data)
                }

                resolve(fotosStored)
            } catch (error) {
                reject(error)
            }
        })
    }

    function updateInfoGeneral({ comercio, tags: t }) {
        return new Promise(async (resolve, reject) => {
            try {
                // Actualizar comercio
                const updatedComercio = await store.upsert(TABLA, comercio)

                // Actualizar tags
                await tagComercioController.deleteTagByIdComercio(comercio.id)
                const tags = JSON.parse(t)

                let tagsStored = []

                for (let i = 0 ; i < tags.length ; i++) {
                    const storedTag = await tagComercioController.upsert({
                        id_tag: tags[i].id,
                        id_comercio: comercio.id
                    })

                    tagsStored.push(storedTag.data)
                }

                resolve({
                    comercio: updatedComercio,
                    tags: tagsStored
                })
            } catch(error) {
                reject(error)
            }
        })
    }

    function getVistos ({ comercios }) {
        return new Promise(async (resolve, reject) => {
            const comerciosResponse = []
            
            for (let i = 0 ; i < comercios.length ; i++) {
                const comercioResponse = await store.stored_procedure('get_comercio_reciente', `'${ comercios[i] }'`)

                // Si ya no existe el comercio en la bd
                if (comercioResponse.length == 0) {
                    continue
                }

                const comercioPush = comercioResponse[0]

                const fotos = await fotoComercioController.getByIdComercio(comercioPush.id)
                comercioPush.fotos = fotos

                comerciosResponse.push(comercioPush)
            }

            resolve ({
                comercios: comerciosResponse
            })
        })
    }

    function updateUbicacion (comercio) {
        return store.upsert(TABLA, comercio)
    }

    function updateSubidaPersonalizada (comercio) {
        return store.upsert(TABLA, comercio)
    }

    return {
        list,
        getFavoritosByUser,
        get,
        adminList,
        getByUser,
        getBySlug,
        getNameCount,
        upsert,
        subirFotos,
        updateInfoGeneral,
        getVistos,
        updateUbicacion,
        updateSubidaPersonalizada
    }
}