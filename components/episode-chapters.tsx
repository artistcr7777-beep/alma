'use client'

import { ArrowRight, Check, Flower2, Heart, Mail, Play, Ribbon, RotateCcw, Sparkles, Star, Sun, Swords, Trophy } from 'lucide-react'
import { birthday, hopes, number, routes, wishes } from '@/lib/birthday-content'
import { Celebration, Typewriter } from './episode-effects'

const symbols = { flower: Flower2, sun: Sun, sparkles: Sparkles, heart: Heart, ribbon: Ribbon, swords: Swords }

export type EpisodeState = {
  cards: number[]
  route: number | null
  capsules: number[]
  capsule: number | null
  wishes: number[]
  wish: number | null
}

export const emptyEpisode: EpisodeState = { cards: [], route: null, capsules: [], capsule: null, wishes: [], wish: null }

type Props = {
  chapter: number
  state: EpisodeState
  update: (patch: Partial<EpisodeState>) => void
  next: () => void
  replay: () => void
  reduced: boolean
}

function Continue({ onClick, children = 'The next chapter' }: { onClick: () => void; children?: React.ReactNode }) {
  return <button className="primary-button" onClick={onClick}>{children}<ArrowRight aria-hidden="true" size={17} /></button>
}

function Heading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return <div className="chapter-heading"><span className="eyebrow">{eyebrow}</span><h1 tabIndex={-1} id="chapter-title">{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
}

export function EpisodeChapter({ chapter, state, update, next, replay, reduced }: Props) {
  if (chapter === 0) return <div className="opening-layout">
    <div className="opening-copy">
      <div className="special-label"><span className="label-line" /><span>「 A BIRTHDAY SPECIAL 」</span><span className="label-line" /></div>
      <div className="episode-tag"><span /> A BIRTHDAY CELEBRATION <span className="tag-divider">/</span> 19</div>
      <h1 tabIndex={-1} id="chapter-title">Happy Birthday,<br /><em>{birthday.name}!</em><Sparkles className="title-sparkle" aria-hidden="true" /></h1>
      <p className="birthday-line">Happy 19th Birthday, <strong>{birthday.name}</strong> <Heart aria-label="with affection" size={19} /></p>
      <p className="opening-description">A birthday page for a great friend. 🌙</p>
      <button className="primary-button start-button" onClick={next}><Play size={16} fill="currentColor" aria-hidden="true" />Start<ArrowRight size={17} aria-hidden="true" /></button>
      <span className="start-footnote">Made for you. Enjoy!</span>
    </div>
    <div className="episode-ticket" aria-label="A birthday ticket: a new chapter begins">
      <div className="ticket-top"><Flower2 size={19} aria-hidden="true" /><span>HAPPY BIRTHDAY, ALMA 🖤</span><span>特別編</span></div>
      <div className="ticket-number">19<span>th</span><Star className="ticket-star" aria-hidden="true" /></div>
      <div className="ticket-title">Your Birthday</div><div className="ticket-subtitle">A day to celebrate.</div>
      <div className="ticket-bottom"><span>ONE OF A KIND</span><Heart size={15} aria-hidden="true" /><span>∞ POSSIBILITIES</span></div>
    </div>
    <div className="scene-caption"><span className="caption-line" /><span>CHAPTER 19: A NEW YEAR BEGINS</span><span className="caption-dot">·</span><span>Good music. Good company. 🌙</span></div>
  </div>

  if (chapter === 1) return <div className="chapter-content welcome-content">
    <Heading eyebrow="HAPPY BIRTHDAY" title="You’re officially 19!" />
    <p className="handwritten welcome-subtitle">Hope you have a great day! ✨🖤</p>
    <p className="scene-description"><Typewriter text="Wishing you a fun celebration and a great year ahead. 🌙" reduced={reduced} /></p>
    <Continue onClick={next}>Birthday wishes</Continue>
    <p className="small-note">{birthday.birthdayNote}</p>
    <Celebration />
  </div>

  if (chapter === 2) return <div className="chapter-content">
    <Heading eyebrow="BEST WISHES" title="Good things for the year ahead" subtitle="Pick a card for a birthday wish." />
    <div className="hope-grid">{hopes.map((hope, index) => {
      const Icon = symbols[hope.symbol as keyof typeof symbols]
      const open = state.cards.includes(index)
      return <button key={hope.title} className={`hope-card ${open ? 'is-flipped' : ''}`} aria-expanded={open} aria-label={`${hope.title}${open ? ': ' + hope.text : ' — reveal card'}`} onClick={() => update({ cards: open ? state.cards.filter(value => value !== index) : [...state.cards, index] })}>
        <span className="hope-card-inner"><span className="hope-front" aria-hidden={open}><span className="card-number">0{index + 1}</span><Icon className="hope-icon" aria-hidden="true" /><strong>{hope.title}</strong><span className="card-hint">A LITTLE WISH FOR YOU <span>↗</span></span></span><span className="hope-back" aria-hidden={!open}><Sparkles aria-hidden="true" /><strong>{hope.title}</strong><span>{hope.text}</span><span className="card-hint">TAP TO TURN BACK</span></span></span>
      </button>
    })}</div>
    <p className="small-note" aria-live="polite">{state.cards.length ? `${state.cards.length} ${state.cards.length === 1 ? 'wish' : 'wishes'} picked.` : 'Pick a card to see a birthday wish. 🖤'}</p>
    <Continue onClick={next} />
  </div>

  if (chapter === 3) return <div className="chapter-content destiny-content">
    <Heading eyebrow="PICK YOUR FAVORITE" title="Which style do you like best?" subtitle="Choose the one that suits your taste." />
    <div className="route-grid">{routes.map((route, index) => {
      const Icon = symbols[route.symbol as keyof typeof symbols]
      return <button className={`route-card ${state.route === index ? 'selected' : ''}`} key={route.title} aria-pressed={state.route === index} onClick={() => update({ route: index })}><Icon aria-hidden="true" /><span>{route.title}</span>{state.route === index ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}</button>
    })}</div>
    <div className="route-result" aria-live="polite">{state.route !== null ? <div key={state.route} className="reveal-message"><span className="eyebrow">YOUR PICK</span><h2>{routes[state.route].text}</h2><p>{routes[state.route].detail}</p></div> : <p className="small-note">Pick the style you like best.</p>}</div>
    <Continue onClick={next} />
  </div>

  if (chapter === 4) return <div className="chapter-content story-content">
    <Heading eyebrow="A FEW HIGHLIGHTS" title="Things to celebrate" subtitle="A few good things for your birthday." />
    {birthday.memories.length > 0 ? (
      <ol className="timeline">{birthday.memories.map((memory, index) => <li key={memory.title}><span className="timeline-node">{number(index + 1)}</span><div><span className="eyebrow">EPISODE {number(index + 1)}</span><h2>{memory.title}</h2><p>{memory.message}</p>{memory.photo && <img className="memory-photo" src={memory.photo} alt={`Memory: ${memory.title}`} loading="lazy" onError={event => { event.currentTarget.hidden = true }} />}</div></li>)}</ol>
    ) : (
      <div className="reveal-message" style={{ maxWidth: 520, margin: '20px auto 10px', padding: '28px 24px', background: '#fffcf7', border: '1px solid #e7d0cc', borderRadius: 9, textAlign: 'center' }}>
        <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 20, color: '#513a47', marginBottom: 12 }}>Happy Birthday, Alma!</p>
        <p style={{ fontSize: 13, lineHeight: 1.8, color: '#735b61' }}>Hope your day is full of good food, good music, and people you enjoy spending time with. 🖤</p>
      </div>
    )}
    <div className="continued-note"><span className="handwritten">Have a great birthday! 🌙</span><p>Wishing you a fun day and a great year ahead.</p></div><Continue onClick={next} />
  </div>

  if (chapter === 5) return <div className="chapter-content capsule-content">
    <Heading eyebrow="BIRTHDAY NOTES" title="A few kind words" subtitle="Choose a note to read. ✨" />
    <div className="capsule-grid">{birthday.capsules.map((message, index) => <button key={index} className={`capsule-button ${state.capsules.includes(index) ? 'opened' : ''}`} aria-label={`Open capsule ${number(index + 1)}${state.capsules.includes(index) ? ', previously opened' : ''}`} aria-pressed={state.capsule === index} onClick={() => update({ capsule: index, capsules: [...new Set([...state.capsules, index])] })}><span className="capsule-globe"><Star aria-hidden="true" /><span className="capsule-glint" /><span className="capsule-seam" /></span><span>CAPSULE {number(index + 1)}</span><span className="capsule-status">{state.capsules.includes(index) ? 'A memory unlocked' : 'Something worth keeping'}</span></button>)}</div>
    <div className="capsule-result" aria-live="polite">{state.capsule !== null ? <p className="reveal-message" key={state.capsule}>{birthday.capsules[state.capsule]}</p> : <p className="small-note">Pick one of the birthday notes.</p>}</div><Continue onClick={next} />
  </div>

  if (chapter === 6) return <div className="chapter-content wishes-content">
    <Heading eyebrow="BIRTHDAY WISHES" title="19 Wishes for 19" subtitle="Choose a star to read a wish." />
    <div className="wish-layout"><div className="wish-grid">{wishes.map((wish, index) => <button key={index} className={`wish-star ${state.wishes.includes(index) ? 'unlocked' : ''} ${state.wish === index ? 'active-wish' : ''}`} aria-label={`Wish ${index + 1}${state.wishes.includes(index) ? ', unlocked' : ', open'}`} aria-pressed={state.wish === index} onClick={() => update({ wish: index, wishes: [...new Set([...state.wishes, index])] })}><Star aria-hidden="true" /><span>{number(index + 1)}</span>{state.wishes.includes(index) && <Check className="wish-check" aria-hidden="true" />}</button>)}</div>
    <div className="wish-message" aria-live="polite">{state.wish !== null ? <div key={state.wish} className="reveal-message"><Sparkles aria-hidden="true" /><span className="eyebrow">WISH {number(state.wish + 1)} OF {wishes.length}</span><p>{wishes[state.wish]}</p><span className="handwritten">a little wish, just for you.</span></div> : <div><Star aria-hidden="true" /><p>Your first wish is waiting.</p><span>Go on, pick a star.</span></div>}</div></div>
    <div className="wish-progress"><span aria-live="polite">{state.wishes.length}/{wishes.length} wishes read</span><progress value={state.wishes.length} max={wishes.length} aria-label="Birthday wishes read" /></div>
    {state.wishes.length === wishes.length && <><div className="achievement" role="status"><Trophy aria-hidden="true" /><div><strong>All {wishes.length} wishes read</strong><span>Hope you enjoyed them!</span></div></div><Celebration /></>}
    <Continue onClick={next}>A letter for you</Continue>
  </div>

  if (chapter === 7) return <div className="chapter-content letter-content">
    <Heading eyebrow="A NOTE FROM ZORO" title="A birthday note" subtitle="A simple birthday wish from a friend." />
    <article className="letter"><div className="letter-top"><span className="eyebrow">HAPPY 19TH BIRTHDAY</span><Mail aria-hidden="true" /></div><h2 className="handwritten">Dear {birthday.name},</h2>{birthday.letter.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="letter-signature"><span className="handwritten">— {birthday.from}</span><button className="letter-seal" aria-label="A little flower"><Flower2 aria-hidden="true" /></button></div></article><Continue onClick={next}>Finish</Continue>
  </div>

  return <div className="chapter-content ending-content"><Heading eyebrow="HAVE A GREAT DAY" title="Happy Birthday, Alma!" /><p className="handwritten ending-subtitle">Wishing you a wonderful year ahead. 🌙</p><div className="ending-birthday">Have a great 19th, {birthday.name} <span aria-hidden="true">🌙💜</span></div><p className="scene-description">Hope you enjoyed your birthday page. 🌙</p><div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}><button className="primary-button" onClick={replay}><RotateCcw size={17} aria-hidden="true" />See it again</button><a href="/" className="primary-button" style={{ background: '#3d2550', borderColor: '#6a3d8a' }}><Sparkles size={16} aria-hidden="true" />Candle Surprise 🕯️</a></div><p className="small-note">Best wishes from Zoro.</p><Celebration /></div>
}
