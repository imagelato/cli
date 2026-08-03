/* Copyright 2013 - 2024 Waiterio LLC */
const { inspect } = require('node:util')
const commander = require('commander')
const {
  fail,
  printJson,
  withJson,
} = require('@monorepool/agentfirst/output.js')
const ensureAuth = require('./ensureAuth.js')
const getConfig = require('./getConfig.js')
const notFound = require('./notFound.js')
const getTemplates = require('@imagelato/client/getTemplates.js').default
const getTemplate = require('@imagelato/client/getTemplate.js').default
const addTemplate = require('@imagelato/client/addTemplate.js').default
const updateTemplate = require('@imagelato/client/updateTemplate.js').default

function templatesCommand() {
  const command = new commander.Command('templates')
  command.description('manage templates')

  // imagelato templates list
  withJson(
    command
      .command('list')
      .description('list templates')
      .option('--projectId [projectId]', 'project id'),
  ).action(async options => {
    try {
      await ensureAuth()

      const config = getConfig()
      const projectId = options.projectId || config?.projectId

      const parameters = {}
      if (projectId) parameters.projectId = projectId

      const templates = await getTemplates(parameters)

      if (options.json) {
        printJson(templates)
      } else if (templates.length === 0) {
        console.log('No templates found')
      } else {
        console.log(`Found ${templates.length} template(s):`)
        templates.forEach((template, index) => {
          const name = template.name || template._id
          console.log(`${index + 1}. ${name} (${template._id})`)
        })
      }
    } catch (error) {
      fail(error, { json: options.json })
    }
  })

  // imagelato templates get [templateIdOrName]
  withJson(
    command
      .command('get [templateIdOrName]')
      .description('get templates (raw JSON), or a single template by id or name')
      .option('--projectId [projectId]', 'project id'),
  ).action(async (templateIdOrName, options) => {
    try {
      await ensureAuth()

      if (templateIdOrName) {
        const template = await getTemplate(templateIdOrName)

        if (!template) {
          notFound('Template not found', options.json)
        } else if (options.json) {
          printJson(template)
        } else {
          console.log(inspect(template, { colors: true, depth: null }))
        }
      } else {
        const config = getConfig()
        const projectId = options.projectId || config?.projectId

        const parameters = {}
        if (projectId) parameters.projectId = projectId

        const templates = await getTemplates(parameters)

        if (options.json) {
          printJson(templates)
        } else {
          console.log(inspect(templates, { colors: true, depth: null }))
        }
      }
    } catch (error) {
      fail(error, { json: options.json })
    }
  })

  // imagelato templates read <templateIdOrName>
  withJson(
    command
      .command('read <templateIdOrName>')
      .description('read a template formatted for the terminal'),
  ).action(async (templateIdOrName, options) => {
    try {
      await ensureAuth()

      const template = await getTemplate(templateIdOrName)

      if (!template) {
        notFound('Template not found', options.json)

        return
      }

      if (options.json) {
        printJson(template)

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
      fail(error, { json: options.json })
    }
  })

  // imagelato templates add <name>
  withJson(
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
      ),
  ).action(async (name, options) => {
    try {
      await ensureAuth()

      const config = getConfig()
      const projectId = options.projectId || config?.projectId

      if (!projectId) {
        fail(
          new Error(
            '--projectId is required (or set projectId in imagelato.json)',
          ),
          { json: options.json },
        )

        return
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

      if (options.json) {
        printJson({ ok: true, id: template._id, name: template.name })
      } else {
        console.log(`Created template "${template.name}" (${template._id})`)
      }
    } catch (error) {
      fail(error, { json: options.json })
    }
  })

  // imagelato templates update <templateIdOrName>
  withJson(
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
      ),
  ).action(async (templateIdOrName, options) => {
    try {
      await ensureAuth()

      const existing = await getTemplate(templateIdOrName)

      if (!existing) {
        notFound('Template not found', options.json)

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

      if (options.json) {
        printJson({ ok: true, id: template._id, name: template.name })
      } else {
        console.log(`Updated template "${template.name}" (${template._id})`)
      }
    } catch (error) {
      fail(error, { json: options.json })
    }
  })

  return command
}

module.exports = templatesCommand
