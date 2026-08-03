/* Copyright 2013 - 2024 Waiterio LLC */
const { fail } = require('@monorepool/agentfirst/output.js')

// "Not found" keeps its historical human behaviour (stdout, exit 0) but in
// --json mode becomes a machine-readable failure — one JSON line on stderr,
// exit code 1 — so an agent parsing stdout never mistakes prose for data.
module.exports = function notFound(message, json) {
  if (json) {
    fail(new Error(message), { json: true })
  } else {
    console.log(message)
  }
}
