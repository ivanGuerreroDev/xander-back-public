const { nanoid } = require('nanoid')

module.exports = function (injectedStore) {

    let store = injectedStore
    if (!store) {
        store = require('../../../store/dummy')
    }

    return {
    }
}