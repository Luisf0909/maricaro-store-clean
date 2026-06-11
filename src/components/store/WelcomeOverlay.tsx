'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Music2, X } from 'lucide-react'

const AUDIO_SRC   = 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3'
const WAVE_DELAYS = [0, 0.2, 0.4, 0.15, 0.35]

/**
 * Botón flotante de música — sin pantalla de bienvenida.
 * El usuario entra directo al home. La música es 100% opcional.
 */
export function WelcomeOverlay() {
  const [expanded,   setExpanded]   = useState(false)
  const [playing,    setPlaying]    = useState(false)
  const [muted,      setMuted]      = useState(false)
  const [volume,     setVolume]     = useState(0.3)
  const [showVolume, setShowVolume] = useState(false)
  const [dismissed,  setDismissed]  = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.volume = muted ? 0 : volume
      audioRef.current.play().catch(() => setPlaying(false))
      setPlaying(true)
    }
  }, [playing, muted, volume])

  const handleExpand = () => {
    setExpanded(true)
    if (!playing) {
      audioRef.current!.volume = volume
      audioRef.current?.play().catch(() => {})
      setPlaying(true)
    }
  }

  if (dismissed) return null

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />

      <div
        className="fixed bottom-6 left-5 z-40"
        onMouseEnter={() => expanded && setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        {/* Volume slider */}
        {showVolume && expanded && (
          <div className="absolute bottom-full left-0 mb-2 bg-white/95 backdrop-blur-sm border border-rose-100 shadow-lg rounded-2xl px-3.5 py-3 w-44">
            <p className="text-[9px] text-rose-400 uppercase tracking-widest mb-2 font-medium">Volumen</p>
            <input
              type="range" min="0" max="1" step="0.05"
              value={muted ? 0 : volume}
              onChange={e => {
                const v = Number(e.target.value)
                setVolume(v)
                if (audioRef.current) audioRef.current.volume = v
                if (muted) setMuted(false)
              }}
              className="w-full h-0.5 accent-rose-400 cursor-pointer"
            />
          </div>
        )}

        {/* Collapsed: just a small music icon */}
        {!expanded ? (
          <button
            onClick={handleExpand}
            title="Activar música de adoración"
            className="group flex items-center gap-2 bg-white/80 backdrop-blur-md border border-rose-100 shadow-md hover:shadow-rose-100 rounded-full px-3 py-2 transition-all duration-300 hover:bg-rose-50"
          >
            <Music2 className="h-3.5 w-3.5 text-rose-400 group-hover:text-rose-500" />
            <span className="text-[11px] text-rose-400 font-medium group-hover:text-rose-500">
              Música de oración
            </span>
          </button>
        ) : (
          /* Expanded player */
          <div className="bg-white/90 backdrop-blur-md border border-rose-100 rounded-2xl px-3.5 py-2.5 shadow-lg shadow-rose-50 flex items-center gap-2.5">
            {/* Wave bars */}
            <div className="flex items-end gap-[2px] h-4 w-5 flex-shrink-0">
              {WAVE_DELAYS.map((delay, i) => (
                <span
                  key={i}
                  className="wave-bar flex-1 rounded-full bg-rose-300"
                  style={{
                    height: '100%',
                    animation: playing ? `wave-bar 1.2s ease-in-out infinite ${delay}s` : 'none',
                    transform: playing ? undefined : `scaleY(${0.25 + i * 0.12})`,
                    transition: 'transform 0.3s ease',
                    opacity: playing ? 1 : 0.4,
                  }}
                />
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gray-600 leading-tight">Adoración</p>
              <p className="text-[9px] text-gray-400">bensound.com</p>
            </div>

            <div className="flex items-center gap-0.5">
              <button onClick={togglePlay} className="p-1.5 rounded-full hover:bg-rose-50 transition-colors text-rose-500">
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => { setMuted(m => !m); if (audioRef.current) audioRef.current.volume = muted ? volume : 0 }}
                className="p-1.5 rounded-full hover:bg-rose-50 transition-colors text-rose-400"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => { audioRef.current?.pause(); setDismissed(true) }}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
