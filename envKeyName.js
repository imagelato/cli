/* Copyright 2013 - 2024 Waiterio LLC */

// The environment variable a headless agent can export instead of logging
// in. It is read at request time by ensureAuth.js through agentfirst's
// resolveCredential — a stored session still wins over it, so exporting it
// globally never hijacks an interactive login.
module.exports = 'IMAGELATO_API_KEY'
