/* Copyright 2013 - 2024 Waiterio LLC */
const commander = require('commander')
const loginCommand = require('@monorepool/agentfirst/loginCommand.js')
const logoutCommand = require('@monorepool/agentfirst/logoutCommand.js')
const schemaCommand = require('@monorepool/agentfirst/schemaCommand.js')
const skillsCommand = require('@monorepool/agentfirst/skillsCommand.js')
const appUrl = require('./appUrl.js')
const batchesCommand = require('./batchesCommand.js')
const envKeyName = require('./envKeyName.js')
const projectsCommand = require('./projectsCommand.js')
const sessionStore = require('./sessionStore.js')
const templatesCommand = require('./templatesCommand.js')
const verifyApiKey = require('./verifyApiKey.js')
const packageJson = require('./package.json')

// Builds the full commander program without parsing it, so both the schema
// command and the skills package's cliSkillDrift test introspect the exact
// tree the CLI runs — shared agentfirst factories (login, logout, schema,
// skills) included.
function createProgram() {
  const program = new commander.Command()

  program
    .name('imagelato')
    .description('imagelato cli')
    .version(packageJson.version)
    .addCommand(batchesCommand())
    .addCommand(
      loginCommand({
        binaryName: 'imagelato',
        appUrl,
        session: sessionStore,
        envKeyName,
        verify: verifyApiKey,
      }),
    )
    .addCommand(
      logoutCommand({
        binaryName: 'imagelato',
        session: sessionStore,
        envKeyName,
      }),
    )
    .addCommand(projectsCommand())
    .addCommand(schemaCommand({ program }))
    .addCommand(skillsCommand({ baseDirectory: __dirname }))
    .addCommand(templatesCommand())

  return program
}

module.exports = createProgram
