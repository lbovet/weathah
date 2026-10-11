module.exports = {
  authUrl: 'https://api.srgssr.ch/oauth/v1/accesstoken?grant_type=client_credentials',
  credentials: process.env.CREDENTIALS,
  forecastUrl: 'https://api.srgssr.ch/srf-meteo/forecast/46.9445,6.8477',
  measuresUrl: 'https://data.geo.admin.ch/ch.meteoschweiz.messwerte-lufttemperatur-10min/ch.meteoschweiz.messwerte-lufttemperatur-10min_de.json'
}
