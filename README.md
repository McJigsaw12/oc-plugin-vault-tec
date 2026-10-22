# Vault-Tec plugin for OpenCode V2

A Vault-Tec personality matrix that transforms your OpenCode V2 terminal into a pre-War RobCo engineering assistant: green phosphor theme, Vault Boy logo, Pip-Boy sidebar, CRT scanlines/vignette, a settings dialog and a `/nuke` command.

> **Original project:** This is a fork of [`kommander/oc-plugin-vault-tec`](https://github.com/kommander/oc-plugin-vault-tec). All credit for the original Vault-Tec theme, personality prompt, TUI components and plugin architecture goes to **kommander** and the upstream contributors.

![Vault-Tec demo](assets/demo.png)

## Compatibility

- **OpenCode V2** (tested with `v2.1.3`).
- Installable on any OpenCode V2 installation.
- No custom OpenCode TUI build required: it is a TUI plugin.

## Installation

Install this fork directly from GitHub:

```bash
opencode plugin github:McJigsaw12/oc-plugin-vault-tec
```

Or from OpenCode:

1. Press `Ctrl+P`
2. Select `Install Plugin`
3. Enter `github:McJigsaw12/oc-plugin-vault-tec`

The original upstream npm package is also available:

```bash
opencode plugin oc-plugin-vault-tec
```

## Options

Plugin options can be configured via the `opencode.json` and `tui.json` config files.

### Server

- `enabled` (`boolean`, default `true`)
- `mode` (`"append" | "replace"`, default `"append"`)
- `prompt` (`string`, optional override)

### TUI

- `enabled` (`boolean`, default `true`)
- `theme` (`string`, default `"vault-tec"`)
- `set_theme` (`boolean`, default `true`)
- `scanlines` (`boolean`, default `true`)
- `vignette` (`number`, default `0.75`)
- `sidebar` (`boolean`, default `true`)
- `tips` (`boolean`, default `true`)

## Credits

- **Original Vault-Tec plugin and theme:** [`kommander/oc-plugin-vault-tec`](https://github.com/kommander/oc-plugin-vault-tec) — the original Fallout/Vault-Tec theme, personality prompt and TUI implementation. Thank you, kommander.
- **OpenCode V2:** [`anomalyco/opencode`](https://github.com/anomalyco/opencode) — the TUI, theme system and plugin API this plugin extends. Thanks to the OpenCode team and contributors.
- **Fallout / Vault-Tec / Vault Boy:** trademarks of Bethesda Softworks. This is a fan-made, non-commercial project, not affiliated with or endorsed by Bethesda.

See [CREDITS.md](CREDITS.md) for the full attribution.

## License

The upstream `kommander/oc-plugin-vault-tec` repository does not include a license file. This fork preserves the original attribution and is distributed as a derivative work for the OpenCode community. For licensing questions, please refer to the original repository and its author.
