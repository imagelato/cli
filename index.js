#!/usr/bin/env node
/* Copyright 2013 - 2024 Waiterio LLC */
// Default to the production API. The bundled environment resolver falls back
// to development URLs when no environment is set, which would break the
// published CLI — but an explicit WAITERIO_ENV (e.g. staging) still wins.
process.env.WAITERIO_ENV = process.env.WAITERIO_ENV || 'production'
const program = require('commander')
const batchesCommand = require('./batchesCommand.js')
const loginCommand = require('./loginCommand.js')
const logoutCommand = require('./logoutCommand.js')
const projectsCommand = require('./projectsCommand.js')
const skillsCommand = require('./skillsCommand.js')
const templatesCommand = require('./templatesCommand.js')
const packageJson = require('./package.json')

program
  .name('imagelato')
  .description('imagelato cli')
  .version(packageJson.version)
  .addCommand(batchesCommand())
  .addCommand(loginCommand())
  .addCommand(logoutCommand())
  .addCommand(projectsCommand())
  .addCommand(skillsCommand())
  .addCommand(templatesCommand())
  .parse(process.argv)
