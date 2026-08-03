/* Copyright 2013 - 2024 Waiterio LLC */
const { inspect } = require('node:util')
const commander = require('commander')
const rehydrateSession = require('./session/rehydrateSession.js')
const isLoggedInSession = require('./session/isLoggedInSession.js')
const login = require('./login.js')
const getConfig = require('./getConfig.js')
const getBatches = require('@imagelato/client/getBatches.js').default
const getBatch = require('@imagelato/client/getBatch.js').default

async function ensureLoggedIn() {
  await rehydrateSession()

  if (!isLoggedInSession()) {
    console.log('Please login first')
    await login()
    await rehydrateSession()
  }
}

function batchesCommand() {
  const command = new commander.Command('batches')
  command.description('manage batches')

  // imagelato batches list
  command
    .command('list')
    .description('list batches')
    .option('--projectId [projectId]', 'project id')
    .option('-n, --limit [limit]', 'limit number of results')
    .action(async options => {
      try {
        await ensureLoggedIn()

        const config = getConfig()
        const projectId = options.projectId || config?.projectId

        const parameters = {}
        if (projectId) parameters.projectId = projectId
        if (options.limit) parameters.limit = options.limit

        const batches = await getBatches(parameters)

        if (batches.length === 0) {
          console.log('No batches found')
        } else {
          console.log(`Found ${batches.length} batch(es):`)
          batches.forEach((batch, index) => {
            const name = batch.slug || batch._id
            const format = batch.format ? ` [${batch.format}]` : ''
            console.log(`${index + 1}. ${name}${format} (${batch._id})`)
          })
        }
      } catch (error) {
        console.log('error', error)
      }
    })

  // imagelato batches get [batchId]
  command
    .command('get [batchId]')
    .description('get batches (raw JSON), or a single batch by id')
    .option('--projectId [projectId]', 'project id')
    .option('-n, --limit [limit]', 'limit number of results')
    .action(async (batchId, options) => {
      try {
        await ensureLoggedIn()

        if (batchId) {
          const batch = await getBatch(batchId)

          if (batch) {
            console.log(inspect(batch, { colors: true, depth: null }))
          } else {
            console.log('Batch not found')
          }
        } else {
          const config = getConfig()
          const projectId = options.projectId || config?.projectId

          const parameters = {}
          if (projectId) parameters.projectId = projectId
          if (options.limit) parameters.limit = options.limit

          const batches = await getBatches(parameters)
          console.log(inspect(batches, { colors: true, depth: null }))
        }
      } catch (error) {
        console.log('error', error)
      }
    })

  // imagelato batches read <batchId>
  command
    .command('read <batchId>')
    .description('read a batch formatted for the terminal')
    .action(async batchId => {
      try {
        await ensureLoggedIn()

        const batch = await getBatch(batchId)

        if (!batch) {
          console.log('Batch not found')

          return
        }

        const dim = text => `\x1b[2m${text}\x1b[0m`
        const bold = text => `\x1b[1m${text}\x1b[0m`
        const cyan = text => `\x1b[36m${text}\x1b[0m`

        console.log()
        const name = batch.slug || batch._id
        console.log(bold(name))
        console.log(dim(batch._id))
        console.log()

        const fields = []
        if (batch.projectId) fields.push(`${cyan('projectId')}  ${batch.projectId}`)
        if (batch.organizationId) fields.push(`${cyan('organizationId')}  ${batch.organizationId}`)
        if (batch.templateId) fields.push(`${cyan('templateId')}  ${batch.templateId}`)
        if (batch.url) fields.push(`${cyan('url')}  ${batch.url}`)
        if (batch.format) fields.push(`${cyan('format')}  ${batch.format}`)
        if (batch.size) fields.push(`${cyan('size')}  ${batch.size}`)
        if (batch.formats) fields.push(`${cyan('formats')}  ${batch.formats.join(', ')}`)
        if (batch.sizes) fields.push(`${cyan('sizes')}  ${batch.sizes.join(', ')}`)

        if (batch.variants && batch.variants.length > 0) {
          fields.push(
            `${cyan('variants')}  ${batch.variants.length} variant(s)`,
          )
          batch.variants.forEach((variant, i) => {
            const variantInfo = [variant.format, variant.size, variant.url]
              .filter(Boolean)
              .join('  ')
            fields.push(`  ${dim(`${i + 1}.`)} ${variantInfo}`)
          })
        }

        if (batch.metadata) fields.push(`${cyan('metadata')}  ${JSON.stringify(batch.metadata)}`)
        if (batch.creationTime) fields.push(`${cyan('created')}  ${batch.creationTime}`)
        if (batch.lastEditTime) fields.push(`${cyan('edited')}   ${batch.lastEditTime}`)

        if (fields.length > 0) {
          fields.forEach(line => console.log(line))
        }

        console.log()
      } catch (error) {
        console.log('error', error)
      }
    })

  return command
}

module.exports = batchesCommand
