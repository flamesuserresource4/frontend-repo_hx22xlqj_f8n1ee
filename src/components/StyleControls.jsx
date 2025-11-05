import { Palette, Type, Square } from 'lucide-react'

export default function StyleControls({ options, setOptions }) {
  const update = (patch) => setOptions({ ...options, ...patch })

  return (
    <div className="w-full bg-white border rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Styling & Position</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Position</label>
          <select
            value={options.position}
            onChange={(e)=>update({ position: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          >
            <option value="bottom">Bottom</option>
            <option value="top">Top</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="center">Center</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Font size</label>
          <input
            type="number"
            value={options.fontSize}
            min={14}
            max={64}
            onChange={(e)=>update({ fontSize: parseInt(e.target.value||'28') })}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Text color</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={options.color}
              onChange={(e)=>update({ color: e.target.value })}
            />
            <input
              type="text"
              value={options.color}
              onChange={(e)=>update({ color: e.target.value })}
              className="flex-1 border rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Background opacity</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={options.bgOpacity}
            onChange={(e)=>update({ bgOpacity: parseFloat(e.target.value) })}
            className="w-full mt-2"
          />
          <div className="text-sm text-gray-500">{Math.round(options.bgOpacity*100)}%</div>
        </div>
      </div>
    </div>
  )
}
