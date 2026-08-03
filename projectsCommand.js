/* Copyright 2013 - 2024 Waiterio LLC */
const { inspect } = require('node:util')
const commander = require('commander')
const {
  fail,
  printJson,
  withJson,
} = require('@monorepool/agentfirst/output.js')
const ensureAuth = require('./ensureAuth.js')
const notFound = require('./notFound.js')
const getProjects = require('@imagelato/client/getProjects.js').default
const getProject = require('@imagelato/client/getProject.js').default
const addProject = require('@imagelato/client/addProject.js').default

function projectsCommand() {
  const command = new commander.Command('projects')
  command.description('manage projects')

  // imagelato projects list
  withJson(command.command('list').description('list projects')).action(
    async options => {
      try {
        await ensureAuth()

        const projects = await getProjects()

        if (options.json) {
          printJson(projects)
        } else if (projects.length === 0) {
          console.log('No projects found')
        } else {
          console.log(`Found ${projects.length} project(s):`)
          projects.forEach((project, index) => {
            const name = project.name || project._id
            console.log(`${index + 1}. ${name} (${project._id})`)
          })
        }
      } catch (error) {
        fail(error, { json: options.json })
      }
    },
  )

  // imagelato projects get [projectIdOrName]
  withJson(
    command
      .command('get [projectIdOrName]')
      .description('get projects (raw JSON), or a single project by id or name'),
  ).action(async (projectIdOrName, options) => {
    try {
      await ensureAuth()

      if (projectIdOrName) {
        const project = await getProject(projectIdOrName)

        if (!project) {
          notFound('Project not found', options.json)
        } else if (options.json) {
          printJson(project)
        } else {
          console.log(inspect(project, { colors: true, depth: null }))
        }
      } else {
        const projects = await getProjects()

        if (options.json) {
          printJson(projects)
        } else {
          console.log(inspect(projects, { colors: true, depth: null }))
        }
      }
    } catch (error) {
      fail(error, { json: options.json })
    }
  })

  // imagelato projects read <projectIdOrName>
  withJson(
    command
      .command('read <projectIdOrName>')
      .description('read a project formatted for the terminal'),
  ).action(async (projectIdOrName, options) => {
    try {
      await ensureAuth()

      const project = await getProject(projectIdOrName)

      if (!project) {
        notFound('Project not found', options.json)

        return
      }

      if (options.json) {
        printJson(project)

        return
      }

      const dim = text => `\x1b[2m${text}\x1b[0m`
      const bold = text => `\x1b[1m${text}\x1b[0m`
      const cyan = text => `\x1b[36m${text}\x1b[0m`

      console.log()
      const name = project.name || project._id
      console.log(bold(name))
      console.log(dim(project._id))
      console.log()

      const fields = []
      if (project.organizationId) fields.push(`${cyan('organizationId')}  ${project.organizationId}`)
      if (project.defaultLocale) fields.push(`${cyan('defaultLocale')}  ${project.defaultLocale}`)
      if (project.locales) fields.push(`${cyan('locales')}  ${project.locales.join(', ')}`)
      if (project.creationTime) fields.push(`${cyan('created')}  ${project.creationTime}`)
      if (project.lastEditTime) fields.push(`${cyan('edited')}   ${project.lastEditTime}`)

      if (fields.length > 0) {
        fields.forEach(line => console.log(line))
      }

      console.log()
    } catch (error) {
      fail(error, { json: options.json })
    }
  })

  // imagelato projects create <name>
  withJson(
    command.command('create <name>').description('create a new project'),
  ).action(async (name, options) => {
    try {
      await ensureAuth()

      const project = await addProject({ name })

      if (options.json) {
        printJson({ ok: true, id: project._id, name: project.name })
      } else {
        console.log(`Created project: ${project.name} (${project._id})`)
      }
    } catch (error) {
      fail(error, { json: options.json })
    }
  })

  return command
}

module.exports = projectsCommand
