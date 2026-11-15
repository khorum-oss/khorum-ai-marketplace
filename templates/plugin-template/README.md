# plugin-template

Starting point for a plugin hosted in this marketplace.

1. Copy this folder to `plugins/<category>/<your-plugin>/`.
2. Rename `name` in `.claude-plugin/plugin.json` to match the folder.
3. Keep only the component folders you need: `skills/`, `commands/`, `agents/`, `hooks/hooks.json`, `.mcp.json`.
4. Add an entry to `.claude-plugin/marketplace.json` and a row to the category README.
5. Run `node scripts/validate.mjs`.
