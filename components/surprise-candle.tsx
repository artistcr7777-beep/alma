'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Flower2, Gift, Heart, Moon, Sparkles, Wind } from 'lucide-react'
import { Petals } from './episode-effects'

type Stage = 'intro' | 'countdown' | 'blown' | 'redirecting'

export function SurpriseCandle() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intro')
  const [countdown, setCountdown] = useState(5)
  const [reduced, setReduced] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fallbackRedirectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(media.matches)
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  // Web Audio synth for ambient sound effects
  function getAudioContext(): AudioContext | null {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioContextClass()
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume()
      }
      return audioCtxRef.current
    } catch {
      return null
    }
  }

  function playSound(type: 'reveal' | 'tick' | 'blow' | 'celebrate') {
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      if (type === 'reveal') {
        // Magical harp-like arpeggio (C5, E5, G5, B5, C6)
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.5]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08)

          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08)
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.08 + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.8)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(ctx.currentTime + idx * 0.08)
          osc.stop(ctx.currentTime + idx * 0.08 + 0.85)
        })
      } else if (type === 'tick') {
        // Crisp chime pulse on each countdown second
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      } else if (type === 'blow') {
        // Soft breath wind whoosh
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(280, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.4)
        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.5)
      } else if (type === 'celebrate') {
        // Bright celebratory chord
        const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51]
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04)
          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.04)
          gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + idx * 0.04 + 0.03)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 1.2)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + idx * 0.04)
          osc.stop(ctx.currentTime + idx * 0.04 + 1.3)
        })
      }
    } catch {
      // Audio context error ignore
    }
  }

  const blowOutCandle = useCallback(() => {
    if (stage === 'blown' || stage === 'redirecting') return
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    playSound('blow')
    setTimeout(() => playSound('celebrate'), 220)

    setStage('blown')

    // Automatically redirect after celebrating the blown candle
    redirectTimerRef.current = setTimeout(() => {
      setStage('redirecting')
      router.push('/birthday')

      // Fallback redirect if router transition takes time
      fallbackRedirectRef.current = setTimeout(() => {
        window.location.href = '/birthday'
      }, 1500)
    }, 2200)
  }, [stage, router])

  function startReveal() {
    playSound('reveal')
    setStage('countdown')
    setCountdown(5)
  }

  // Handle the countdown timer 5 -> 4 -> 3 -> 2 -> 1 -> blow
  useEffect(() => {
    if (stage !== 'countdown') return

    playSound('tick')
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        playSound('tick')
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [stage])

  // React to countdown reaching 0
  useEffect(() => {
    if (stage === 'countdown' && countdown === 0) {
      blowOutCandle()
    }
  }, [stage, countdown, blowOutCandle])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
      if (fallbackRedirectRef.current) clearTimeout(fallbackRedirectRef.current)
    }
  }, [])

  function skipDirectly() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    if (fallbackRedirectRef.current) clearTimeout(fallbackRedirectRef.current)
    router.push('/birthday')
  }

  return (
    <div className={`surprise-page ${reduced ? 'reduce-motion' : ''}`}>
      {/* Background Ambience */}
      <div className="scene-background" aria-hidden="true" />
      <div className="scene-wash" aria-hidden="true" />
      <Petals />

      {/* Floating Sparkles & Stars */}
      <div className="ambient-stars" aria-hidden="true">
        <span className="star-dot dot-1" />
        <span className="star-dot dot-2" />
        <span className="star-dot dot-3" />
        <span className="star-dot dot-4" />
        <span className="star-dot dot-5" />
        <span className="star-dot dot-6" />
      </div>

      {/* Header */}
      <header className="site-header surprise-header">
        <div className="brand" aria-label="Alma's 19th birthday">
          <span className="brand-flower">
            <Flower2 aria-hidden="true" />
          </span>
          <span>
            alma <strong>19</strong>
            <span className="brand-dot">.</span>
          </span>
          <span className="brand-divider" />
          <span className="brand-subtitle">PROLOGUE · SURPRISE</span>
        </div>

        <button
          onClick={skipDirectly}
          className="skip-btn"
          aria-label="Skip directly to birthday website"
        >
          <span>Skip to birthday page</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </header>

      {/* Main Container */}
      <main className="surprise-main">
        {/* State 1: Intro / Click to reveal surprise */}
        {stage === 'intro' && (
          <div className="surprise-card surprise-intro-box">
            <div className="prologue-tag">
              <span className="live-dot" />
              <span>「 A SPECIAL DELIVERY FOR ALMA 」</span>
              <Moon size={13} aria-hidden="true" className="prologue-moon" />
            </div>

            <div className="gift-container" aria-hidden="true">
              <div className="gift-halo" />
              <div className="gift-box">
                <Gift className="gift-icon" size={68} strokeWidth={1.2} />
                <Sparkles className="gift-sparkle sparkle-top" size={24} />
                <Sparkles className="gift-sparkle sparkle-bottom" size={18} />
              </div>
            </div>

            <h1 className="surprise-title">
              A Birthday Surprise <em>Awaits</em>
            </h1>
            <p className="surprise-description">
              Before entering your birthday episode, there is something special waiting for you.
              Take a moment and unlock what&apos;s inside... 🌙🖤
            </p>

            <button
              className="primary-button reveal-button"
              onClick={startReveal}
              autoFocus
            >
              <Sparkles size={18} aria-hidden="true" />
              <span>Click to reveal surprise</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>

            <span className="surprise-hint">
              Tap the button to reveal your birthday candle ✨
            </span>
          </div>
        )}

        {/* State 2 & 3: Candle with Countdown & Extinguish */}
        {(stage === 'countdown' || stage === 'blown' || stage === 'redirecting') && (
          <div className="surprise-card candle-stage-box">
            {/* Countdown Banner / Exact User Message Requirement */}
            <div className="countdown-container" aria-live="polite">
              {stage === 'countdown' ? (
                <>
                  <div className="countdown-eyebrow">
                    <Sparkles size={14} aria-hidden="true" />
                    <span>MAKE A WISH 🖤</span>
                    <Sparkles size={14} aria-hidden="true" />
                  </div>
                  <h2 className="countdown-banner">
                    Blow the candle in{' '}
                    <span className="countdown-digits-sequence">
                      {[5, 4, 3, 2, 1].map((num) => (
                        <span
                          key={num}
                          className={`digit-pill ${
                            num === countdown
                              ? 'active-digit'
                              : num > countdown
                              ? 'passed-digit'
                              : 'upcoming-digit'
                          }`}
                        >
                          {num}
                        </span>
                      ))}
                    </span>
                  </h2>
                  <div className="huge-countdown-number" key={countdown}>
                    {countdown}
                  </div>
                </>
              ) : (
                <div className="wish-granted-banner">
                  <div className="countdown-eyebrow">
                    <Heart size={14} fill="#c084d8" aria-hidden="true" />
                    <span>WISH GRANTED! 🌙</span>
                    <Heart size={14} fill="#c084d8" aria-hidden="true" />
                  </div>
                  <h2 className="wish-title">
                    Happy 19th Birthday, <em>Alma!</em> 🎉
                  </h2>
                  <p className="redirect-notice">
                    {stage === 'redirecting' ? (
                      <>
                        Opening your birthday episode...{' '}
                        <span className="inline-loader" />
                      </>
                    ) : (
                      <>Redirecting to your birthday website in a moment ✨</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Candle Scene Component */}
            <div
              className={`candle-scene ${stage === 'blown' || stage === 'redirecting' ? 'candle-blown' : 'candle-lit'}`}
              onClick={blowOutCandle}
              title={stage === 'countdown' ? 'Click candle to blow out early!' : undefined}
              role={stage === 'countdown' ? 'button' : undefined}
              tabIndex={stage === 'countdown' ? 0 : undefined}
              onKeyDown={(e) => {
                if (stage === 'countdown' && (e.key === 'Enter' || e.key === ' ')) {
                  blowOutCandle()
                }
              }}
            >
              {/* Wind effect on blow */}
              {stage !== 'countdown' && (
                <div className="wind-gust" aria-hidden="true">
                  <Wind className="wind-icon wind-1" />
                  <Wind className="wind-icon wind-2" />
                  <span className="wind-line line-1" />
                  <span className="wind-line line-2" />
                </div>
              )}

              {/* Smoke when flame goes out */}
              {stage !== 'countdown' && (
                <div className="smoke-container" aria-hidden="true">
                  <span className="smoke-particle smoke-1" />
                  <span className="smoke-particle smoke-2" />
                  <span className="smoke-particle smoke-3" />
                  <span className="smoke-particle smoke-4" />
                </div>
              )}

              {/* Confetti & Sparkles on Blow Out */}
              {stage !== 'countdown' && (
                <div className="candle-confetti" aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <span
                      key={i}
                      className="confetti-piece"
                      style={{
                        ['--tx' as string]: `${(i % 2 === 0 ? 1 : -1) * (30 + ((i * 19) % 180))}px`,
                        ['--ty' as string]: `${-60 - ((i * 29) % 220)}px`,
                        ['--rot' as string]: `${i * 45}deg`,
                        ['--delay' as string]: `${(i * 0.05).toFixed(2)}s`,
                        ['--color' as string]:
                          i % 3 === 0 ? '#d4a5e8' : i % 3 === 1 ? '#9b59b6' : '#ffd166',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* The Candle Graphics */}
              <div className="candle-body-wrapper">
                {/* Flame Aura Glow (only visible when lit) */}
                <div className="flame-halo" aria-hidden="true" />

                {/* Animated Flame */}
                <div className="flame-element" aria-hidden="true">
                  <div className="flame-outer" />
                  <div className="flame-inner" />
                  <div className="flame-core" />
                  <div className="flame-spark spark-1" />
                  <div className="flame-spark spark-2" />
                </div>

                {/* Wick */}
                <div className="candle-wick">
                  <span className="wick-ember" />
                </div>

                {/* Candle Stick */}
                <div className="candle-stick">
                  <div className="wax-drips">
                    <span className="drip drip-1" />
                    <span className="drip drip-2" />
                    <span className="drip drip-3" />
                  </div>
                  <div className="candle-stripes">
                    <span className="stripe" />
                    <span className="stripe" />
                  </div>
                  <div className="candle-number-badge">19</div>
                </div>

                {/* Candle Stand / Mini Birthday Cake Base */}
                <div className="cake-stand">
                  <div className="stand-plate" />
                  <div className="stand-rim" />
                  <div className="stand-pedestal" />
                </div>
              </div>

              {/* Helper prompt below candle */}
              {stage === 'countdown' && (
                <p className="candle-blow-hint">
                  <Wind size={15} aria-hidden="true" />
                  <span>Get ready to blow... (or click the flame!)</span>
                </p>
              )}
            </div>

            {/* Direct Redirect fallback button if redirect takes a moment */}
            {stage !== 'countdown' && (
              <div className="redirect-controls">
                <button
                  className="primary-button proceed-button"
                  onClick={() => router.push('/birthday')}
                >
                  <span>Enter Birthday Episode</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="surprise-footer">
        <span>Made with 🖤 for Alma&apos;s 19th Birthday</span>
        <span>特別編 · PROLOGUE SURPRISE</span>
      </footer>
    </div>
  )
}
