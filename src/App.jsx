import { useState, useRef, useEffect, useCallback } from 'react'

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

const CAPTIONS = [
  '',
  'Кнопка «Ні» чомусь не хоче, щоб її натискали.',
  'Не ловиться? Спробуй ще раз.',
  'Може, все ж таки «Так»?',
  'Вона дуже старається втекти.',
  'Тут є кнопка, яка точно спрацює.',
  'Здається, «Так» стає все більшою.',
]

const rnd = (a, b) => a + Math.random() * (b - a)

function Heart({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" aria-hidden="true">
      <path d={HEART} fill="currentColor" />
    </svg>
  )
}

function makeFloaters() {
  return Array.from({ length: 16 }, () => {
    const size = rnd(14, 42)
    return {
      left: `${rnd(2, 96)}%`,
      width: size,
      height: size,
      opacity: rnd(0.14, 0.38),
      '--dur': `${rnd(11, 22).toFixed(1)}s`,
      '--delay': `-${rnd(0, 20).toFixed(1)}s`,
      '--sway': `${rnd(-60, 60).toFixed(0)}px`,
      '--spin': `${rnd(-40, 40).toFixed(0)}deg`,
    }
  })
}

function makeConfetti() {
  const colors = ['#ff5c85', '#ffdbe4', '#f6cf9a', '#d93a67']
  return Array.from({ length: 42 }, (_, i) => {
    const ang = rnd(0, Math.PI * 2)
    const dist = rnd(140, 480)
    const size = rnd(14, 34)
    return {
      width: size,
      height: size,
      color: colors[i % colors.length],
      '--dx': `${(Math.cos(ang) * dist).toFixed(0)}px`,
      '--dy': `${(Math.sin(ang) * dist - 80).toFixed(0)}px`,
      '--rot': `${rnd(-90, 90).toFixed(0)}deg`,
      animationDelay: `${rnd(0, 0.25).toFixed(2)}s`,
    }
  })
}

export default function App() {
  const [yes, setYes] = useState(false)
  const [tries, setTries] = useState(0)
  const [pos, setPos] = useState(null)
  const [floaters] = useState(makeFloaters)
  const [confetti] = useState(makeConfetti)

  const yesRef = useRef(null)
  const noRef = useRef(null)
  const headRef = useRef(null)
  const last = useRef(0)

  // Телепортує кнопку «Ні» в нове випадкове місце екрана
  const dodge = useCallback(() => {
    const now = Date.now()
    if (now - last.current < 160) return
    last.current = now

    const btn = noRef.current
    if (!btn) return

    const w = btn.offsetWidth
    const bh = btn.offsetHeight
    const pad = 16
    const maxX = Math.max(pad, window.innerWidth - w - pad)
    const maxY = Math.max(pad, window.innerHeight - bh - pad)

    // Не потрапляти на «Так» і на заголовок
    const avoid = [yesRef.current, headRef.current]
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect())
    const cur = btn.getBoundingClientRect()

    let x = pad
    let y = pad
    for (let i = 0; i < 80; i++) {
      x = rnd(pad, maxX)
      y = rnd(pad, maxY)
      const hit = avoid.some(
        (r) =>
          x < r.right + 16 &&
          x + w > r.left - 16 &&
          y < r.bottom + 16 &&
          y + bh > r.top - 16,
      )
      const near = Math.hypot(x - cur.left, y - cur.top) < 140
      if (!hit && !near) break
    }

    setPos({ x, y })
    setTries((t) => t + 1)
  }, [])

  // Кнопка тікає ще до того, як курсор до неї дійде
  useEffect(() => {
    if (yes) return

    const onMove = (e) => {
      const b = noRef.current
      if (!b) return
      const r = b.getBoundingClientRect()
      const d = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2),
      )
      if (d < r.width * 0.8) dodge()
    }
    const onResize = () => setPos(null)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [yes, dodge])

  const restart = () => {
    setYes(false)
    setTries(0)
    setPos(null)
  }

  const sky = (
    <div className="sky" aria-hidden="true">
      {floaters.map((style, i) => (
        <Heart key={i} className="float" style={style} />
      ))}
    </div>
  )

  // Екран після «Так»: усе старе зникає
  if (yes) {
    return (
      <div className="app">
        {sky}
        <div className="confetti" aria-hidden="true">
          {confetti.map((style, i) => (
            <Heart key={i} style={style} />
          ))}
        </div>
        <main className="stage">
          <Heart className="big-heart" />
          <p className="eyebrow rise-in">Дякую тобі</p>
          <h1 className="rise-in">Це найкраща відповідь на світі, давай дізнаємось більше один про одного</h1>
          <p className="lead rise-in">
            Дякую, що ти є. Без поспіху і без обіцянок. Просто більше спілкуватись, дізнаватись одне одного, ділитись думками і сміятись разом. Тобі це дійсно сподобається, знаю може не докінця віриш. Але ми знайомі лиш день , і мене постійно притягує до тебе мов магнітом
          </p>
          <p className="sign rise-in">З теплом</p>
          <button type="button" className="again" onClick={restart}>
            Почати спочатку
          </button>
        </main>
      </div>
    )
  }

  const grow = Math.min(1 + tries * 0.06, 1.4)
  const caption = CAPTIONS[Math.min(tries, CAPTIONS.length - 1)]

  return (
    <div className="app">
      {sky}
      <main className="stage">
        <Heart className="big-heart" />
        <p className="eyebrow rise-in">Вислухай, будь ласка</p>
        <h1 ref={headRef} className="rise-in">
          Дай нам шанс?
        </h1>
        <p className="lead rise-in">
          Ти кажеш, що нічого не вийде. Але ми знайомі лише день, і напевно цього ще ніхто не знає. Я прошу не про обіцянки, а про шанс дізнатися одне одного.
        </p>

        <div className="actions">
          <button
            ref={yesRef}
            type="button"
            className="btn yes"
            style={{ '--grow': grow }}
            onClick={() => setYes(true)}
          >
            Так
          </button>

          <div className="slot">
            <button
              ref={noRef}
              type="button"
              className={`btn no${pos ? ' flying' : ''}`}
              style={pos ? { left: pos.x, top: pos.y } : undefined}
              onPointerEnter={dodge}
              onPointerDown={dodge}
              onFocus={dodge}
              onClick={dodge}
            >
              Ні
            </button>
          </div>
        </div>

        <p className="caption" aria-live="polite">
          {caption}
        </p>
      </main>
    </div>
  )
}
