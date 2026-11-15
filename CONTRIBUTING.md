# Contributing

## Add a plugin hosted in this repo

1. Pick a category folder under `plugins/` (or add one, below).
2. Copy `templates/plugin-template` to `plugins/<category>/<plugin-name>/` and set `name` in its `.claude-plugin/plugin.json` to the folder name.
3. Add an entry to `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "<plugin-name>",
     "description": "One sentence.",
     "category": "<category>",
     "tags": ["..."],
     "source": "./plugins/<category>/<plugin-name>"
   }
   ```
4. Add a row to `plugins/<category>/README.md` and to the catalog table in the top-level README.

## Add a plugin from another repository

Leave the code where it lives and point at it:

```json
{
  "name": "<plugin-name>",
  "description": "One sentence.",
  "category": "<category>",
  "source": { "source": "github", "repo": "khorum-oss/<repo>", "ref": "v1.2.0" }
}
```

- The repo needs `.claude-plugin/plugin.json` at its root. If it has none, add `"strict": false`
  and list its components here, as `argo-guide` does with `"skills": ["./skills/argo-guide"]`.
- `ref` pins a tag or branch. Leave it out to track the default branch.
- Still add the row to the category README.

## Add a category

Create `plugins/<kebab-case-name>/README.md` with a one-line scope and an empty plugin table.
Categories describe what a plugin does for the user, such as `media-production`,
`observability` or `developer-tools`, not how it works (skill, hook, MCP).

## Check your change

```bash
node scripts/validate.mjs
claude plugin validate .
```

CI runs both on every pull request.
