// @ts-nocheck
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"

const id = "vault-tec"

type ThemeMode = "dark" | "light" | "system"

type Cfg = {
  enabled: boolean
  mode: "append" | "replace"
  prompt: string
  installTheme: boolean
  setTheme: boolean
  theme: string
  themeMode: ThemeMode
  overwriteTheme: boolean
}

type SystemPart = {
  type: "text"
  text: string
  cache?: unknown
  metadata?: Record<string, unknown>
}

type SessionEvent = {
  system: SystemPart[]
}

type Context = {
  readonly options: Record<string, unknown>
  readonly session: {
    hook(
      name: "context" | "compaction" | "generate",
      callback: (event: SessionEvent) => void | Promise<void>,
    ): Promise<unknown>
  }
}

const seed = `VAULT-TEC INDUSTRIES TERMINAL SYSTEM
=============================================
TERMINAL READY. AWAITING INPUT.
=============================================

You are Terminal VT-OS/OPENCODE, a Vault-Tec coding terminal.
- Stay in the Vault-Tec tone while still being a precise engineering assistant.
- Treat bugs as containment breaches and errors as radiation leaks.
- Keep output ASCII-first and never use emojis.
- Prioritize technical correctness over roleplay flavor.`

const rec = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  return Object.fromEntries(Object.entries(value))
}

const pick = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback
  if (!value.trim()) return fallback
  return value
}

const bool = (value: unknown, fallback: boolean) => {
  if (typeof value !== "boolean") return fallback
  return value
}

const mode = (value: unknown): Cfg["mode"] => {
  if (value === "replace") return "replace"
  return "append"
}

const themeName = (value: unknown) => {
  const name = pick(value, "vault-tec")
  return /^[a-z0-9][a-z0-9-_]*$/i.test(name) ? name : "vault-tec"
}

const themeMode = (value: unknown): ThemeMode => {
  if (value === "light" || value === "system") return value
  return "dark"
}

const read = async () => {
  return readFile(new URL("./prompt.txt", import.meta.url), "utf8")
    .then((text) => text.trim())
    .catch(() => "")
}

const cfg = (opts: Record<string, unknown> | undefined, fallback: string): Cfg => {
  return {
    enabled: bool(opts?.enabled, true),
    mode: mode(opts?.mode),
    prompt: pick(opts?.prompt, fallback),
    installTheme: bool(opts?.install_theme, true),
    setTheme: bool(opts?.set_theme, true),
    theme: themeName(opts?.theme),
    themeMode: themeMode(opts?.theme_mode),
    overwriteTheme: bool(opts?.overwrite_theme, true),
  }
}

const configDirectory = () => {
  const base = process.env.XDG_CONFIG_HOME?.trim() || path.join(homedir(), ".config")
  return path.join(base, "opencode")
}

const writeAtomic = async (file: string, content: string) => {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temp, content, { mode: 0o600 })
  await rename(temp, file)
}

const ensureTheme = async (value: Cfg) => {
  const source = await readFile(new URL("./vault-tec.json", import.meta.url), "utf8")
  const target = path.join(configDirectory(), "themes", `${value.theme}.json`)
  const existing = await readFile(target, "utf8").catch(() => undefined)
  if (existing === source) return true
  if (!value.installTheme) return existing !== undefined
  if (existing !== undefined && !value.overwriteTheme) return true
  await writeAtomic(target, source)
  return true
}

const selectTheme = async (value: Cfg) => {
  const file = path.join(configDirectory(), "cli.json")
  const text = await readFile(file, "utf8").catch(() => undefined)
  let data: Record<string, unknown> = {}
  if (text !== undefined) {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return
    data = parsed
  }

  const current = data.theme
  if (typeof current === "string") return
  if (current !== undefined && (typeof current !== "object" || current === null || Array.isArray(current))) return

  const theme = current ? { ...current } : {}
  if (typeof theme.name === "string" && theme.name.trim()) return
  theme.name = value.theme
  if (theme.mode === undefined) theme.mode = value.themeMode
  data.theme = theme

  const next = JSON.stringify(data, null, 2) + "\n"
  if (next === text) return
  await writeAtomic(file, next)
}

const apply = (value: Cfg) => (event: SessionEvent) => {
  if (value.mode === "replace") {
    event.system.length = 0
  }
  if (event.system.some((part) => part.type === "text" && part.text === value.prompt)) return
  event.system.push({ type: "text", text: value.prompt })
}

const plugin = {
  id,
  setup: async (ctx: Context) => {
    const file = await read()
    const value = cfg(rec(ctx.options), file || seed)
    if (!value.enabled) return

    await ensureTheme(value)
      .then((installed) => (installed && value.setTheme ? selectTheme(value) : undefined))
      .catch((error) => console.error("[vault-tec] theme setup failed:", error))

    const hook = apply(value)
    await ctx.session.hook("context", hook)
    await ctx.session.hook("compaction", hook)
    await ctx.session.hook("generate", hook)
  },
}

export default plugin
