/* Copyright 2013 - 2026 Waiterio LLC */
const agentfirstSignupCommand = require('@monorepool/agentfirst/signupCommand.js')
const appUrl = require('./appUrl.js')
const getApiUrl = require('./getApiUrl.js')
const sessionStore = require('./sessionStore.js')

// The step that used to need a person. `login` assumes the account exists;
// an agent pointed at imagelato.com for the first time has no account to log
// into, and the browser flow it fell into blocked for up to five minutes
// with nobody there to complete it.
//
//   imagelato signup --email designer@example.com --json
//
// stores the session in the same ~/.imagelato the browser flow writes, so
// every other command works immediately afterwards.
//
// It posts straight to api.imagelato.com rather than going through
// @imagelato/client: the client attaches whatever session or
// IMAGELATO_API_KEY it already has, and signup is the one call that must be
// made with no credential but the email and password being registered.
function signupCommand() {
  return agentfirstSignupCommand({
    binaryName: 'imagelato',
    getApiUrl,
    appUrl,
    session: sessionStore,
  })
}

module.exports = signupCommand
