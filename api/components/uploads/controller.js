const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const path = require('path')

const ControllerConfig = require('../config/index')

aws.config.update({
    credentials: {
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        accessKeyId: process.env.S3_ACCESS_KEY,
    },
    region: process.env.S3_REGION
})

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('Formáto no soportado', false))
    }
}

const limits = {
    fileSize: 1024 * 1024 * 4
}

const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'xander-app',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now() + file.originalname)
        }
    }),
    limits,
    fileFilter
})

const upload = multer({ 
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function(req, file, cb) {
            cb(null, Date.now() + file.originalname)
        }
    }), 
    limits,
    fileFilter
})

const uploadFiles = upload.array('files', 12)
const uploadFilesS3 = uploadS3.array('files', 12)
const uploadNotificacionFiles = upload.array('upload', 12)
const uploadNotificacionFilesS3 = uploadS3.array('upload', 12)


module.exports = function () {

    function insert(req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar con la base de datos donde se debe guardar el archivo, si en amazon s3 o en el servidor
                const responseConfig = await ControllerConfig.list()
                let guardarEnAmazon = responseConfig[0].fotos_s3

                if (guardarEnAmazon) {
                    // Amazon S3
                    uploadFilesS3(req, res, function (err) {
                        if (err) {
                            return reject(err)
                        }

                        const { files, body } = req

                        resolve({
                            body,
                            uploads: {    
                                tipo: 's3',
                                files,
                            }
                        })
                    })
                } else {
                    // Servidor propio
                    uploadFiles(req, res, function (err) {
                        if (err) {
                            return reject(err)
                        }

                        const { files, body } = req
        
                        resolve({
                            body,
                            uploads: {
                                tipo: 'servidor',
                                files,
                            }
                        })
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    function uploadNotificacion (req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar con la base de datos donde se debe guardar el archivo, si en amazon s3 o en el servidor
                const responseConfig = await ControllerConfig.list()
                let guardarEnAmazon = responseConfig[0].fotos_s3

                if (guardarEnAmazon) {
                    // Amazon S3
                    uploadNotificacionFilesS3(req, res, function (err) {
                        if (err) {
                            return reject(err)
                        }

                        const { files } = req

                        resolve({
                            uploaded: true,
                            url: files[0].location
                        })
                    })
                } else {
                    // Servidor propio
                    uploadNotificacionFiles(req, res, function (err) {
                        if (err) {
                            return reject(err)
                        }

                        

                        const { files } = req                        

                        resolve({
                            uploaded: true,
                            url: `${ req.protocol }://${ req.headers.host }/api/uploads/${ files[0].filename }`
                            // url: path.join(__dirname, files[0].filename)
                        })
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    return {
        insert,
        uploadNotificacion
    }
}