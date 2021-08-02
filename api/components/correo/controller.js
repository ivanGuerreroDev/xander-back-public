const nodemailer = require('nodemailer')
let aws = require('aws-sdk');

aws.config.update({
    credentials: {
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
        accessKeyId: process.env.SES_ACCESS_KEY,
    },
    region: process.env.S3_REGION
})

// host: process.env.SES_HOST,
//     port: process.env.SES_PORT,
//     secure: false,
//     auth: {
//         user: process.env.SES_USER,
//         pass: process.env.SES_PASS
//     }

let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01'
    })
})

module.exports = function (injectedStore) {
    
    function sendCorreo ({ to, subject, text, html }) {
        return new Promise(async (resolve, reject) => {
            try {
                let info = await transporter.sendMail({
                    from: process.env.SES_FROM,
                    to,
                    subject,
                    text,
                    html
                })

                resolve(info)
            } catch (error) {
                reject(error)
            }
        })


    }

    return {
        sendCorreo
    }
}