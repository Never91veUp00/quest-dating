// Lightweight structured logger — no external dependencies
const LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 }
const COLORS = {
  error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m',
  http:  '\x1b[35m', debug: '\x1b[90m', reset: '\x1b[0m'
}
const isProd = process.env.NODE_ENV === 'production'
const MIN_LEVEL = isProd ? LEVELS.http : LEVELS.debug

const fmt = (level, msg, meta) => {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const col = COLORS[level]
  const metaStr = meta ? ' ' + JSON.stringify(meta) : ''
  return `${col}[${ts}] ${level.toUpperCase().padEnd(5)}${COLORS.reset} ${msg}${metaStr}`
}

const log = (level, msg, meta) => {
  if (LEVELS[level] > MIN_LEVEL) return
  const line = fmt(level, msg, meta)
  if (level === 'error' || level === 'warn') process.stderr.write(line + '\n')
  else process.stdout.write(line + '\n')
}

export const logger = {
  error: (msg, meta) => log('error', msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  info:  (msg, meta) => log('info',  msg, meta),
  http:  (msg, meta) => log('http',  msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
}

// Express HTTP middleware
export const httpLogger = (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    const status = res.statusCode
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'http'
    // Skip health checks to avoid noise
    if (req.path === '/health' || req.path === '/') return next && null
    log(level, `${req.method} ${req.originalUrl}`, {
      status, ms: `${ms}ms`,
      ip: req.headers['x-real-ip'] || req.ip,
    })
  })
  next()
}
