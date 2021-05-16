
const express = require('express')
const got = require('got')
const moment = require('moment')
const config = require('./config')
const fs = require('fs')

const app = express()
const port = 3001

var cached = {}

if (fs.existsSync('forecasts.json')) {
    fs.readFile('forecasts.json', (err, data) => {
        cached = JSON.parse(data)
    })
}

function shouldGet() {
    if(cached && cached.fetched) {
        return moment(cached.fetched).isBefore(moment().subtract(4, 'hours'))
    } else {
        return true
    }
}

app.get('/forecasts', (req, res) => {
    res.set('Content-Type', 'application/json')
    if(shouldGet()) {
        got.post(config.authUrl, {
            responseType: 'json',
            headers: {
                Authorization: "Basic " + config.credentials
            }
        }).then(result => {
            console.log('token: ' + result.body.access_token)
            return got.get(config.forecastUrl, {
                responseType: 'json',
                headers: {
                    Authorization: "Bearer " + result.body.access_token
                }
            })
        }).then(result => {
            cached = {
                fetched: moment().format(),
                available: result.headers['x-ratelimit-available'],
                forecasts: result.body
            }
            fs.writeFile('forecasts.json', JSON.stringify(cached), ()=>{})
            res.send(JSON.stringify(cached))
        }, err => {
            console.log(err.message)
            res.send(JSON.stringify(cached))
        })
    } else {
        console.log('returning cached data')
        res.send(JSON.stringify(cached))
    }
})

app.listen(port, () => {
    console.log(`Weathah listening at http://localhost:${port}`)
})
