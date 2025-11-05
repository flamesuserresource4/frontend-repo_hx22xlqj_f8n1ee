import { useMemo } from 'react'
import { Plus, Trash2, Upload as UploadIcon, Download } from 'lucide-react'

function secondsToTimestamp(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const ms = Math.floor((sec - Math.floor(sec)) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

export default function SubtitleEditor({ subtitles, setSubtitles, onImportSRT, onExportSRT }) {
  const sorted = useMemo(() => [...subtitles].sort((a,b)=>a.start-b.start), [subtitles])

  const updateField = (id, field, value) => {
    setSubtitles(subtitles.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const addRow = () => {
    const lastEnd = sorted.length ? sorted[sorted.length-1].end : 0
    const id = Math.random().toString(36).slice(2)
    setSubtitles([...sorted, { id, start: lastEnd, end: lastEnd + 2, text: 'Type subtitle...' }])
  }

  const removeRow = (id) => {
    setSubtitles(subtitles.filter(s => s.id !== id))
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Subtitles</h3>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 cursor-pointer">
            <UploadIcon size={16} />
            Import SRT/VTT
            <input
              type="file"
              accept=".srt,.vtt,text/vtt"
              className="hidden"
              onChange={(e) => onImportSRT?.(e.target.files?.[0])}
            />
          </label>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50"
            onClick={onExportSRT}
          >
            <Download size={16} /> Export SRT
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={addRow}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="max-h-72 overflow-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2 w-36">Start</th>
              <th className="text-left px-3 py-2 w-36">End</th>
              <th className="text-left px-3 py-2">Text</th>
              <th className="px-3 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={s.start}
                    onChange={(e)=>updateField(s.id, 'start', parseFloat(e.target.value||'0'))}
                    className="w-full border rounded px-2 py-1"
                  />
                  <div className="text-[10px] text-gray-400">{secondsToTimestamp(s.start)}</div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={s.end}
                    onChange={(e)=>updateField(s.id, 'end', parseFloat(e.target.value||'0'))}
                    className="w-full border rounded px-2 py-1"
                  />
                  <div className="text-[10px] text-gray-400">{secondsToTimestamp(s.end)}</div>
                </td>
                <td className="px-3 py-2">
                  <textarea
                    value={s.text}
                    onChange={(e)=>updateField(s.id, 'text', e.target.value)}
                    className="w-full border rounded px-2 py-1 min-h-[42px]"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="p-1.5 rounded-md hover:bg-red-50 text-red-600" onClick={()=>removeRow(s.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-400">No subtitles yet. Generate or import to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
