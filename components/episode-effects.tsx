'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Star } from 'lucide-react'
import { birthday } from '@/lib/birthday-content'

export function useEpisodeAudio(onError: (message: string) => void) {
  const [playing, setPlaying] = useState(false)
  const context = useRef<AudioContext | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const voices = useRef<OscillatorNode[]>([])

  function stop() {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    audio.current?.pause()
    voices.current.forEach(voice => { try { voice.stop() } catch {} })
    voices.current = []
    if (context.current) void context.current.close().catch(() => {})
    context.current = null
    setPlaying(false)
  }

  async function toggle() {
    if (playing) { stop(); return }
    try {
      if (birthday.musicUrl) {
        const player = new Audio(birthday.musicUrl)
        audio.current = player
        player.loop = true
        player.volume = 0.3
        player.addEventListener('error', () => { stop(); onError('The soundtrack couldn’t load. Your episode continues without it.') }, { once: true })
        await player.play()
      } else {
        const ctx = new AudioContext()
        context.current = ctx
        await ctx.resume()
        const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 880, 783.99, 659.25, 523.25, 587.33, 659.25, 523.25, 440, 392, 440]
        let index = 0
        const playNote = () => {
          if (ctx.state !== 'running') return
          const oscillator = ctx.createOscillator()
          const gain = ctx.createGain()
          oscillator.type = 'sine'
          oscillator.frequency.value = notes[index++ % notes.length]
          gain.gain.setValueAtTime(0, ctx.currentTime)
          gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.03)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8)
          oscillator.connect(gain)
          gain.connect(ctx.destination)
          voices.current.push(oscillator)
          oscillator.onended = () => {
            oscillator.disconnect(); gain.disconnect()
            voices.current = voices.current.filter(voice => voice !== oscillator)
          }
          oscillator.start()
          oscillator.stop(ctx.currentTime + 2)
        }
        playNote()
        timer.current = setInterval(playNote, 650)
      }
      setPlaying(true)
    } catch {
      stop()
      onError('Audio isn’t available in this browser. All the birthday magic still works without it.')
    }
  }

  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) stop() }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      if (timer.current) clearInterval(timer.current)
      audio.current?.pause()
      if (context.current) void context.current.close().catch(() => {})
    }
  }, [])

  return { playing, toggle, stop }
}

export function Petals() {
  return <div className="petals" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => (
    <span key={index} style={{ '--i': index, left: `${(index * 19 + 7) % 100}%`, animationDelay: `${-index * 2.7}s`, animationDuration: `${14 + index % 5 * 3}s` } as CSSProperties} />
  ))}</div>
}

export function Celebration() {
  return <div className="celebration" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => (
    <Star key={index} style={{ left: `${index * 4.3}%`, '--drift': `${(index % 2 ? 1 : -1) * 100}px`, animationDelay: `${index % 6 * .13}s` } as CSSProperties} />
  ))}</div>
}

export function Typewriter({ text, reduced }: { text: string; reduced: boolean }) {
  const [length, setLength] = useState(0)
  useEffect(() => {
    if (reduced) return
    setLength(0)
    const timer = setInterval(() => setLength(value => {
      if (value >= text.length) clearInterval(timer)
      return Math.min(value + 1, text.length)
    }), 38)
    return () => clearInterval(timer)
  }, [text, reduced])
  return <span className="typewriter"><span className="sr-only">{text}</span><span aria-hidden="true">{reduced ? text : text.slice(0, length)}<span className="typing-cursor">|</span></span></span>
}
