const auth = require('../../../auth')
const AuthController = require('../auth/index')

const response = require('../../../network/response')

module.exports = function checkAuth(action) {
    function middleware(req, res, next) {
        switch(action) {
            case 'update':
                const owner = req.body.id
                auth.check.own(req, owner)
                next()
                break;

            case 'checktoken':
                auth.check.getUser(req)
                next()
                break;

            case 'checkChatToken':
                auth.check.getChatToken(req)
                next()
                break;

            case 'admin' :
                try {
                    auth.check.getUser(req)
                } catch (error) {
                    response.error(req, res, 'No puedes hacer esto', 401)
                    break;
                }

                AuthController.getAuthById(req.user.id)
                    .then(authData => {                    
                        auth.check.admin(authData[0].rol)
                        next()
                    }).catch(error => { 
                        response.error(req, res, 'No puedes hacer esto', 401)
                     })
                break;
            case 'checkEmailToken':
                auth.check.getEmail(req)
                next()
                break;

            default: 
                next()
        }
    }

    return middleware
}