import { useMemo, useState } from 'react'
import UploadArea from './components/UploadArea'
import VideoPreview from './components/VideoPreview'
import SubtitleEditor from './components/SubtitleEditor'
import StyleControls from './components/StyleControls'

const API_BASE = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':8000') : '')

function parseSRT(srt) {
  const entries = []
  const parts = srt.replace(/\r/g, '').split(/\n\n+/)
  for (const block of parts) {
    const lines = block.trim().split('\n')
    if (lines.length >= 2) {
      const timeLine = lines[0].match(/-->/) ? lines[0] : lines[1]
      const textLines = lines[0].match(/-->/) ? lines.slice(1) : lines.slice(2)
      const [start, end] = timeLine.split('-->').map((t) => t.trim())
      const toSec = (ts) => {
        const [h, m, rest] = ts.split(':')
        const [s, ms] = rest.split(',')
        return parseInt(h)*3600 + parseInt(m)*60 + parseInt(s) + (parseInt(ms)||0)/1000
      }
      const id = Math.random().toString(36).slice(2)
      entries.push({ id, start: toSec(start), end: toSec(end), text: textLines.join('\n') })
    }
  }
  return entries.sort((a,b)=>a.start-b.start)
}

function toSRT(subs) {
  const ts = (t) => {
    const h = Math.floor(t / 3600)
    const m = Math.floor((t % 3600) / 60)
    const s = Math.floor(t % 60)
    const ms = Math.floor((t - Math.floor(t)) * 1000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`
  }
  return subs
    .sort((a,b)=>a.start-b.start)
    .map((s, i) => `${i+1}\n${ts(s.start)} --> ${ts(s.end)}\n${s.text}`)
    .join('\n\n')
}

export default function App() {
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState(0)
  const [subtitles, setSubtitles] = useState([])
  const [styleOptions, setStyleOptions] = useState({ position: 'bottom', color: '#FFFFFF', fontSize: 28, bgOpacity: 0.4 })
  const [processing, setProcessing] = useState(false)
  const [processedUrl, setProcessedUrl] = useState('')
  const [message, setMessage] = useState('')

  const hasSubs = subtitles && subtitles.length > 0

  const onSelectFile = (file) => {
    setVideoFile(file)
    setProcessedUrl('')
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setMessage('')
  }

  const onTranscribe = async (file) => {
    try {
      setProcessing(true)
      setMessage('Generating subtitles...')
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_BASE}/api/transcribe`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Transcription failed')
      const data = await res.json()
      setSubtitles(parseSRT(data.srt || ''))
      setDuration(data.duration || 0)
      setMessage('Subtitles generated. Review and edit as needed.')
    } catch (e) {
      console.error(e)
      setMessage('Failed to transcribe. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const onImportSRT = async (file) => {
    if (!file) return
    const text = await file.text()
    setSubtitles(parseSRT(text))
  }

  const onExportSRT = () => {
    const srt = toSRT(subtitles)
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitles.srt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onBurn = async () => {
    if (!videoFile || !hasSubs) return
    try {
      setProcessing(true)
      setMessage('Burning subtitles into video...')
      const fd = new FormData()
      fd.append('file', videoFile)
      fd.append('srt', toSRT(subtitles))
      fd.append('position', styleOptions.position)
      fd.append('color', styleOptions.color)
      fd.append('font_size', String(styleOptions.fontSize))
      fd.append('bg_opacity', String(styleOptions.bgOpacity))
      const res = await fetch(`${API_BASE}/api/burn`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Burn failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setProcessedUrl(url)
      setMessage('Done! Your video is ready below.')
    } catch (e) {
      console.error(e)
      setMessage('Failed to burn subtitles. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Hinglish Subtitler</h1>
          <div className="text-sm text-gray-500">Upload → Generate → Edit → Burn-in → Download</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadArea onSelectFile={onSelectFile} onTranscribe={onTranscribe} disabled={processing} />
          <VideoPreview fileUrl={processedUrl || videoUrl} subtitles={subtitles} styleOptions={styleOptions} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SubtitleEditor
              subtitles={subtitles}
              setSubtitles={setSubtitles}
              onImportSRT={onImportSRT}
              onExportSRT={onExportSRT}
            />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <StyleControls options={styleOptions} setOptions={setStyleOptions} />
            <div className="bg-white border rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Actions</h3>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-50"
                  onClick={onBurn}
                  disabled={!videoFile || !hasSubs || processing}
                >
                  Burn subtitles into video
                </button>
                {processedUrl && (
                  <a
                    href={processedUrl}
                    download="subtitled.mp4"
                    className="w-full text-center px-4 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    Download processed video
                  </a>
                )}
              </div>
            </div>
            {message && (
              <div className={`rounded-xl p-3 text-sm ${processing ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {message}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-gray-500">
        Built for smooth subtitle creation in Hinglish.
      </footer>
    </div>
  )
}
