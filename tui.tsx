// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import { For, Show, createMemo } from "solid-js"

const id = "vault-tec"

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

function VaultTecSidebar(props) {
  const ctx = props.ctx
  const messages = createMemo(() => ctx.data.session.message.list(props.sessionID))
  const session = createMemo(() => ctx.data.session.get(props.sessionID))
  const cost = createMemo(() => ctx.data.session.cost(props.sessionID))
  const models = createMemo(() => ctx.data.location.model.list(session()?.location))

  const last = createMemo(() => {
    const list = messages()
    const boundary = session()?.revert?.messageID
    const boundaryIndex = boundary ? list.findIndex((message) => message.id === boundary) : -1
    if (boundary && boundaryIndex === -1) return
    const end = boundaryIndex === -1 ? list.length : boundaryIndex
    const compactionIndex = list.findLastIndex(
      (message, index) => message.type === "compaction" && message.status === "completed" && index < end,
    )
    return list.findLast(
      (message, index) => message.type === "assistant" && message.tokens !== undefined && index > compactionIndex && index < end,
    )
  })

  const usage = createMemo(() => {
    const current = last()
    if (!current) return
    const tokens =
      current.tokens.input +
      current.tokens.output +
      current.tokens.reasoning +
      current.tokens.cache.read +
      current.tokens.cache.write
    if (tokens <= 0) return
    const model = models()?.find(
      (item) => item.providerID === current.model.providerID && item.id === current.model.id,
    )
    return {
      tokens,
      percent: model?.limit.context ? Math.round((tokens / model.limit.context) * 100) : undefined,
    }
  })

  const model = createMemo(() => {
    const current = last()
    if (!current) return
    return models()?.find(
      (item) => item.providerID === current.model.providerID && item.id === current.model.id,
    )
  })

  const contextRatio = createMemo(() => {
    const limit = model()?.limit.context
    if (!limit) return 0
    return Math.min(1, (usage()?.tokens ?? 0) / limit)
  })
  const outputRatio = createMemo(() => {
    const limit = model()?.limit.output
    if (!limit) return 0
    return Math.min(1, (last()?.tokens.output ?? 0) / limit)
  })
  const cacheRatio = createMemo(() => {
    const tokens = usage()?.tokens ?? 0
    if (tokens <= 0) return 0
    return Math.min(1, (last()?.tokens.cache.read ?? 0) / tokens)
  })

  const contextColor = createMemo(() => {
    const ratio = contextRatio()
    if (ratio > 0.9) return ctx.theme.text.feedback.error.base
    if (ratio > 0.7) return ctx.theme.text.feedback.warning.base
    return ctx.theme.text.action.primary.base
  })
  const contextPercent = createMemo(() => {
    const percent = usage()?.percent
    return percent === undefined ? "—" : `${percent}%`
  })
  const outputPercent = createMemo(() => `${Math.round(outputRatio() * 100)}%`)
  const cachePercent = createMemo(() => `${Math.round(cacheRatio() * 100)}%`)

  return (
    <box flexDirection="column" gap={1}>
      <text fg={ctx.theme.text.action.primary.base}>
        <b>VAULT-TEC INDUSTRIES</b>
      </text>
      <box alignItems="center">
        <For each={side}>
          {(line) => (
            <text fg={ctx.theme.text.muted} selectable={false}>
              {line}
            </text>
          )}
        </For>
      </box>
      <Show when={usage() || cost() > 0}>
        <box width="100%" flexDirection="column">
          <text fg={ctx.theme.text.action.primary.base}>
            <b>PIP-BOY 3000 MKIV</b>
          </text>
          <Show when={model()?.limit.context}>
            <text>
              <span style={{ fg: ctx.theme.text.muted }}>CTX </span>
              <span style={{ fg: contextColor() }}>[{bar(contextRatio(), 14)}]</span>
              <span style={{ fg: ctx.theme.text.base }}> {contextPercent()}</span>
            </text>
            <text fg={ctx.theme.text.muted}>
              {format(usage()?.tokens ?? 0)} / {format(model()?.limit.context ?? 0)} tokens
            </text>
          </Show>
          <Show when={model()?.limit.output}>
            <text>
              <span style={{ fg: ctx.theme.text.muted }}>OUT </span>
              <span style={{ fg: ctx.theme.text.action.primary.base }}>[{bar(outputRatio(), 14)}]</span>
              <span style={{ fg: ctx.theme.text.base }}> {outputPercent()}</span>
            </text>
            <text fg={ctx.theme.text.muted}>
              {format(last()?.tokens.output ?? 0)} / {format(model()?.limit.output ?? 0)} tokens
            </text>
          </Show>
          <text>
            <span style={{ fg: ctx.theme.text.muted }}>CSH </span>
            <span style={{ fg: ctx.theme.text.feedback.success.base }}>[{bar(cacheRatio(), 14)}]</span>
            <span style={{ fg: ctx.theme.text.base }}> {cachePercent()}</span>
          </text>
          <text>
            <span style={{ fg: ctx.theme.text.muted }}>CAPS </span>
            <span style={{ fg: ctx.theme.text.feedback.warning.base }}>{formatCaps(cost() ?? 0)}</span>
          </text>
        </box>
      </Show>
    </box>
  )
}

const plugin = {
  id,
  setup: (ctx) => {
    if (ctx.options.enabled === false) return
    if (ctx.options.sidebar === false) return
    const dispose = ctx.ui.slot({
      append: "sidebar.content",
      render: (input) => <VaultTecSidebar ctx={ctx} sessionID={input.sessionID} />,
    })
    return () => dispose()
  },
}

export default plugin
