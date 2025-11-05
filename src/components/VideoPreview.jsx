import { useEffect, useMemo, useRef, useState } from 'react'

function formatTime(t) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPreview({ fileUrl, subtitles, styleOptions }) {
  const videoRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentSubtitle = useMemo(() => {
    if (!subtitles || subtitles.length === 0) return null
    return subtitles.find((s) => currentTime >= s.start && currentTime <= s.end) || null
  }, [currentTime, subtitles])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setCurrentTime(v.currentTime)
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setIsPlaying(true)
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }

  const posClass = {
    bottom: 'bottom-8 left-1/2 -translate-x-1/2',
    top: 'top-8 left-1/2 -translate-x-1/2',
    left: 'left-8 top-1/2 -translate-y-1/2 text-left',
    right: 'right-8 top-1/2 -translate-y-1/2 text-right',
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center',
  }[styleOptions.position || 'bottom']

  const fontSize = `${styleOptions.fontSize || 28}px`
  const bgOpacity = styleOptions.bgOpacity ?? 0.4
  const color = styleOptions.color || '#FFFFFF'

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
        {fileUrl ? (
          <video ref={videoRef} src={fileUrl} className="w-full h-full" controls />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No video selected</div>
        )}
        {currentSubtitle && (
          <div
            className={`absolute ${posClass} max-w-[90%] px-4 py-2 rounded-md text-white drop-shadow-lg transition-opacity`}
            style={{
              color,
              fontSize,
              backgroundColor: `rgba(0,0,0,${bgOpacity})`,
              lineHeight: 1.35,
            }}
          >
            {currentSubtitle.text}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
        <div>Time: {formatTime(currentTime)}</div>
        <button
          className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50"
          onClick={togglePlay}
          disabled={!fileUrl}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  )
}
