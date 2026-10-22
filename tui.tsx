// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import { readFile, unlink, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"

const id = "vault-tec"

const configDirectory = () => {
  const base = process.env.XDG_CONFIG_HOME?.trim() || path.join(homedir(), ".config")
  return path.join(base, "opencode")
}

// The server writes cli.json before the TUI starts, but the CLI may already have
// loaded the old config. Touching the config directory after the TUI's watcher
// is active makes the first launch adopt the theme too.
const reloadTheme = async (ctx) => {
  if (ctx.options.reload_theme === false) return
  const name =
    typeof ctx.options.theme === "string" && ctx.options.theme.trim() ? ctx.options.theme.trim() : "vault-tec"
  const dir = configDirectory()
  const raw = await readFile(path.join(dir, "cli.json"), "utf8").catch(() => "")
  if (!raw) return
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return
  }
  const current = data?.theme
  const selected = typeof current === "string" ? current : current?.name
  if (selected !== name) return
  const marker = path.join(dir, ".vault-tec-reload")
  await writeFile(marker, String(Date.now())).catch(() => undefined)
  await new Promise((resolve) => setTimeout(resolve, 10))
  await unlink(marker).catch(() => undefined)
}

const side = [
  "⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⢀⣄⠀⣠⠶⠲⠞⠁⠀⠙⠛⠳⣆⠀⠀⠀⠀⠀",
  "⠀⡟⠙⠛⠁⣀⣀⢀⡤⢤⠀⠀⠀⠙⢷⣄⠀⠀⠀",
  "⢠⡷⢄⣠⠊⠀⠀⠁⠀⡀⠑⠒⠈⢳⠀⢻⡆⠀⠀",
  "⠀⣷⠃⢠⡀⠀⠀⠀⠀⠈⠀⠀⠀⢎⠀⢸⡇⠀⠀",
  "⢠⡇⠀⠘⢁⡄⠀⠀⠉⠉⠀⠀⠀⣳⢧⣾⠃⠀⠀",
  "⢸⡇⠀⠀⠘⠆⠀⠀⢀⠀⠀⠀⠀⠁⢿⡏⠀⠀⠀",
  "⠈⣇⠸⢖⡀⠀⠐⣂⠹⡇⠀⠀⠀⣀⣼⠇⠀⠀⠀",
  "⠀⠹⣦⠀⠈⠭⠉⠀⠀⠀⠀⣠⡾⠉⠁⠀⠀⠀⠀",
  "⠀⠀⠈⠳⢦⣄⣀⣀⣠⡴⠞⠋⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
]

const bar = (ratio, width) => {
  const safe = Math.max(0, Math.min(1, ratio))
  const size = Math.max(1, width)
  const filled = Math.round(safe * size)
  return "█".repeat(filled) + "░".repeat(size - filled)
}

const format = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 10_000) return `${Math.round(value / 1_000)}K`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

const formatCaps = (value) => {
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.01) return `$${value.toFixed(3)}`
  return `$${value.toFixed(4)}`
}

const computeStats = (ctx, sessionID) => {
  const messages = ctx.data.session.message.list(sessionID)
  const session = ctx.data.session.get(sessionID)
  const cost = ctx.data.session.cost(sessionID)
  const models = ctx.data.location.model.list(session?.location)
  const boundary = session?.revert?.messageID
  const boundaryIndex = boundary ? messages.findIndex((message) => message.id === boundary) : -1
  if (boundary && boundaryIndex === -1) return { cost }
  const end = boundaryIndex === -1 ? messages.length : boundaryIndex
  const compactionIndex = messages.findLastIndex(
    (message, index) => message.type === "compaction" && message.status === "completed" && index < end,
  )
  const last = messages.findLast(
    (message, index) =>
      message.type === "assistant" && message.tokens !== undefined && index > compactionIndex && index < end,
  )
  if (!last) return { cost }
  const tokens =
    last.tokens.input + last.tokens.output + last.tokens.reasoning + last.tokens.cache.read + last.tokens.cache.write
  const model = models?.find((item) => item.providerID === last.model.providerID && item.id === last.model.id)
  return {
    cost,
    last,
    model,
    usage:
      tokens > 0
        ? {
            tokens,
            percent: model?.limit.context ? Math.round((tokens / model.limit.context) * 100) : undefined,
          }
        : undefined,
  }
}

// This function is called by the host's reactive createComponent. Reading the
// host store here (instead of in a plugin-local memo) keeps the sidebar live:
// the host tracks the reads and re-runs the render when session data changes.
const sidebar = (ctx, sessionID) => {
  const stats = computeStats(ctx, sessionID)
  const last = stats.last
  const model = stats.model
  const usage = stats.usage
  const cost = stats.cost ?? 0
  const contextLimit = model?.limit.context
  const outputLimit = model?.limit.output
  const contextRatio = contextLimit ? Math.min(1, (usage?.tokens ?? 0) / contextLimit) : 0
  const outputRatio = outputLimit ? Math.min(1, (last?.tokens.output ?? 0) / outputLimit) : 0
  const tokens = usage?.tokens ?? 0
  const cacheRatio = tokens > 0 ? Math.min(1, (last?.tokens.cache.read ?? 0) / tokens) : 0
  const contextColor =
    contextRatio > 0.9
      ? ctx.theme.text.feedback.error.base
      : contextRatio > 0.7
        ? ctx.theme.text.feedback.warning.base
        : ctx.theme.text.action.primary.base
  const contextPercent = usage?.percent === undefined ? "—" : `${usage.percent}%`
  const outputPercent = `${Math.round(outputRatio * 100)}%`
  const cachePercent = `${Math.round(cacheRatio * 100)}%`

  return (
    <box flexDirection="column" gap={1}>
      <text fg={ctx.theme.text.action.primary.base}>
        <b>VAULT-TEC INDUSTRIES</b>
      </text>
      <box alignItems="center">
        {side.map((line) => (
          <text fg={ctx.theme.text.muted} selectable={false}>
            {line}
          </text>
        ))}
      </box>
      {usage || cost > 0 ? (
        <box width="100%" flexDirection="column">
          <text fg={ctx.theme.text.action.primary.base}>
            <b>PIP-BOY 3000 MKIV</b>
          </text>
          {contextLimit ? (
            <box flexDirection="column">
              <text>
                <span style={{ fg: ctx.theme.text.muted }}>CTX </span>
                <span style={{ fg: contextColor }}>[{bar(contextRatio, 14)}]</span>
                <span style={{ fg: ctx.theme.text.base }}> {contextPercent}</span>
              </text>
              <text fg={ctx.theme.text.muted}>
                {format(usage?.tokens ?? 0)} / {format(contextLimit)} tokens
              </text>
            </box>
          ) : null}
          {outputLimit ? (
            <box flexDirection="column">
              <text>
                <span style={{ fg: ctx.theme.text.muted }}>OUT </span>
                <span style={{ fg: ctx.theme.text.action.primary.base }}>[{bar(outputRatio, 14)}]</span>
                <span style={{ fg: ctx.theme.text.base }}> {outputPercent}</span>
              </text>
              <text fg={ctx.theme.text.muted}>
                {format(last?.tokens.output ?? 0)} / {format(outputLimit)} tokens
              </text>
            </box>
          ) : null}
          <text>
            <span style={{ fg: ctx.theme.text.muted }}>CSH </span>
            <span style={{ fg: ctx.theme.text.feedback.success.base }}>[{bar(cacheRatio, 14)}]</span>
            <span style={{ fg: ctx.theme.text.base }}> {cachePercent}</span>
          </text>
          <text>
            <span style={{ fg: ctx.theme.text.muted }}>CAPS </span>
            <span style={{ fg: ctx.theme.text.feedback.warning.base }}>{formatCaps(cost)}</span>
          </text>
        </box>
      ) : null}
    </box>
  )
}

const plugin = {
  id,
  setup: async (ctx) => {
    await reloadTheme(ctx)
    if (ctx.options.enabled === false) return
    if (ctx.options.sidebar === false) return
    const dispose = ctx.ui.slot({
      append: "sidebar.content",
      render: (input) => sidebar(ctx, input.sessionID),
    })
    return () => dispose()
  },
}

export default plugin
