"use client"
import { useEffect, useRef, useState, useCallback } from 'react'

type CatState = 'idle' | 'waving' | 'ticklish' | 'looking'

export default function ChibiCat({ size = 200 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState]           = useState<CatState>('idle')
  const [blink, setBlink]           = useState(false)
  const [eyeOffset, setEyeOffset]   = useState({ x: 0, y: 0 })
  const [bodyTilt, setBodyTilt]     = useState(0)
  const [armAngle, setArmAngle]     = useState(0)
  const [wiggle, setWiggle]         = useState(0)
  const stateRef                    = useRef<CatState>('idle')
  const waveTimerRef                = useRef<ReturnType<typeof setInterval> | null>(null)
  const wiggleTimerRef              = useRef<ReturnType<typeof setInterval> | null>(null)
  const blinkTimerRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimerRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Blink randomly
  useEffect(() => {
    function scheduleBlink() {
      blinkTimerRef.current = setInterval(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 150)
      }, 2500 + Math.random() * 2000)
    }
    scheduleBlink()
    return () => { if (blinkTimerRef.current) clearInterval(blinkTimerRef.current) }
  }, [])

  const returnToIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      setState('idle')
      stateRef.current = 'idle'
      setArmAngle(0)
      setWiggle(0)
    }, 2200)
  }, [])

  // Wave animation
  const startWave = useCallback(() => {
    if (stateRef.current === 'ticklish') return
    setState('waving')
    stateRef.current = 'waving'
    if (waveTimerRef.current) clearInterval(waveTimerRef.current)
    let t = 0
    waveTimerRef.current = setInterval(() => {
      t += 0.25
      setArmAngle(Math.sin(t * 3) * 35 - 20)
      if (t > 6) {
        clearInterval(waveTimerRef.current!)
        returnToIdle()
      }
    }, 40)
  }, [returnToIdle])

  // Ticklish animation
  const startTicklish = useCallback(() => {
    setState('ticklish')
    stateRef.current = 'ticklish'
    if (wiggleTimerRef.current) clearInterval(wiggleTimerRef.current)
    let t = 0
    wiggleTimerRef.current = setInterval(() => {
      t += 0.3
      setWiggle(Math.sin(t * 8) * 6)
      if (t > 5) {
        clearInterval(wiggleTimerRef.current!)
        returnToIdle()
      }
    }, 30)
  }, [returnToIdle])

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx   = rect.left + rect.width / 2
    const cy   = rect.top  + rect.height / 2
    const dx   = e.clientX - cx
    const dy   = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Eyes follow cursor (max ±4px)
    const maxEye = 4
    const norm   = Math.min(dist, 200) / 200
    setEyeOffset({ x: (dx / (dist || 1)) * maxEye * norm, y: (dy / (dist || 1)) * maxEye * norm })

    // Body tilts slightly toward cursor
    setBodyTilt(Math.max(-8, Math.min(8, dx / 40)))

    // Wave if cursor is close
    if (dist < 140 && stateRef.current === 'idle') {
      startWave()
    }
  }, [startWave])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const s = size
  const isTicklish = state === 'ticklish'
  const isWaving   = state === 'waving'
  const eyeH       = blink || isTicklish ? 1 : 7

  return (
    <div
      ref={containerRef}
      style={{ width: s, height: s, cursor: 'pointer', userSelect: 'none', position: 'relative' }}
      onClick={startWave}
      title="Click me!"
    >
      <svg
        width={s} height={s}
        viewBox="0 0 200 200"
        style={{
          transform: `rotate(${wiggle}deg) translateX(${bodyTilt * 0.5}px)`,
          transition: wiggle !== 0 ? 'none' : 'transform 0.3s ease',
          overflow: 'visible',
        }}
      >
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fff9f5" />
            <stop offset="100%" stopColor="#f0e8e0" />
          </radialGradient>
          <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb3c1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff8fa3" stopOpacity="0.4" />
          </radialGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* ── Shadow ── */}
        <ellipse cx="100" cy="192" rx="38" ry="6" fill="#d0c4bb" opacity="0.35" />

        {/* ── Tail ── */}
        <path
          d="M 128 158 Q 160 145 165 168 Q 170 185 148 182"
          fill="none" stroke="#e0d4cc" strokeWidth="9" strokeLinecap="round"
          style={{ animation: 'tailSwish 3s ease-in-out infinite' }}
        />

        {/* ── Body ── */}
        <ellipse
          cx="100" cy="148" rx="44" ry="40"
          fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="2"
          style={{
            animation: 'breathe 3s ease-in-out infinite',
            transformOrigin: '100px 148px',
          }}
        />

        {/* ── Belly patch ── */}
        <ellipse
          cx="100" cy="152" rx="26" ry="22"
          fill="#fff5f0" opacity="0.7"
          onMouseEnter={startTicklish}
        />

        {/* ── Left arm (waves when waving) ── */}
        <g
          style={{
            transform: isWaving
              ? `rotate(${armAngle}deg)`
              : 'rotate(0deg)',
            transformOrigin: '68px 138px',
            transition: isWaving ? 'none' : 'transform 0.4s ease',
          }}
        >
          <ellipse cx="62" cy="150" rx="13" ry="10" fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="1.5" transform="rotate(-20,62,150)" />
          {/* Paw dots */}
          <circle cx="56" cy="155" r="2" fill="#e8d8d0" />
          <circle cx="61" cy="158" r="2" fill="#e8d8d0" />
          <circle cx="66" cy="156" r="2" fill="#e8d8d0" />
        </g>

        {/* ── Right arm ── */}
        <ellipse cx="138" cy="150" rx="13" ry="10" fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="1.5" transform="rotate(20,138,150)" />
        <circle cx="132" cy="156" r="2" fill="#e8d8d0" />
        <circle cx="137" cy="159" r="2" fill="#e8d8d0" />
        <circle cx="142" cy="157" r="2" fill="#e8d8d0" />

        {/* ── Feet ── */}
        <ellipse cx="86" cy="186" rx="16" ry="9" fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="1.5" />
        <ellipse cx="114" cy="186" rx="16" ry="9" fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="1.5" />

        {/* ── Head ── */}
        <circle
          cx="100" cy="95" r="50"
          fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="2"
          style={{ transformOrigin: '100px 148px', transform: `rotate(${bodyTilt * 0.3}deg)` }}
        />

        {/* ── Ears ── */}
        <polygon points="62,60 54,36 78,52" fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="1.5" />
        <polygon points="64,58 57,40 76,53" fill="#f5b8c4" opacity="0.6" />
        <polygon points="138,60 146,36 122,52" fill="url(#bodyGrad)" stroke="#ddd0c8" strokeWidth="1.5" />
        <polygon points="136,58 143,40 124,53" fill="#f5b8c4" opacity="0.6" />

        {/* ── Cheeks ── */}
        <ellipse cx="74" cy="102" rx="13" ry="9" fill="url(#cheekGrad)" filter="url(#soft)" />
        <ellipse cx="126" cy="102" rx="13" ry="9" fill="url(#cheekGrad)" filter="url(#soft)" />

        {/* ── Eyes ── */}
        {/* Left eye */}
        <g transform={`translate(${83 + eyeOffset.x}, ${90 + eyeOffset.y})`}>
          <ellipse cx="0" cy="0" rx="7" ry={eyeH} fill="#3a2e2e" />
          {!blink && !isTicklish && <circle cx="2.5" cy="-2.5" r="2.5" fill="white" />}
        </g>
        {/* Right eye */}
        <g transform={`translate(${117 + eyeOffset.x}, ${90 + eyeOffset.y})`}>
          <ellipse cx="0" cy="0" rx="7" ry={eyeH} fill="#3a2e2e" />
          {!blink && !isTicklish && <circle cx="2.5" cy="-2.5" r="2.5" fill="white" />}
        </g>

        {/* ── Nose ── */}
        <ellipse cx="100" cy="102" rx="3.5" ry="2.5" fill="#c4808a" />

        {/* ── Mouth ── */}
        {isTicklish ? (
          // Laughing mouth
          <path d="M 91 109 Q 100 118 109 109" fill="#c4808a" stroke="#c4808a" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          // Normal tiny smile
          <path d="M 93 108 Q 100 113 107 108" fill="none" stroke="#c4808a" strokeWidth="1.5" strokeLinecap="round" />
        )}

        {/* ── Ticklish sweat drop ── */}
        {isTicklish && (
          <g opacity="0.8">
            <path d="M 148 72 Q 151 65 154 72" fill="#a8d8ea" stroke="none" />
            <ellipse cx="151" cy="74" rx="4" ry="5" fill="#a8d8ea" />
          </g>
        )}

        {/* ── Waving sparkles ── */}
        {isWaving && (
          <>
            <text x="42" y="80" fontSize="14" style={{ animation: 'sparkle 0.6s ease-in-out infinite alternate' }}>✨</text>
            <text x="148" y="68" fontSize="10" style={{ animation: 'sparkle 0.4s ease-in-out infinite alternate' }}>⭐</text>
          </>
        )}
      </svg>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.025); }
        }
        @keyframes tailSwish {
          0%, 100% { d: path('M 128 158 Q 160 145 165 168 Q 170 185 148 182'); }
          50%       { d: path('M 128 158 Q 155 155 162 175 Q 165 190 144 186'); }
        }
        @keyframes sparkle {
          from { opacity: 0.5; transform: scale(0.85) rotate(-10deg); }
          to   { opacity: 1;   transform: scale(1.1)  rotate(10deg); }
        }
      `}</style>
    </div>
  )
}
