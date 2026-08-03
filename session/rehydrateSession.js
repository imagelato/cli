/* Copyright 2013 - 2024 Waiterio LLC */
const {
  setAccessTokenForImagelatoClient,
  setAccessTokenCallbackForImagelatoClient,
} = require('@imagelato/client/accessToken.js')
const {
  setRefreshTokenForImagelatoClient,
} = require('@imagelato/client/refreshToken.js')
const getAccessToken = require('./getAccessToken.js')
const getRefreshToken = require('./getRefreshToken.js')
const setAccessToken = require('./setAccessToken.js')

module.exports = async function rehydrateSession() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  setAccessTokenForImagelatoClient(accessToken)
  setRefreshTokenForImagelatoClient(refreshToken)
  setAccessTokenCallbackForImagelatoClient(setAccessToken)
}
