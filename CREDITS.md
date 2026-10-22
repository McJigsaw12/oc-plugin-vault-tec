# Credits

## Original project

This repository is a fork of **[oc-plugin-vault-tec](https://github.com/kommander/oc-plugin-vault-tec)** by **[kommander](https://github.com/kommander)**.

The original Vault-Tec theme, personality prompt, Vault Boy logo, Pip-Boy sidebar, CRT effects, settings dialog, nuke command and supporting TUI code were created by kommander and the upstream contributors. Thank you for making the original plugin available.

This fork ports the parts that OpenCode V2 can support to the V2 plugin API: theme installation and selection, the personality prompt and the Pip-Boy sidebar. The V1-only scanline/vignette effects, settings dialog and `/nuke` command are not part of this port; the upstream project remains the reference for those features.

## OpenCode V2

The plugin is built on **OpenCode V2** and its public TUI plugin API:

- [anomalyco/opencode](https://github.com/anomalyco/opencode)
- [OpenCode documentation](https://opencode.ai/docs)

Thanks to the OpenCode team and all upstream contributors.

## Trademarks

Fallout, Vault-Tec and Vault Boy are trademarks of Bethesda Softworks. This is a fan-made, non-commercial project. It is not affiliated with or endorsed by Bethesda Softworks.

## Changes in this fork

- Repackaged for installation directly from GitHub with `opencode plugin github:McJigsaw12/oc-plugin-vault-tec`.
- Ported the server and TUI entrypoints to the OpenCode V2 `{ id, setup }` plugin API.
- Theme installation and selection now happen through the server plugin, which writes `themes/vault-tec.json` and, only when no theme is configured, `cli.json`.
- Added a V2 `sidebar.content` contribution with the original Vault Boy art and Pip-Boy context/cost readouts.
- Package renamed to `oc-plugin-vault-tec-mcjigsaw` to avoid conflicts with the upstream npm package.
- Removed the V1-only scanline/vignette effects, settings dialog, tips and `/nuke` modules.
