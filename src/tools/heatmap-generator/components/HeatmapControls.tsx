import { HeatmapSettings } from "../types"
import { PALETTE_OPTIONS } from "../constants"

type Props = {
  settings: HeatmapSettings
  onChange: (next: HeatmapSettings) => void
}

export default function HeatmapControls({ settings, onChange }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-5">
      <div className="text-sm font-semibold">Heatmap settings</div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm md:col-span-2">
          Figure title
          <input
            type="text"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.figureTitle}
            onChange={(e) => onChange({ ...settings, figureTitle: e.target.value })}
          />
        </label>

        <label className="block text-sm md:col-span-2">
          Figure subtitle
          <input
            type="text"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.figureSubtitle}
            onChange={(e) => onChange({ ...settings, figureSubtitle: e.target.value })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showEmbeddedLegend}
            onChange={(e) => onChange({ ...settings, showEmbeddedLegend: e.target.checked })}
          />
          Show embedded legend
        </label>

        <label className="block text-sm">
          Legend position
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.legendPosition}
            onChange={(e) =>
              onChange({
                ...settings,
                legendPosition: e.target.value as HeatmapSettings["legendPosition"],
              })
            }
          >
            <option value="right">Right</option>
            <option value="bottom">Bottom</option>
          </select>
        </label>

        <label className="block text-sm">
          PNG export scale
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.pngExportScale}
            onChange={(e) => onChange({ ...settings, pngExportScale: Number(e.target.value) })}
          >
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={3}>3×</option>
          </select>
        </label>

        <label className="block text-sm">
          Figure preset
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.figurePreset}
            onChange={(e) =>
              onChange({
                ...settings,
                figurePreset: e.target.value as HeatmapSettings["figurePreset"],
              })
            }
          >
            <option value="compact">Compact</option>
            <option value="publication">Publication</option>
            <option value="poster">Poster</option>
          </select>
        </label>

        <label className="block text-sm">
          Font style
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.fontPreset}
            onChange={(e) =>
              onChange({
                ...settings,
                fontPreset: e.target.value as HeatmapSettings["fontPreset"],
              })
            }
          >
            <option value="minimal">Minimal</option>
            <option value="nature">Nature-style</option>
            <option value="science">Science-style</option>
          </select>
        </label>

        <label className="block text-sm">
          Export width
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.exportWidth}
            onChange={(e) =>
              onChange({
                ...settings,
                exportWidth: Number(e.target.value) as HeatmapSettings["exportWidth"],
              })
            }
          >
            <option value={1200}>1200 px (web)</option>
            <option value={1800}>1800 px (paper)</option>
            <option value={2400}>2400 px (publication)</option>
          </select>
        </label>

        <label className="block text-sm">
          Matrix mode
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.matrixMode}
            onChange={(e) =>
              onChange({
                ...settings,
                matrixMode: e.target.value as HeatmapSettings["matrixMode"],
              })
            }
          >
            <option value="standard">Standard matrix</option>
            <option value="correlation">Correlation matrix (rows)</option>
          </select>
        </label>

        <label className="block text-sm">
          Transform
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.transform}
            onChange={(e) =>
              onChange({
                ...settings,
                transform: e.target.value as HeatmapSettings["transform"],
              })
            }
          >
            <option value="none">None</option>
            <option value="row-zscore">Row z-score</option>
            <option value="col-zscore">Column z-score</option>
          </select>
        </label>

        <label className="block text-sm">
          Distance metric
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.distanceMetric}
            onChange={(e) =>
              onChange({
                ...settings,
                distanceMetric: e.target.value as HeatmapSettings["distanceMetric"],
              })
            }
          >
            <option value="euclidean">Euclidean</option>
            <option value="correlation">Correlation</option>
          </select>
        </label>

        <label className="block text-sm">
          Palette
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.palette}
            onChange={(e) =>
              onChange({
                ...settings,
                palette: e.target.value as HeatmapSettings["palette"],
              })
            }
          >
            {PALETTE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.clusterRows}
            onChange={(e) => onChange({ ...settings, clusterRows: e.target.checked })}
          />
          Cluster rows
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.clusterCols}
            onChange={(e) => onChange({ ...settings, clusterCols: e.target.checked })}
          />
          Cluster columns
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.reversePalette}
            onChange={(e) => onChange({ ...settings, reversePalette: e.target.checked })}
          />
          Reverse palette
        </label>

        <label className="block text-sm">
          Missing values
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.missingValueMode}
            onChange={(e) =>
              onChange({
                ...settings,
                missingValueMode: e.target.value as HeatmapSettings["missingValueMode"],
              })
            }
          >
            <option value="keep">Keep as missing</option>
            <option value="zero">Replace with 0</option>
            <option value="row-mean">Replace with row mean</option>
            <option value="col-mean">Replace with column mean</option>
          </select>
        </label>

        <label className="block text-sm">
          Color minimum
          <input
            type="number"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.colorMin ?? ""}
            placeholder="Auto"
            onChange={(e) =>
              onChange({
                ...settings,
                colorMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="block text-sm">
          Color maximum
          <input
            type="number"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.colorMax ?? ""}
            placeholder="Auto"
            onChange={(e) =>
              onChange({
                ...settings,
                colorMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="block text-sm">
          Missing color
          <input
            type="color"
            className="mt-1 h-10 w-full rounded border px-1 py-1"
            value={settings.missingColor}
            onChange={(e) => onChange({ ...settings, missingColor: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          Row search/filter
          <input
            type="text"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.rowSearch}
            placeholder="Filter row labels"
            onChange={(e) => onChange({ ...settings, rowSearch: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          Column search/filter
          <input
            type="text"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.colSearch}
            placeholder="Filter column labels"
            onChange={(e) => onChange({ ...settings, colSearch: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          Top N rows by variance
          <input
            type="number"
            min="1"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.topNRows ?? ""}
            placeholder="All rows"
            onChange={(e) =>
              onChange({
                ...settings,
                topNRows: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="block text-sm">
          Top N columns by variance
          <input
            type="number"
            min="1"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.topNCols ?? ""}
            placeholder="All columns"
            onChange={(e) =>
              onChange({
                ...settings,
                topNCols: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="block text-sm">
          Row cut groups
          <input
            type="number"
            min="2"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.rowCutGroups ?? ""}
            placeholder="None"
            onChange={(e) =>
              onChange({
                ...settings,
                rowCutGroups: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="block text-sm">
          Column cut groups
          <input
            type="number"
            min="2"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.colCutGroups ?? ""}
            placeholder="None"
            onChange={(e) =>
              onChange({
                ...settings,
                colCutGroups: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showDendrograms}
            onChange={(e) => onChange({ ...settings, showDendrograms: e.target.checked })}
          />
          Show dendrograms
        </label>

        <label className="block text-sm">
          Dendrogram size
          <input
            type="number"
            min="30"
            max="160"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.dendrogramSize}
            onChange={(e) => onChange({ ...settings, dendrogramSize: Number(e.target.value) })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.largeMatrixMode}
            onChange={(e) => onChange({ ...settings, largeMatrixMode: e.target.checked })}
          />
          Large matrix mode
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showCellBorders}
            onChange={(e) => onChange({ ...settings, showCellBorders: e.target.checked })}
          />
          Show cell borders
        </label>

        <label className="block text-sm">
          Row side barplot
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.rowBarplotMode}
            onChange={(e) =>
              onChange({
                ...settings,
                rowBarplotMode: e.target.value as HeatmapSettings["rowBarplotMode"],
              })
            }
          >
            <option value="none">None</option>
            <option value="mean">Mean</option>
          </select>
        </label>

        <label className="block text-sm">
          Column side barplot
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.colBarplotMode}
            onChange={(e) =>
              onChange({
                ...settings,
                colBarplotMode: e.target.value as HeatmapSettings["colBarplotMode"],
              })
            }
          >
            <option value="none">None</option>
            <option value="mean">Mean</option>
          </select>
        </label>

        <label className="block text-sm">
          Side barplot size
          <input
            type="number"
            min="30"
            max="120"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.barplotSize}
            onChange={(e) => onChange({ ...settings, barplotSize: Number(e.target.value) })}
          />
        </label>

        <label className="block text-sm">
          Overlay style
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.overlayStyle}
            onChange={(e) =>
              onChange({
                ...settings,
                overlayStyle: e.target.value as HeatmapSettings["overlayStyle"],
              })
            }
          >
            <option value="none">None</option>
            <option value="stars">Stars</option>
            <option value="dots">Dots</option>
            <option value="outlines">Outlines</option>
          </select>
        </label>

        <label className="block text-sm">
          Threshold 1
          <input
            type="number"
            step="0.0001"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.significanceThreshold1}
            onChange={(e) => onChange({ ...settings, significanceThreshold1: Number(e.target.value) })}
          />
        </label>

        <label className="block text-sm">
          Threshold 2
          <input
            type="number"
            step="0.0001"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.significanceThreshold2}
            onChange={(e) => onChange({ ...settings, significanceThreshold2: Number(e.target.value) })}
          />
        </label>

        <label className="block text-sm">
          Threshold 3
          <input
            type="number"
            step="0.0001"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.significanceThreshold3}
            onChange={(e) => onChange({ ...settings, significanceThreshold3: Number(e.target.value) })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.hideNonSignificantOverlay}
            onChange={(e) => onChange({ ...settings, hideNonSignificantOverlay: e.target.checked })}
          />
          Hide non-significant overlay
        </label>

        <label className="block text-sm">
          Row order mode
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.rowOrderMode}
            onChange={(e) =>
              onChange({
                ...settings,
                rowOrderMode: e.target.value as HeatmapSettings["rowOrderMode"],
              })
            }
          >
            <option value="default">Default</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="reverse">Reverse</option>
            <option value="custom">Custom</option>
            <option value="drag">Drag editor</option>
          </select>
        </label>

        <label className="block text-sm">
          Column order mode
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.colOrderMode}
            onChange={(e) =>
              onChange({
                ...settings,
                colOrderMode: e.target.value as HeatmapSettings["colOrderMode"],
              })
            }
          >
            <option value="default">Default</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="reverse">Reverse</option>
            <option value="custom">Custom</option>
            <option value="drag">Drag editor</option>
          </select>
        </label>

        <label className="block text-sm md:col-span-2">
          Custom row order (one label per line)
          <textarea
            value={settings.customRowOrderText}
            onChange={(e) => onChange({ ...settings, customRowOrderText: e.target.value })}
            className="mt-1 h-28 w-full rounded border px-3 py-2 font-mono text-xs"
            placeholder="Only used when row order mode = custom"
          />
        </label>

        <label className="block text-sm md:col-span-2">
          Custom column order (one label per line)
          <textarea
            value={settings.customColOrderText}
            onChange={(e) => onChange({ ...settings, customColOrderText: e.target.value })}
            className="mt-1 h-28 w-full rounded border px-3 py-2 font-mono text-xs"
            placeholder="Only used when column order mode = custom"
          />
        </label>

        <label className="block text-sm">
          Cell size
          <input
            type="number"
            min="8"
            max="60"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.cellSize}
            onChange={(e) => onChange({ ...settings, cellSize: Number(e.target.value) })}
          />
        </label>

        <label className="block text-sm">
          Font size
          <input
            type="number"
            min="8"
            max="20"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.fontSize}
            onChange={(e) => onChange({ ...settings, fontSize: Number(e.target.value) })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showRowLabels}
            onChange={(e) => onChange({ ...settings, showRowLabels: e.target.checked })}
          />
          Show row labels
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showColLabels}
            onChange={(e) => onChange({ ...settings, showColLabels: e.target.checked })}
          />
          Show column labels
        </label>
      </div>

      <div className="text-xs text-slate-500">
        Figure title, subtitle, embedded legend, legend placement, PNG export scale, presets, and export width affect the exported figure directly.
      </div>
    </div>
  )
}