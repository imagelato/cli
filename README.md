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
imagelato login            # opens the browser to authorize the CLI
imagelato projects list    # your projects with their ids
imagelato batches list --projectId 64a1f2c9e4b0a1b2c3d4e5f6
```

```
Found 2 project(s):
1. marketing-site (64a1f2c9e4b0a1b2c3d4e5f6)
2. product-shots (64a1f2c9e4b0a1b2c3d4e5f7)
```

## Authentication

`imagelato login` starts a temporary localhost server, opens your browser to
app.imagelato.com, and receives the session tokens on the redirect back. If
the browser does not open, the login URL is printed so you can visit it by
hand. Tokens are stored in `~/.imagelato/` and refreshed automatically when
they expire; `imagelato logout` clears them.

Any other command run without a valid session prints `Please login first` and
opens the browser itself, so in scripts and non-interactive environments log
in once beforehand.

## Commands

Every resource supports three read modes:

- `list` prints one summary line per record.
- `get` prints raw colored JSON — pass an id for one record, omit it for the
  whole array.
- `read` prints one record formatted for the terminal.

Projects and templates resolve by id or name; batches only by id.

### Session

```bash
imagelato login    # log in via browser; tokens land in ~/.imagelato/
imagelato logout   # clear the stored session
```

### Projects

```bash
imagelato projects list                    # name and id per project
imagelato projects get [projectIdOrName]   # raw JSON; omit the id for all projects
imagelato projects read <projectIdOrName>  # formatted view: locales, timestamps
imagelato projects create <name>           # create a project
```

### Batches

A batch is the result of processing one image: the original plus every
resized/reformatted variant and its URL. Batches are created by the Imagelato
API when an image is processed — the CLI reads them.

```bash
imagelato batches list [--projectId <id>] [-n 20]                  # most recent
imagelato batches get [batchId] [--projectId <id>] [-n 20]
imagelato batches read <batchId>                         # variants, formats, sizes, URLs
```

### Templates

A template is a reusable preset: the output formats and pixel widths future
processing should produce. Formats are from `jpg`, `png`, `webp`, `gif`,
`svg`; sizes are pixel widths.

```bash
imagelato templates list [--projectId <id>]
imagelato templates get [templateIdOrName] [--projectId <id>]
imagelato templates read <templateIdOrName>
imagelato templates add <name> --projectId <id> --formats jpg,webp --sizes 512,256,128,64
imagelato templates update <templateIdOrName> [--name <new>] [--formats ...] [--sizes ...]
```

`templates add` defaults to formats `jpg,webp` and sizes `512,256,128,64`
when the flags are omitted, and requires a project id (flag or configuration
file). Adding the same name twice creates two templates, so check
`templates list` first. `templates update` replaces only the fields you pass.

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
`https://api.imagelato.com`) — only needed against a non-production
deployment.

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
`imagelato --help` for the command reference. Log in once with
`imagelato login`.
```

Prefer a connector? The Imagelato MCP server at
`https://mcp.imagelato.com/mcp` exposes the same data as tools for Claude,
ChatGPT, and any MCP-capable host — see
[imagelato.com/developers](https://www.imagelato.com/developers/).

## License

[Apache-2.0](LICENSE)
