
const express = require('express')
const got = require('got')
const moment = require('moment')
const config = require('./config')
const fs = require('fs')

const app = express()
const port = 3001
const FILE = '/tmp/forecasts.json'

var cached = {}
var lastTry = null

if (fs.existsSync(FILE)) {
    fs.readFile(FILE, (err, data) => {
        cached = JSON.parse(data)
    })
}

function shouldGet() {
    if (cached && cached.fetched) {
        return moment(cached.fetched).isBefore(moment().subtract(4, 'hours')) &&
            (!lastTry || lastTry.isBefore(moment().subtract(5, 'minutes')))
    } else {
        return true
    }
}

app.get('/forecasts', (req, res) => {
    res.set('Content-Type', 'application/json')
    if (shouldGet()) {
        got.post(config.authUrl, {
            responseType: 'json',
            headers: {
                Authorization: "Basic " + config.credentials
            }
        }).then(result => {
            lastTry = moment()
            return got.get(config.forecastUrl, {
                responseType: 'json',
                headers: {
                    Authorization: "Bearer " + result.body.access_token
                }
            })
        },
            err => console.error("auth failed", err)
        ).then(result => {
            cached = {
                fetched: moment().format(),
                available: result.headers['x-ratelimit-available'],
                forecasts: result.body
            }
            console.log("update successful")
            fs.writeFile(FILE, JSON.stringify(cached), () => { })
            res.send(JSON.stringify(cached))
        }, err => {
            if (err.response.statusCode != 429) {
                console.error(err.message)
            }
            res.send(JSON.stringify(cached))
        })
    } else {
        res.send(JSON.stringify(cached))
    }
})

app.listen(port, () => {
    console.log(`Weathah listening at http://localhost:${port}`)
})
