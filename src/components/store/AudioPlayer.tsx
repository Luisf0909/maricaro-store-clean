'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Music2, X } from 'lucide-react'

// Royalty-free piano worship music (Bensound - Relaxing, free with attribution)
// Replace AUDIO_SRC with your own audio file URL if desired
const AUDIO_SRC = 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3'

const WAVE_DELAYS = ['0s', '0.2s', '0.4s', '0.15s', '0.35s']

export function AudioPlayer() {
  const [activated, setActivated] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [muted, setMuted] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = muted ? 0 : volume
  }, [volume, muted])

  const activate = useCallback(() => {
    setActivated(true)
    setPlaying(true)
    audioRef.current?.play().catch(() => {
      setPlaying(false)
    })
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => setPlaying(false))
      setPlaying(true)
    }
  }, [playing])

  const toggleMute = useCallback(() => setMuted((m) => !m), [])

  if (dismissed) return null

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />

      {!activated ? (
        /* ── Welcome button ── */
        <div className="relative group">
          <button
            onClick={activate}
            className="flex items-center gap-2.5 glass gold-border rounded-full pl-3.5 pr-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Pulsing music icon */}
            <span className="relative flex h-6 w-6 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gold-400/30 animate-pulse-glow" />
              <Music2 className="relative h-3.5 w-3.5 text-gold-600" />
            </span>
            <span className="text-xs font-medium text-warm-800 tracking-wide whitespace-nowrap">
              Activar ambiente de oración
            </span>
          </button>
          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-warm-200 hover:bg-warm-300 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Cerrar"
          >
            <X className="h-2.5 w-2.5 text-warm-600" />
          </button>
        </div>
      ) : (
        /* ── Active mini-player ── */
        <div
          className="relative glass gold-border rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-3"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          {/* Volume popup */}
          {showVolume && (
            <div className="absolute bottom-full left-0 mb-2 glass gold-border rounded-xl px-3 py-2.5 w-full shadow-lg">
              <p className="text-[9px] text-warm-500 uppercase tracking-widest mb-1.5">Volumen</p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value))
                  if (muted) setMuted(false)
                }}
                className="w-full h-0.5 accent-gold-600 cursor-pointer"
              />
            </div>
          )}

          {/* Sound wave bars */}
          <div className="flex items-end gap-[2px] h-5 w-5 flex-shrink-0">
            {WAVE_DELAYS.map((delay, i) => (
              <span
                key={i}
                className="wave-bar flex-1 rounded-full bg-gold-500"
                style={{
                  height: '100%',
                  animation: playing
                    ? `wave-bar 1.2s ease-in-out infinite ${delay}`
                    : 'none',
                  transform: playing ? undefined : `scaleY(${0.25 + i * 0.12})`,
                  transition: 'transform 0.3s ease',
                  opacity: playing ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-warm-800 leading-tight truncate">
              Música de adoración
            </p>
            <p className="text-[9px] text-warm-400 leading-tight">bensound.com</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full hover:bg-warm-100 transition-colors text-warm-700"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing
                ? <Pause className="h-3.5 w-3.5" />
                : <Play  className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-warm-100 transition-colors text-warm-700"
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            >
              {muted
                ? <VolumeX className="h-3.5 w-3.5" />
                : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-full hover:bg-warm-100 transition-colors text-warm-400"
              aria-label="Cerrar"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
