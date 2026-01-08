import { fonts, radius } from "./tokens"

export const brandConfig = {
  fonts: {
    sans: fonts.sans,
    mono: fonts.mono,
  },
  radius: {
    default: "0.625rem",
    values: radius,
  },
  defaults: {
    mode: "light" as const,
    radius: "0.625rem",
  },
} as const

export type BrandConfig = typeof brandConfig
