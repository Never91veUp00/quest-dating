// Покадровая запись моушн-ролика темы → MP4 (H.264) + постер.
//
//   node tools/reels/record.mjs detective [--ffmpeg <path>] [--fps 30] [--poster 0.9]
//
// Страница tools/reels/<theme>.html держит все CSS-анимации на паузе и даёт
// window.seek(t). Скрипт ставит каждый кадр, снимает PNG (1080×1920) и
// собирает ролик 720×1280 для плеера: client-nuxt/public/reels/<theme>.mp4/.jpg.
import { createServer } from 'node:http'
import { readFile, mkdir, rm } from 'node:fs/promises'
import { extname, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const require = createRequire(join(ROOT, 'client-nuxt/package.json'))
const { chromium } = require('playwright')

const args = process.argv.slice(2)
const theme = args[0]
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def }
const FFMPEG = opt('ffmpeg', process.env.FFMPEG || 'C:/Users/WEB/tools/ffmpeg/bin/ffmpeg.exe')
const FPS = Number(opt('fps', 30))
const POSTER_AT = Number(opt('poster', 0.9))
if (!theme) { console.error('usage: node tools/reels/record.mjs <theme>'); process.exit(1) }

const TYPES = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.css': 'text/css', '.svg': 'image/svg+xml' }
const server = createServer(async (req, res) => {
  try {
    const path = resolve(ROOT, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (!path.startsWith(ROOT)) throw new Error('outside root')
    const body = await readFile(path)
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' })
    res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const framesDir = join(ROOT, 'tools/reels/.frames', theme)
const outDir = join(ROOT, 'client-nuxt/public/reels')
await rm(framesDir, { recursive: true, force: true })
await mkdir(framesDir, { recursive: true })
await mkdir(outDir, { recursive: true })

// Браузер: штатный для этой версии Playwright, иначе любой уже установленный Chromium
const launchBrowser = async () => {
  try { return await chromium.launch() } catch (err) {
    const { readdirSync, existsSync } = await import('node:fs')
    const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || join(process.env.LOCALAPPDATA || '', 'ms-playwright')
    const exe = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort().reverse()
      .map(d => join(cache, d, 'chrome-win64', 'chrome.exe')).find(p => existsSync(p))
    if (!exe) throw err
    console.log('using installed Chromium:', exe)
    return chromium.launch({ executablePath: exe })
  }
}
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 })
await page.goto(`${base}/tools/reels/${theme}.html`)
await page.evaluate(() => document.fonts.ready)
const duration = await page.evaluate(() =>
  Math.max(...document.getAnimations().map(a => a.effect.getTiming().duration)) / 1000)
const total = Math.round(duration * FPS)
console.log(`${theme}: ${duration}s, ${total} frames @ ${FPS}fps`)

for (let i = 0; i < total; i++) {
  await page.evaluate(t => window.seek(t), i / FPS)
  await page.screenshot({ path: join(framesDir, `${String(i).padStart(4, '0')}.png`) })
}
await browser.close()
server.close()

const run = (argv) => {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${argv.join(' ')}`)
}
const mp4 = join(outDir, `${theme}.mp4`)
const jpg = join(outDir, `${theme}.jpg`)
run(['-framerate', String(FPS), '-i', join(framesDir, '%04d.png'),
  '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', '-an', mp4])
run(['-i', join(framesDir, `${String(Math.round(POSTER_AT * FPS)).padStart(4, '0')}.png`),
  '-vf', 'scale=720:1280:flags=lanczos', '-q:v', '4', jpg])
await rm(framesDir, { recursive: true, force: true })
console.log('written', mp4, jpg)
