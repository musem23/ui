export const fonts = {
  sans: {
    name: "Plus Jakarta Sans",
    family: "'Plus Jakarta Sans', sans-serif",
    import: "Plus+Jakarta+Sans:wght@200..800",
  },
  mono: {
    name: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
    import: "JetBrains+Mono:wght@400;500;600",
  },
} as const

export type Fonts = typeof fonts
