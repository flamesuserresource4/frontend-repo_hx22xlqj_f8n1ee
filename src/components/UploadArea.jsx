import { useCallback, useRef, useState } from 'react'
import { Upload, Film, FileAudio } from 'lucide-react'

export default function UploadArea({ onSelectFile, onTranscribe, disabled }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [localFile, setLocalFile] = useState(null)

  const handleFiles = useCallback(
    async (files) => {
      const file = files && files[0]
      if (!file) return
      setLocalFile(file)
      onSelectFile?.(file)
    },
    [onSelectFile]
  )

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 md:p-12 transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Upload className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Drag & drop your video</h3>
            <p className="text-gray-500">MP4, MOV, or any common format up to a few hundred MB</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              Choose file
            </button>
            {localFile && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md">
                <Film size={16} />
                <span className="font-medium truncate max-w-[240px]">{localFile.name}</span>
                <span className="text-gray-400">({(localFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-50"
            onClick={() => localFile && onTranscribe?.(localFile)}
            disabled={!localFile || disabled}
          >
            <FileAudio size={18} /> Auto-generate subtitles
          </button>
        </div>
      </div>
    </div>
  )
}
