import { BoxplotSettings } from "../types"
import { BOXPLOT_PALETTE_OPTIONS } from "../constants"

type Props = {
  settings: BoxplotSettings
  columns: string[]
  onChange: (next: BoxplotSettings) => void
}

export default function BoxplotControls({ settings, columns, onChange }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-5">
      <div className="text-sm font-semibold text-slate-800">
        Boxplot settings
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          Group column
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.groupColumn}
            onChange={(e) => onChange({ ...settings, groupColumn: e.target.value })}
          >
            {columns.map(column => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Value column
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.valueColumn}
            onChange={(e) => onChange({ ...settings, valueColumn: e.target.value })}
          >
            {columns.map(column => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Subgroup/color column
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.subgroupColumn}
            onChange={(e) => onChange({ ...settings, subgroupColumn: e.target.value })}
          >
            <option value="">None</option>
            {columns.map(column => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Label column
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.labelColumn}
            onChange={(e) => onChange({ ...settings, labelColumn: e.target.value })}
          >
            <option value="">None</option>
            {columns.map(column => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Orientation
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.orientation}
            onChange={(e) =>
              onChange({
                ...settings,
                orientation: e.target.value as BoxplotSettings["orientation"],
              })
            }
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
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
                palette: e.target.value as BoxplotSettings["palette"],
              })
            }
          >
            {BOXPLOT_PALETTE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Axis minimum
          <input
            type="number"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Auto"
            value={settings.yMin ?? ""}
            onChange={(e) =>
              onChange({
                ...settings,
                yMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="block text-sm">
          Axis maximum
          <input
            type="number"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Auto"
            value={settings.yMax ?? ""}
            onChange={(e) =>
              onChange({
                ...settings,
                yMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </label>

        <label className="block text-sm">
          Box width
          <input
            type="number"
            min="0.2"
            max="0.95"
            step="0.05"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.boxWidth}
            onChange={(e) => onChange({ ...settings, boxWidth: Number(e.target.value) })}
          />
        </label>

        <label className="block text-sm">
          Jitter amount
          <input
            type="number"
            min="0"
            max="0.6"
            step="0.05"
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.jitterAmount}
            onChange={(e) => onChange({ ...settings, jitterAmount: Number(e.target.value) })}
          />
        </label>

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

        <label className="block text-sm">
          Export width
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={settings.exportWidth}
            onChange={(e) =>
              onChange({
                ...settings,
                exportWidth: Number(e.target.value) as BoxplotSettings["exportWidth"],
              })
            }
          >
            <option value={1200}>1200 px</option>
            <option value={1800}>1800 px</option>
            <option value={2400}>2400 px</option>
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showJitter}
            onChange={(e) => onChange({ ...settings, showJitter: e.target.checked })}
          />
          Show jitter points
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showOutliers}
            onChange={(e) => onChange({ ...settings, showOutliers: e.target.checked })}
          />
          Show outliers
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showMean}
            onChange={(e) => onChange({ ...settings, showMean: e.target.checked })}
          />
          Show mean marker
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showMedianLine}
            onChange={(e) => onChange({ ...settings, showMedianLine: e.target.checked })}
          />
          Show median line
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showGrid}
            onChange={(e) => onChange({ ...settings, showGrid: e.target.checked })}
          />
          Show grid
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showLegend}
            onChange={(e) => onChange({ ...settings, showLegend: e.target.checked })}
          />
          Show legend
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.logScale}
            onChange={(e) => onChange({ ...settings, logScale: e.target.checked })}
          />
          Log scale
        </label>
      </div>

      <div className="text-xs text-slate-500">
        Long-format data works best: one row per observation, one grouping column, and one numeric value column.
      </div>
    </div>
  )
}