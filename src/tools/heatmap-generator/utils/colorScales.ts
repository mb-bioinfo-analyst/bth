import { PaletteName } from "../types"

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const normalized = clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean

  const num = parseInt(normalized, 16)
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function interpolateColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)

  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  )
}

function multiStop(stops: string[], t: number): string {
  if (stops.length === 1) return stops[0]
  if (t <= 0) return stops[0]
  if (t >= 1) return stops[stops.length - 1]

  const scaled = t * (stops.length - 1)
  const i = Math.floor(scaled)
  const localT = scaled - i

  return interpolateColor(stops[i], stops[i + 1], localT)
}

export function paletteStops(name: PaletteName): string[] {
  switch (name) {
    case "blue-white-red":
      return ["#2166ac", "#f7f7f7", "#b2182b"]
    case "viridis":
      return ["#440154", "#31688e", "#35b779", "#fde725"]
    case "magma":
      return ["#000004", "#51127c", "#b73779", "#fc8961", "#fcfdbf"]
    case "green-black-red":
      return ["#1a9850", "#000000", "#d73027"]
    default:
      return ["#2166ac", "#f7f7f7", "#b2182b"]
  }
}

export function valueToColor(
  value: number | null,
  min: number,
  max: number,
  palette: PaletteName,
  reverse: boolean,
  missingColor: string
): string {
  if (value === null || !Number.isFinite(value)) {
    return missingColor
  }

  if (min === max) {
    return paletteStops(palette)[Math.floor(paletteStops(palette).length / 2)]
  }

  let t = (value - min) / (max - min)
  t = Math.max(0, Math.min(1, t))

  if (reverse) {
    t = 1 - t
  }

  return multiStop(paletteStops(palette), t)
}