/* Copyright 2013 - 2024 Waiterio LLC */
const createEnsureAuth = require('@monorepool/agentfirst/ensureAuth.js')
const loginWithBrowser = require('@monorepool/agentfirst/loginWithBrowser.js')
const resolveCredential = require('@monorepool/agentfirst/resolveCredential.js')
const {
  setAccessTokenForImagelatoClient,
  setAccessTokenCallbackForImagelatoClient,
} = require('@imagelato/client/accessToken.js')
const { setApiKeyForImagelatoClient } = require('@imagelato/client/apiKey.js')
const {
  setRefreshTokenForImagelatoClient,
} = require('@imagelato/client/refreshToken.js')
const appUrl = require('./appUrl.js')
const envKeyName = require('./envKeyName.js')
const sessionStore = require('./sessionStore.js')

const ensureCredential = createEnsureAuth({
  session: sessionStore,
  envKeyName,
  binaryName: 'imagelato',
  appUrl,
})

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY)
}

function isJwtExpired(jwt) {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split('.')[1], 'base64').toString('utf8'),
    )

    return payload.exp <= Math.floor(Date.now() / 1000)
  } catch {
    return true
  }
}

// Resolves this invocation's credential — stored session > stored API key >
// IMAGELATO_API_KEY, agentfirst's resolveCredential precedence — and feeds
// it to the bundled @imagelato/client.
//
// The client's http.js lets an api key beat the Token header, so the key is
// only ever set on the client when there is NO session: a globally-exported
// IMAGELATO_API_KEY must not silently change which account an interactive
// login touches (the wapiworld rule).
//
// Headless with no credential this throws immediately (via agentfirst's
// createEnsureAuth) instead of opening a browser nobody can see; on a TTY
// the browser auto-login the CLI has always had stays.
module.exports = async function ensureAuth() {
  // An expired (or missing) refresh token makes a stored session dead
  // weight: drop it so resolution falls through to an API key instead of
  // failing on a doomed refresh — the old isLoggedInSession() behaviour.
  if (
    sessionStore.getAccessToken() &&
    isJwtExpired(sessionStore.getRefreshToken())
  ) {
    sessionStore.remove('accessToken')
    sessionStore.remove('refreshToken')
  }

  let resolved = await ensureCredential()

  if (!resolved.mode && isInteractive()) {
    console.log('Please login first')
    await loginWithBrowser({ appUrl, session: sessionStore })
    resolved = resolveCredential({ session: sessionStore, envKeyName })
  }

  if (resolved.mode === 'token') {
    setApiKeyForImagelatoClient(null)
    setAccessTokenForImagelatoClient(sessionStore.getAccessToken())
    setRefreshTokenForImagelatoClient(sessionStore.getRefreshToken())
    setAccessTokenCallbackForImagelatoClient(accessToken =>
      sessionStore.setAccessToken(accessToken),
    )
  } else if (resolved.mode === 'key') {
    setApiKeyForImagelatoClient(resolved.credential)
  }

  return resolved
}
