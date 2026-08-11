import { useEffect, useRef, useMemo, useState } from "react"

const COLORS = ["#D17557", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444"]

// 加载 media/cat-meme 文件夹下所有图片
// 路径是相对于本文件的位置，如果本文件不在与 media 同级目录，请调整相对路径
const catMemeModules = import.meta.glob('../media/cat-meme/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
  import: 'default',
})
const CAT_IMAGES = Object.values(catMemeModules)

const CAT_BLOB_URLS = new Map()
window.__catblobLog = window.__catblobLog || []
const THUMB_SIZE = 160

function preloadAndShrink(src, timeoutMs = 30000) {
  return new Promise((resolve) => {
    const img = new Image()
    let settled = false
    const finish = (ok, url, reason) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      CAT_BLOB_URLS.set(src, url || src)
      window.__catblobLog.push(`${ok ? "OK" : "FAIL"} ${src} ${reason || ""}`)
      resolve()
    }
    const timer = setTimeout(() => finish(false, null, "timeout"), timeoutMs)

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = THUMB_SIZE
        canvas.height = THUMB_SIZE
        const ctx = canvas.getContext("2d")
        const scale = Math.min(THUMB_SIZE / img.naturalWidth, THUMB_SIZE / img.naturalHeight)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        ctx.drawImage(img, (THUMB_SIZE - w) / 2, (THUMB_SIZE - h) / 2, w, h)
        const thumbUrl = canvas.toDataURL("image/png")
        const thumbImg = new Image()
        thumbImg.onload = () => finish(true, thumbUrl)
        thumbImg.onerror = () => finish(true, src, "thumb-load-failed")
        thumbImg.src = thumbUrl
      } catch {
        finish(true, src, "canvas-failed") // 跨域等原因画布被污染时兜底用原图
      }
    }
    img.onerror = () => finish(false, null, "img-error")
    img.src = src
  })
}

const catImagesReady = Promise.allSettled(CAT_IMAGES.map(preloadAndShrink)).then(() => CAT_BLOB_URLS)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateParticle(id, side, catImg) {
  const type = catImg ? "cat" : "confetti"
  const sideLeft = side === "left"

  const driftRange = 800 + Math.random() * 600
  const drift = sideLeft ? driftRange : -driftRange
  const rise = 270 + Math.random() * 300
  const apex = 0.35 + Math.random() * 0.15
  const fadeStart = 0.3 + Math.random() * 0.2

  const x = sideLeft ? 6 + Math.random() * 10 : 83 + Math.random() * 11
  const y = 90 + Math.random() * 10
  const delay = Math.random() * 0.4
  const duration = 3.6 + Math.random() * 1.8
  const rotation = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540)
  const size = type === "cat" ? 60 + Math.random() * 20 : 7 + Math.random() * 7
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const shape = type === "confetti" ? (Math.random() > 0.5 ? "circle" : "square") : null

  return {
    id, type, x, y, delay, duration, rotation, size, color, catImg, shape,
    drift, rise, apex, fadeStart,
  }
}

// 用真实抛体公式采样出一整条连续轨迹，交给 WAAPI 逐点插值
function buildTrajectoryKeyframes(p, fallBeyond) {
  const STEPS = 24
  const { rise, drift, apex, rotation } = p
  const a = (2 * rise) / (apex * apex)

  const frames = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const y = -(a * t * (apex - 0.5 * t)) - t * fallBeyond
    const x = drift * (1 - Math.pow(1 - t, 1.6))
    const rot = rotation * t
    const scale = t < 0.08 ? 0.3 + (0.7 * t) / 0.08 : 1

    frames.push({
      transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`,
      offset: t,
    })
  }
  return frames
}

function Particle({ p }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fallBeyond = window.innerHeight * 0.35
    const posFrames = buildTrajectoryKeyframes(p, fallBeyond)

    const opacityFrames = [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.06 },
      { opacity: 1, offset: p.fadeStart },
      { opacity: 0, offset: 1 },
    ]

    const opts = {
      duration: p.duration * 1000,
      delay: p.delay * 1000,
      fill: "forwards",
    }

    const posAnim = el.animate(posFrames, { ...opts, easing: "linear" })
    const opacityAnim = el.animate(opacityFrames, { ...opts, easing: "ease-out" })

    return () => {
      posAnim.cancel()
      opacityAnim.cancel()
    }
  }, [p])

  return (
    <div
      ref={ref}
      className="confetti-particle"
      style={{
        left: `${p.x}vw`,
        top: `${p.y}vh`,
        width: `${p.size}px`,
        height: `${p.size}px`,
        borderRadius: p.type === "cat" ? "50%" : p.shape === "circle" ? "50%" : "2px",
        background: p.type === "confetti" ? p.color : "transparent",
      }}
    >
      {p.type === "cat" && (
        <img
          src={CAT_BLOB_URLS.get(p.catImg) || p.catImg}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
    </div>
  )
}

export default function CelebrationEffect({ minConfettiCount = 40 }) {
  const [catReady, setCatReady] = useState(false)

  useEffect(() => {
    let active = true
    catImagesReady.then(() => {
      window.__catblobLog.push(`GATE resolved, mapSize=${CAT_BLOB_URLS.size}`)
      window.__catchImg = [...CAT_BLOB_URLS.entries()].slice(0, 3)
      if (active) setCatReady(true)
    })
    return () => { active = false }
  }, [])

  const particles = useMemo(() => {
    let id = 0

    // 每张猫图恰好一个名额，保证全部图片都会出现且只出现一次
    const shuffledCats = shuffle(CAT_IMAGES)
    const catCount = shuffledCats.length

    // 剩余名额用普通彩色confetti填满，保证总量不低于 minConfettiCount
    const plainCount = Math.max(0, minConfettiCount - catCount)
    const total = catCount + plainCount

    // 把猫图占位符和普通confetti占位符(null)合并后打乱，
    // 确保猫图随机分布在整个爆发中，而不是扎堆出现
    const typeSequence = shuffle([
      ...shuffledCats,
      ...Array(plainCount).fill(null),
    ])

    const items = []
    for (let i = 0; i < total; i++) {
      const side = i < total / 2 ? "left" : "right"
      items.push(generateParticle(id++, side, typeSequence[i]))
    }
    return items
  }, [minConfettiCount])

  if (!catReady) return null

  return (
    <div className="celebration-overlay" aria-hidden="true">
      {particles.map(p => (
        <Particle key={p.id} p={p} />
      ))}
      <span className="party-popper left">🎉</span>
      <span className="party-popper right"><span className="popper-flip">🎉</span></span>
    </div>
  )
}