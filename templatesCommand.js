/* Copyright 2013 - 2024 Waiterio LLC */
const { inspect } = require('node:util')
const commander = require('commander')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const login = require('./login.js')
const getConfig = require('./getConfig.js')
const getTemplates = require('@imagelato/client/getTemplates.js').default
const getTemplate = require('@imagelato/client/getTemplate.js').default
const addTemplate = require('@imagelato/client/addTemplate.js').default
const updateTemplate = require('@imagelato/client/updateTemplate.js').default

async function ensureLoggedIn() {
  await rehydrateSession()

  if (!isLoggedInSession()) {
    console.log('Please login first')
    await login()
    await rehydrateSession()
  }
}

function templatesCommand() {
  const command = new commander.Command('templates')
  command.description('manage templates')

  // imagelato templates list
  command
    .command('list')
    .description('list templates')
    .option('--projectId [projectId]', 'project id')
    .action(async options => {
      try {
        await ensureLoggedIn()

        const config = getConfig()
        const projectId = options.projectId || config?.projectId

        const parameters = {}
        if (projectId) parameters.projectId = projectId

        const templates = await getTemplates(parameters)

        if (templates.length === 0) {
          console.log('No templates found')
        } else {
          console.log(`Found ${templates.length} template(s):`)
          templates.forEach((template, index) => {
            const name = template.name || template._id
            console.log(`${index + 1}. ${name} (${template._id})`)
          })
        }
      } catch (error) {
        console.log('error', error)
      }
    })

  // imagelato templates get [templateIdOrName]
  command
    .command('get [templateIdOrName]')
    .description('get templates (raw JSON), or a single template by id or name')
    .option('--projectId [projectId]', 'project id')
    .action(async (templateIdOrName, options) => {
      try {
        await ensureLoggedIn()

        if (templateIdOrName) {
          const template = await getTemplate(templateIdOrName)

          if (template) {
            console.log(inspect(template, { colors: true, depth: null }))
          } else {
            console.log('Template not found')
          }
        } else {
          const config = getConfig()
          const projectId = options.projectId || config?.projectId

          const parameters = {}
          if (projectId) parameters.projectId = projectId

          const templates = await getTemplates(parameters)
          console.log(inspect(templates, { colors: true, depth: null }))
        }
      } catch (error) {
        console.log('error', error)
      }
    })

  // imagelato templates read <templateIdOrName>
  command
    .command('read <templateIdOrName>')
    .description('read a template formatted for the terminal')
    .action(async templateIdOrName => {
      try {
        await ensureLoggedIn()

        const template = await getTemplate(templateIdOrName)

        if (!template) {
          console.log('Template not found')

          return
        }

        const dim = text => `\x1b[2m${text}\x1b[0m`
        const bold = text => `\x1b[1m${text}\x1b[0m`
        const cyan = text => `\x1b[36m${text}\x1b[0m`

        console.log()
        const name = template.name || template._id
        console.log(bold(name))
        console.log(dim(template._id))
        console.log()

        const fields = []
        if (template.projectId) fields.push(`${cyan('projectId')}  ${template.projectId}`)
        if (template.organizationId) fields.push(`${cyan('organizationId')}  ${template.organizationId}`)
        if (template.formats) fields.push(`${cyan('formats')}  ${template.formats.join(', ')}`)
        if (template.sizes) fields.push(`${cyan('sizes')}  ${template.sizes.join(', ')}`)
        if (template.creationTime) fields.push(`${cyan('created')}  ${template.creationTime}`)
        if (template.lastEditTime) fields.push(`${cyan('edited')}   ${template.lastEditTime}`)

        if (fields.length > 0) {
          fields.forEach(line => console.log(line))
        }

        console.log()
      } catch (error) {
        console.log('error', error)
      }
    })

  // imagelato templates add <name>
  command
    .command('add <name>')
    .description('add a new template')
    .option('--projectId [projectId]', 'project id')
    .option(
      '--formats [formats]',
      'comma-separated list of formats (e.g. jpg,webp)',
      'jpg,webp',
    )
    .option(
      '--sizes [sizes]',
      'comma-separated list of sizes in pixels (e.g. 512,256,128,64)',
      '512,256,128,64',
    )
    .action(async (name, options) => {
      try {
        await ensureLoggedIn()

        const config = getConfig()
        const projectId = options.projectId || config?.projectId

        if (!projectId) {
          console.log(
            'error: --projectId is required (or set projectId in imagelato.json)',
          )
          process.exit(1)
        }

        const formats = options.formats
          .split(',')
          .map(format => format.trim())
          .filter(Boolean)
        // Store sizes as strings to match the existing convention — imagelato's
        // imagesHandler does `sizes[s]?.trim?.()` and silently drops any size
        // that isn't a string, so a number-typed size produces zero variants.
        const sizes = options.sizes
          .split(',')
          .map(size => size.trim())
          .filter(Boolean)

        const template = await addTemplate({
          name,
          projectId,
          formats,
          sizes,
        })

        console.log(`Created template "${template.name}" (${template._id})`)
      } catch (error) {
        console.log('error', error)
      }
    })

  // imagelato templates update <templateIdOrName>
  command
    .command('update <templateIdOrName>')
    .description('update an existing template')
    .option('--name [name]', 'new name')
    .option('--projectId [projectId]', 'project id')
    .option(
      '--formats [formats]',
      'comma-separated list of formats (e.g. jpg,webp)',
    )
    .option(
      '--sizes [sizes]',
      'comma-separated list of sizes in pixels (e.g. 512,256,128,64)',
    )
    .action(async (templateIdOrName, options) => {
      try {
        await ensureLoggedIn()

        const existing = await getTemplate(templateIdOrName)

        if (!existing) {
          console.log('Template not found')

          return
        }

        const update = { ...existing }
        if (options.name) update.name = options.name
        if (options.projectId) update.projectId = options.projectId
        if (options.formats) {
          update.formats = options.formats
            .split(',')
            .map(format => format.trim())
            .filter(Boolean)
        }
        if (options.sizes) {
          // Store sizes as strings to match the existing convention; see add.
          update.sizes = options.sizes
            .split(',')
            .map(size => size.trim())
            .filter(Boolean)
        }

        const template = await updateTemplate(update)

        console.log(`Updated template "${template.name}" (${template._id})`)
      } catch (error) {
        console.log('error', error)
      }
    })

  return command
}

module.exports = templatesCommand
