# imagelato

Command-line access to your image-delivery data on
[app.imagelato.com](https://app.imagelato.com): projects, processed image
batches with their resized and reformatted variants, and the deterministic
resize/reformat templates that configure processing.

## Install

```bash
npm install -g imagelato   # global install
npx imagelato --help       # or run without installing
```

Requires Node.js 18 or newer.

## Quick start

```bash
imagelato login            # browser or API-key login
imagelato projects list    # your projects with their ids
imagelato batches list --projectId 64a1f2c9e4b0a1b2c3d4e5f6
```

```
Found 2 project(s):
1. marketing-site (64a1f2c9e4b0a1b2c3d4e5f6)
2. product-shots (64a1f2c9e4b0a1b2c3d4e5f7)
```

## Signing up

No account yet? Create one from the terminal — the generated password prints
exactly once, and the session is stored so every other command works
immediately:

```bash
imagelato signup --email designer@example.com --json
```

## Authentication

Two ways in for an existing account; both store credentials in
`~/.imagelato/`:

- **Browser** — `imagelato login --browser` starts a temporary localhost
  server, opens app.imagelato.com, and receives the session tokens on the
  redirect back. If the browser does not open, the login URL is printed so you
  can visit it by hand. Tokens refresh automatically when they expire.
- **API key** — `imagelato login --with-key` prompts (masked) for an API key
  secret and verifies it with one authenticated call before storing it. Create
  keys on app.imagelato.com under your project's API keys; new keys default to
  read-only scopes, so widen the key there before using write commands. The
  secret is never accepted as a command-line argument.

`imagelato login` with no flag asks which method to use. `imagelato logout`
clears everything stored.

Headless environments can skip login entirely by exporting the key:

```bash
export IMAGELATO_API_KEY=<key secret>   # read at request time
```

A stored login session always wins over a stored or exported API key, so a
globally-exported `IMAGELATO_API_KEY` never changes which account an
interactive session talks to.

Without a terminal, a command with no credentials fails immediately with exit
code 1 and login instructions on stderr — the CLI never opens a browser from
a non-interactive environment. In an interactive terminal, a command run
without credentials still opens the browser login itself.

## Commands

Every resource supports three read modes:

- `list` prints one summary line per record.
- `get` prints every field — pass an id for one record, omit it for the
  whole array.
- `read` prints one record formatted for the terminal.

Every subcommand also accepts `--json`: strict, parseable JSON on stdout, no
color. Mutations print a small `{ "ok": true, "id": "…", "name": "…" }`
result. Failures go to stderr with exit code 1 — as a single JSON line in
`--json` mode.

Projects and templates resolve by id or name; batches only by id.

### Session

```bash
imagelato signup --email designer@example.com   # create an account and log in
imagelato login              # choose browser or API key interactively
imagelato login --browser    # browser flow; tokens land in ~/.imagelato/
imagelato login --with-key   # masked prompt for an API key secret
imagelato logout             # clear the stored session and key
```

### Projects

```bash
imagelato projects list [--json]                    # name and id per project
imagelato projects get [projectIdOrName] [--json]   # every field; omit the id for all projects
imagelato projects read <projectIdOrName> [--json]  # formatted view: locales, timestamps
imagelato projects create <name> [--json]           # create a project
```

### Batches

A batch is the result of processing one image: the original plus every
resized/reformatted variant and its URL. Batches are created by the Imagelato
API when an image is processed — the CLI reads them.

```bash
imagelato batches list [--projectId <id>] [-n 20] [--json]         # most recent
imagelato batches get [batchId] [--projectId <id>] [-n 20] [--json]
imagelato batches read <batchId> [--json]                # variants, formats, sizes, URLs
```

### Templates

A template is a reusable preset: the output formats and pixel widths future
processing should produce. Formats are from `jpg`, `png`, `webp`, `gif`,
`svg`; sizes are pixel widths.

```bash
imagelato templates list [--projectId <id>] [--json]
imagelato templates get [templateIdOrName] [--projectId <id>] [--json]
imagelato templates read <templateIdOrName> [--json]
imagelato templates add <name> --projectId <id> --formats jpg,webp --sizes 512,256,128,64
imagelato templates update <templateIdOrName> [--name <new>] [--formats ...] [--sizes ...]
```

`templates add` defaults to formats `jpg,webp` and sizes `512,256,128,64`
when the flags are omitted, and requires a project id (flag or configuration
file). Adding the same name twice creates two templates, so check
`templates list` first. `templates update` replaces only the fields you pass.

### Schema

```bash
imagelato schema                  # the whole command tree as JSON
imagelato schema templates add    # one command path only
```

Prints every command, option, argument, and default as parseable JSON — the
machine-readable equivalent of `--help`, for agents and tooling.

### Skills

```bash
imagelato skills list             # names and descriptions of the bundled agent guides
imagelato skills get imagelato    # print a bundled SKILL.md to stdout
```

## Configuration

An `imagelato.json` in the working directory (or any subdirectory — the CLI
scans downward from where it runs) supplies the default `--projectId`:

```json
{ "projectId": "64a1f2c9e4b0a1b2c3d4e5f6" }
```

`IMAGELATO_API_URL` overrides the API endpoint (default
`https://api.imagelato.com`) and `IMAGELATO_APP_URL` the login page — only
needed against a non-production deployment.

## Usage with AI agents

Install the Imagelato agent skills — `imagelato` (this CLI) and
`image-asset-workflow` (the MCP-based delivery-audit workflow) — for Claude
Code, Cursor, Codex, and any other agent that supports the Skills standard:

```bash
npx skills add imagelato/skills
```

The same guides ship inside the npm package, version-matched to the installed
CLI:

```bash
imagelato skills list             # what is bundled
imagelato skills get imagelato    # the CLI guide matching this version
```

Or paste this into your `AGENTS.md` / `CLAUDE.md`:

```markdown
## Image delivery

Use the `imagelato` CLI for image-delivery data: projects, processed batches
with their CDN variants, and resize/reformat templates. Run
`npx imagelato skills get imagelato` for the full guide, and
`imagelato schema` for the command tree as JSON. Add `--json` to any data
command for parseable output. Authenticate once with `imagelato login`, or
export `IMAGELATO_API_KEY` in headless environments.
```

Prefer a connector? The Imagelato MCP server at
`https://mcp.imagelato.com/mcp` exposes the same data as tools for Claude,
ChatGPT, and any MCP-capable host — see
[imagelato.com/developers](https://www.imagelato.com/developers/).

## License

[Apache-2.0](LICENSE)
