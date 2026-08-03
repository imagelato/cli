/* Copyright 2013 - 2024 Waiterio LLC */
const {
  setAccessTokenForImagelatoClient,
  setAccessTokenCallbackForImagelatoClient,
} = require('@imagelato/client/accessToken.js')
const {
  setRefreshTokenForImagelatoClient,
} = require('@imagelato/client/refreshToken.js')
const setAccessToken = require('./setAccessToken.js')
const setRefreshToken = require('./setRefreshToken.js')

module.exports = async function storeNewSession({ accessToken, refreshToken }) {
  try {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)

    setAccessTokenForImagelatoClient(accessToken, setAccessToken)
    setRefreshTokenForImagelatoClient(refreshToken, setRefreshToken)
    setAccessTokenCallbackForImagelatoClient(setAccessToken)

    return true
  } catch (error) {
    console.error('error', error)
    throw error
  }
}
