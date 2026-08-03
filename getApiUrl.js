/* Copyright 2013 - 2026 Waiterio LLC */

// Production imagelato API. Read at call time, not module load, so the
// IMAGELATO_API_URL override the published bundle documents (see
// cliGetUrl.js) also reaches callers that bypass @imagelato/client.
module.exports = function getApiUrl() {
  return process.env.IMAGELATO_API_URL || 'https://api.imagelato.com'
}
