/* Copyright 2013 - 2024 Waiterio LLC */

const {
  setAccessTokenForImagelatoClient,
  setAccessTokenCallbackForImagelatoClient,
} = require('@imagelato/client/accessToken.js')
const {
  setRefreshTokenForImagelatoClient,
} = require('@imagelato/client/refreshToken.js')
const localStorage = require('./localStorage.js')

module.exports = function clearSession() {
  localStorage.clear()

  setAccessTokenCallbackForImagelatoClient(null)

  setAccessTokenForImagelatoClient(null)
  setRefreshTokenForImagelatoClient(null)
}
