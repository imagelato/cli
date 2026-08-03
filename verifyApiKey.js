/* Copyright 2013 - 2024 Waiterio LLC */
const { setApiKeyForImagelatoClient } = require('@imagelato/client/apiKey.js')
const getProjects = require('@imagelato/client/getProjects.js').default
const sessionStore = require('./sessionStore.js')

// One cheap authenticated call so `login --with-key` rejects a bad secret at
// login time instead of at the first real command. It runs through the
// client in key mode — Basic base64(secret) — which exercises exactly the
// secret that was just stored. GET /api/projects is inside the read-only
// default scopes of a new key, so a valid-but-narrow key still verifies.
module.exports = async function verifyApiKey() {
  setApiKeyForImagelatoClient(sessionStore.getApiKeySecret())

  try {
    await getProjects()
  } finally {
    // Never leave the key on the client: with a browser session also stored,
    // request-time precedence (session wins) is ensureAuth.js's decision.
    setApiKeyForImagelatoClient(null)
  }

  return 'Logged in with an API key.'
}
