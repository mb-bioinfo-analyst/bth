import { FigurePreset } from "../types"

export function applyFigurePreset(preset: FigurePreset) {
  switch (preset) {
    case "compact":
      return {
        cellSize: 12,
        fontSize: 9,
        dendrogramSize: 50,
        barplotSize: 30,
      }

    case "poster":
      return {
        cellSize: 28,
        fontSize: 14,
        dendrogramSize: 120,
        barplotSize: 80,
      }

    case "publication":
    default:
      return {
        cellSize: 18,
        fontSize: 11,
        dendrogramSize: 80,
        barplotSize: 50,
      }
  }
}