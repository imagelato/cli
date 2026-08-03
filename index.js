#!/usr/bin/env node
/* Copyright 2013 - 2024 Waiterio LLC */
// Default to the production API. The bundled environment resolver falls back
// to development URLs when no environment is set, which would break the
// published CLI — but an explicit WAITERIO_ENV (e.g. staging) still wins.
process.env.WAITERIO_ENV = process.env.WAITERIO_ENV || 'production'
const createProgram = require('./program.js')

createProgram().parse(process.argv)
