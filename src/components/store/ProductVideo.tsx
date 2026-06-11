'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Instagram } from 'lucide-react'
import { isInstagramUrl, getInstagramPostId } from '@/lib/instagram'

interface Props {
  videoUrl: string
  posterUrl?: string
  productName: string
}

export function ProductVideo({ videoUrl, posterUrl, productName }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const [playing,  setPlaying]  = useState(false)
  const [muted,    setMuted]    = useState(true)
  const [, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  const isInstagram = isInstagramUrl(videoUrl)
  const instagramId = isInstagram ? getInstagramPostId(videoUrl) : null

  function togglePlay() {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else         { videoRef.current.play();  setPlaying(true) }
  }

  function toggleMute() {
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(m => !m)
  }

  function fullscreen() {
    videoRef.current?.requestFullscreen?.()
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => setProgress(v.currentTime / (v.duration || 1) * 100)
    const onEnd  = () => setPlaying(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('ended', onEnd) }
  }, [])

  // Mostrar embed de Instagram
  if (isInstagram && instagramId) {
    return (
      <div className="rounded-3xl overflow-hidden bg-white shadow-xl shadow-black/10">
        <div className="flex items-center justify-center bg-gradient-to-br from-rose-50 to-violet-50 p-6 min-h-96">
          <div className="w-full max-w-sm">
            <div className="mb-4 flex items-center justify-center">
              <Instagram className="h-6 w-6 text-rose-500" />
            </div>
            <iframe
              src={`https://www.instagram.com/p/${instagramId}/embed/captioned`}
              width="100%"
              height="auto"
              frameBorder="0"
              scrolling="no"
              allowTransparency={true}
              className="rounded-2xl"
              title={`Instagram post de ${productName}`}
            />
          </div>
        </div>
      </div>
    )
  }

  // Mostrar video nativo
  return (
    <div className="rounded-3xl overflow-hidden bg-gray-900 shadow-xl shadow-black/10 relative group">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        muted={muted}
        playsInline
        preload="metadata"
        onLoadedMetadata={() => setLoaded(true)}
        className="w-full aspect-video object-cover"
        aria-label={`Video de ${productName}`}
      />

      {/* Controls overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/50 via-transparent to-transparent">
        {/* Top: label */}
        <div>
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider rounded-full px-3 py-1">
            📹 Video del producto
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-all"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              {muted && (
                <span className="text-white/70 text-[10px]">Clic para activar sonido</span>
              )}
            </div>
            <button
              onClick={fullscreen}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-all"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Play button overlay when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="h-7 w-7 text-rose-500 ml-0.5" />
          </div>
        </button>
      )}
    </div>
  )
}
