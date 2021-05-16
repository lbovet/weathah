
const express = require('express')
const got = require('got')
const moment = require('moment')
const config = require('./config')

const app = express()
const port = 3001

var cached = {}

app.get('/forecasts', (req, res) => {
    got.post(config.authUrl, {
        responseType: 'json',
        headers: {
            Authorization: "Basic " + config.credentials
        }
    })
    .then(result => {
        console.log('token: '+result.data)
    })
    .then(result => {
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify(cached))
    })
})

app.listen(port, () => {
    console.log(`Weathah listening at http://localhost:${port}`)
})
