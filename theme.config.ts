/**
 * Global palette config. Change `activePreset`, tweak a preset, or add your own —
 * every color on the site reads from these values via CSS variables.
 *
 * Base: Omarchy "Lupine" (github.com/basecamp/omarchy/tree/master/themes/lupine)
 */

export type Palette = {
  /** Gaps between tiles — the "wallpaper" */
  desktop: string
  /** Tile / window surface */
  background: string
  /** Main text */
  foreground: string
  /** Secondary text, line numbers, labels */
  muted: string
  /** Quiet fills: code blocks, table headers */
  surface: string
  /** Tile borders and rules (Hyprland inactive border) */
  border: string
  /** Highlights, active tile, links on hover (Hyprland active border) */
  accent: string
  /** Text drawn on top of `accent` */
  accentForeground: string
  /** Text selection */
  selection: string
}

export const presets = {
  lupine: {
    desktop: '#ececec',
    background: '#fafafa',
    foreground: '#212121',
    muted: '#6b6b6b',
    surface: '#f2f2f2',
    border: '#8a4ad7',
    accent: '#c900c4',
    accentForeground: '#fafafa',
    selection: '#d0d0d0',
  },
  'lupine-bright': {
    desktop: '#f5f5f5',
    background: '#ffffff',
    foreground: '#212121',
    muted: '#6b6b6b',
    surface: '#f5f5f5',
    border: '#b363ff',
    accent: '#c900c4',
    accentForeground: '#ffffff',
    selection: '#e6d6fb',
  },
  'lupine-blue': {
    desktop: '#ececec',
    background: '#fafafa',
    foreground: '#212121',
    muted: '#6b6b6b',
    surface: '#f2f2f2',
    border: '#3264eb',
    accent: '#8a4ad7',
    accentForeground: '#fafafa',
    selection: '#d0d0d0',
  },
  ink: {
    desktop: '#e4e4e4',
    background: '#ffffff',
    foreground: '#000000',
    muted: '#6e6e6e',
    surface: '#f3f3f3',
    border: '#000000',
    accent: '#000000',
    accentForeground: '#ffffff',
    selection: '#c0c0c0',
  },
} satisfies Record<string, Palette>

export const activePreset: keyof typeof presets = 'lupine'

export const palette: Palette = presets[activePreset]

export function paletteToCssVars(p: Palette): Record<string, string> {
  return {
    '--desktop': p.desktop,
    '--background': p.background,
    '--foreground': p.foreground,
    '--muted-foreground': p.muted,
    '--surface': p.surface,
    '--border': p.border,
    '--accent': p.accent,
    '--accent-foreground': p.accentForeground,
    '--selection': p.selection,
  }
}
