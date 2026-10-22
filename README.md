# Vault-Tec plugin for OpenCode V2

A Vault-Tec personality matrix for OpenCode V2: the green phosphor `vault-tec` theme, a Vault-Tec system prompt and a Pip-Boy sidebar with Vault Boy art and live context/cost readouts.

> **Original project:** This is a fork of [`kommander/oc-plugin-vault-tec`](https://github.com/kommander/oc-plugin-vault-tec). All credit for the original Vault-Tec theme, personality prompt, Pip-Boy components and plugin architecture goes to **kommander** and the upstream contributors.

![Vault-Tec demo](assets/demo.png)

_The screenshot comes from the upstream V1 plugin. This port keeps the theme, the personality prompt and the Pip-Boy sidebar; the V1-only scanline effect, settings dialog and `/nuke` command are not part of the V2 port._

## Compatibility

- **OpenCode V2** (tested with `v2.1.3`).
- Installable on any OpenCode V2 installation.
- No custom OpenCode build or fork required.
- The theme file is the original V1 theme document; OpenCode V2 migrates it automatically.

## Installation

Install this fork directly from GitHub:

```bash
opencode plugin github:McJigsaw12/oc-plugin-vault-tec
```

Or from OpenCode:

1. Press `Ctrl+P`
2. Select `Install Plugin`
3. Enter `github:McJigsaw12/oc-plugin-vault-tec`

Restart OpenCode. On startup the plugin:

1. Copies `vault-tec.json` to `$XDG_CONFIG_HOME/opencode/themes/vault-tec.json` (or `~/.config/opencode/themes/vault-tec.json`).
2. Sets `"theme": { "name": "vault-tec" }` in `cli.json` **only when no theme name is already configured**.
3. Registers the Vault-Tec system prompt and the Pip-Boy sidebar.

If you already chose another theme, the plugin leaves your choice alone. Select `vault-tec` manually from the theme list if needed.

## Options

Plugin options can be configured in `opencode.json` (server) and `cli.json` (TUI), or through the plugin entry in `opencode.json`.

### Server

- `enabled` (`boolean`, default `true`) — disables the personality prompt and theme setup.
- `mode` (`"append" | "replace"`, default `"append"`) — append the Vault-Tec prompt to the system prompt or replace it.
- `prompt` (`string`, optional) — override the bundled personality prompt.
- `install_theme` (`boolean`, default `true`) — copy the theme into the OpenCode themes directory.
- `set_theme` (`boolean`, default `true`) — select `vault-tec` in `cli.json` when no theme name is configured.
- `theme` (`string`, default `"vault-tec"`) — theme file name to install and select.
- `theme_mode` (`"dark" | "light" | "system"`, default `"dark"`) — mode written only when `cli.json` has no theme mode.
- `overwrite_theme` (`boolean`, default `true`) — overwrite an existing theme file with the bundled copy.

### TUI

- `enabled` (`boolean`, default `true`) — disables the Pip-Boy sidebar contribution.
- `sidebar` (`boolean`, default `true`) — show the Vault Boy art and Pip-Boy context/cost readouts.

## Manual theme installation

If you prefer not to let the plugin write config files:

```bash
mkdir -p ~/.config/opencode/themes
cp vault-tec.json ~/.config/opencode/themes/vault-tec.json
```

Then add this to `~/.config/opencode/cli.json`:

```json
{
  "theme": {
    "name": "vault-tec",
    "mode": "dark"
  }
}
```

The plugin still supplies the personality prompt and the Pip-Boy sidebar; set `install_theme` and `set_theme` to `false` to skip the automatic configuration.

## Credits

- **Original Vault-Tec plugin and theme:** [`kommander/oc-plugin-vault-tec`](https://github.com/kommander/oc-plugin-vault-tec) — the original Fallout/Vault-Tec theme, personality prompt and TUI implementation. Thank you, kommander.
- **OpenCode V2:** [`anomalyco/opencode`](https://github.com/anomalyco/opencode) — the TUI, theme system and plugin API this plugin extends. Thanks to the OpenCode team and contributors.
- **Fallout / Vault-Tec / Vault Boy:** trademarks of Bethesda Softworks. This is a fan-made, non-commercial project, not affiliated with or endorsed by Bethesda.

See [CREDITS.md](CREDITS.md) for the full attribution.

## License

The upstream `kommander/oc-plugin-vault-tec` repository does not include a license file. This fork preserves the original attribution and is distributed as a derivative work for the OpenCode community. For licensing questions, please refer to the original repository and its author.
