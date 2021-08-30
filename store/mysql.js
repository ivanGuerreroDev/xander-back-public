const mysql = require('mysql')

const config = require('../config')

const dConfig = {
    host: config.mysql.host,
    port: config.mysql.port || 3306,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    timezone: 'UTC',
    dateStrings: [
        'DATE',
        'DATETIME'
    ]
}

let connection

function handleCon () {
    connection = mysql.createPool(dConfig)

    connection.on('err', err => {
        console.error('[db err]', err.message)

        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            handleCon
        } else {
            throw err
        }
    })
}

handleCon()

function end () {
    connection.end()
}

function list (table) {
    return new Promise ((resolve, reject) => {
        connection.query(`SELECT * FROM ${ table }`, (err, data) => {
            if (err) return reject (err)

            resolve (data)
        })
    })
}

function get (table, id) {
    return new Promise ((resolve, reject) => {
        connection.query(`SELECT * FROM ${ table } WHERE id = '${ id }'`, (err, data) => {
            if (err) return reject (err)

            resolve (data)
        })
    })
}

function insert (table, data) {
    return new Promise ((resolve, reject) => {
        connection.query(`INSERT INTO ${ table } SET ?`, data, (err, result) => {
            if (err) return reject (err)

            resolve ({
                data,
                result
            })
        })
    })
}

function update (table, data) {
    return new Promise ((resolve, reject) => {
        connection.query(`UPDATE ${ table } SET ? WHERE id = ?`, [data, data.id], (err, result) => {
            if (err) return reject (err)
            resolve (result)
        })
    })
}

async function upsert (table, data) {
    const row = await query(table, { id: data.id })
    
    if (row.length > 0) 
        return update(table, data)

    return insert (table, data)
}

function query (table, query) {
    return new Promise ((resolve, reject) => {
        connection.query(`SELECT * FROM ${ table } WHERE ?`, query, (err, res) => {
            if (err) return reject(err)
            resolve(res || null)
        })
    })
}

function query2 (table, query) {
    return new Promise ((resolve, reject) => {
        connection.query(`SELECT * FROM ${ table } WHERE ${query}`, (err, res) => {
            if (err) return reject(err)
            resolve(res || null)
        })
    })
}

function customQuery (query) {
    return new Promise ((resolve, reject) => {
        connection.query(`${query}`, (err, res) => {
            if (err) return reject(err)
            resolve(res || null)
        })
    })
}

function remove (table, id) {
    return new Promise ((resolve, reject) => {
        connection.query(`DELETE FROM ${ table } WHERE ?`, id, (err, result) => {
            if (err) return reject (err)
            resolve ({
                id,
                result
            })
        })
    })
}

function stored_procedure_without_params (sp) {
    return new Promise ((resolve, reject) => {
        connection.query(`CALL ${ sp }()`, (err, res) => {
            if (err) return reject(err)
            resolve(res[0] || null)
        })
    })
}

function stored_procedure (sp, formattedParams) {
    return new Promise ((resolve, reject) => {
        connection.query(`CALL ${ sp }(${ formattedParams })`, (err, res) => {
            if (err) return reject(err)
            resolve(res[0] || null)
        })
    })
}

module.exports = {
    list,
    get,
    insert,
    upsert,
    update,
    query,
    query2,
    customQuery,
    remove,
    stored_procedure,
    stored_procedure_without_params,
    end
}