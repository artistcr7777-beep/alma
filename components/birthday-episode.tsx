'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Flower2, Heart, Moon, Music2, Pause, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { chapters, number } from '@/lib/birthday-content'
import { EpisodeChapter, emptyEpisode, type EpisodeState } from './episode-chapters'
import { Petals, useEpisodeAudio } from './episode-effects'

export function BirthdayEpisode() {
  const [chapter, setChapter] = useState(0)
  const [state, setState] = useState<EpisodeState>(emptyEpisode)
  const [reduced, setReduced] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [notice, setNotice] = useState('')
  const [moonClicks, setMoonClicks] = useState(0)
  const [ready, setReady] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const previousScene = useRef({ chapter: 0, replayKey: 0 })
  const audio = useEpisodeAudio(setNotice)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(media.matches)
    setReady(true)
    const change = () => setReduced(media.matches)
    const visibility = () => setHidden(document.hidden)
    media.addEventListener('change', change)
    document.addEventListener('visibilitychange', visibility)
    return () => { media.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility) }
  }, [])

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotice('')
        setState(previous => ({ ...previous, cards: [], capsule: null, wish: null, route: null }))
      }
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [])

  useEffect(() => {
    if (previousScene.current.chapter === chapter && previousScene.current.replayKey === replayKey) return
    previousScene.current = { chapter, replayKey }
    document.getElementById('chapter-title')?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [chapter, replayKey])

  function goTo(next: number) {
    setChapter(next)
    setNotice('')
  }

  function replay() {
    audio.stop()
    setState(emptyEpisode)
    setMoonClicks(0)
    setNotice('')
    setChapter(0)
    setReplayKey(key => key + 1)
  }

  function discoverMoon() {
    const count = moonClicks + 1
    setMoonClicks(count)
    if (count >= 3) { setNotice('You found the little moon 🌙'); setMoonClicks(0) }
  }

  const scenic = chapter === 0 || chapter === 1 || chapter === 8

  return <div className={`birthday-app ${reduced ? 'reduce-motion' : ''} ${hidden ? 'page-hidden' : ''}`} data-ready={ready}>
    <a className="skip-link" href="#episode-main">Skip to the episode</a>
    <header className="site-header">
      <a className="brand" href="#episode-main" aria-label="Alma's 19th birthday"><span className="brand-flower"><Flower2 aria-hidden="true" /></span><span>alma <strong>19</strong><span className="brand-dot">.</span></span><span className="brand-divider" /><span className="brand-subtitle">BIRTHDAY SPECIAL</span></a>
      <div className="header-controls">
        <a href="/" className="setting-button surprise-header-btn" title="Candle Surprise Prologue">
          <Sparkles aria-hidden="true" />
          <span>Surprise 🕯️</span>
        </a>
        <span className="controls-divider" />
        <button className="setting-button" aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
          {reduced ? <Check aria-hidden="true" /> : <Pause aria-hidden="true" />}
          <span>Reduce motion</span>
          <span className={`mini-switch ${reduced ? 'on' : ''}`} aria-hidden="true" />
        </button>
        <span className="controls-divider" />
        <button className={`setting-button music-button ${audio.playing ? 'music-on' : ''}`} aria-pressed={audio.playing} onClick={audio.toggle}>
          {audio.playing ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
          <span>Music {audio.playing ? 'on' : 'off'}</span>
        </button>
      </div>
    </header>

    <main id="episode-main" className={`episode-main ${scenic ? 'scenic' : 'paper-scene'} chapter-${chapter}`} tabIndex={-1}>
      <div className="scene-background" aria-hidden="true" /><div className="scene-wash" aria-hidden="true" /><Petals />
      <div className="scene-topline"><span><span className="live-dot" /> ALMA&apos;S BIRTHDAY PAGE 🌙</span><button className="moon-button" onClick={discoverMoon} aria-label="The little moon in the sky"><Moon size={19} aria-hidden="true" /></button></div>
      <div className="chapter-stage" key={`${chapter}-${replayKey}`}><EpisodeChapter chapter={chapter} state={state} update={patch => setState(previous => ({ ...previous, ...patch }))} next={() => goTo(Math.min(chapter + 1, 8))} replay={replay} reduced={reduced} /></div>
      {scenic && <button className="secret-petal" aria-label="Catch a sakura petal" onClick={() => setNotice('A little sakura petal for you. 🌸')}><span aria-hidden="true" /></button>}
      {chapter === 0 && <div className="scene-bottomline"><span><Heart size={13} aria-hidden="true" /> MADE FOR ALMA WITH 🖤.</span><span>闇の美 <span className="japanese-divider">/</span> BIRTHDAY SPECIAL</span></div>}
    </main>

    <footer className="episode-footer"><div className="chapter-current"><span className="chapter-counter">{number(chapter + 1)}<span> / 09</span></span><span className="footer-divider" /><div><span className="footer-eyebrow">BIRTHDAY PAGE</span><span className="footer-chapter-title">{chapters[chapter]}</span></div></div><nav className="chapter-nav" aria-label="Birthday page sections">{chapters.map((name, index) => <button key={name} className={`chapter-dot ${index === chapter ? 'current' : ''} ${index < chapter ? 'past' : ''}`} aria-label={`Section ${index + 1}: ${name}`} aria-current={chapter === index ? 'step' : undefined} onClick={() => goTo(index)}><span /></button>)}</nav><div className="footer-navigation"><button className="previous-button" aria-label="Previous section" disabled={chapter === 0} onClick={() => goTo(chapter - 1)}><ArrowLeft size={17} aria-hidden="true" /></button><button className="next-button" aria-label={chapter === 8 ? 'See birthday page again' : 'Next section'} onClick={chapter === 8 ? replay : () => goTo(chapter + 1)}><span>{chapter === 8 ? 'SEE AGAIN' : 'NEXT'}</span><ArrowRight size={17} aria-hidden="true" /></button></div></footer>
    <div className="site-bottom"><span> Lots of birthday wishes. 🖤</span><span>:3 🌙</span></div>

    {notice && <aside className="secret-notice" aria-label="A secret discovered"><Sparkles aria-hidden="true" /><p role="status">{notice}</p><button aria-label="Dismiss message" onClick={() => setNotice('')}><X aria-hidden="true" /></button></aside>}
    {audio.playing && <div className="music-indicator" aria-hidden="true"><Music2 size={12} /><span>Birthday music 🌙</span><i /><i /><i /></div>}
  </div>
}
