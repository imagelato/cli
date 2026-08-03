/* Copyright 2013 - 2024 Waiterio LLC */
const createSessionStore = require('@monorepool/agentfirst/sessionStore.js')

// Same ~/.imagelato directory and key names the CLI has always written, so
// an existing browser session keeps working unchanged; adds the apiKeySecret
// slot `login --with-key` stores.
module.exports = createSessionStore({ productDirName: 'imagelato' })
