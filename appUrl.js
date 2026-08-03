/* Copyright 2013 - 2024 Waiterio LLC */

// The published CLI always logs in through the production app;
// IMAGELATO_APP_URL overrides it for testing against a non-production
// deployment — the same override the bundled client's cliGetUrl.js honors.
module.exports = process.env.IMAGELATO_APP_URL || 'https://app.imagelato.com'
