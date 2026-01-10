import { fonts } from "./fonts"
import { radius } from "./tokens"

export const brandConfig = {
  fonts,
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
