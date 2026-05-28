import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Каноничный dump.sql лежит в КОРНЕ репозитория: database/dump.sql.
// helper тут: server/tests/helpers/ → три уровня вверх до корня.
const DUMP_PATH = resolve(__dirname, '../../../database/dump.sql')

const DUMP_IN_CONTAINER = '/tmp/dump.sql'

/**
 * Применяет dump.sql внутри контейнера через psql -f.
 *
 * psql понимает \restrict и COPY ... FROM stdin (библиотека pg — нет),
 * поэтому применяем именно через psql, а не через pool.query.
 */
async function applyDump(container) {
  const { output, exitCode } = await container.exec([
    'psql',
    '-U', container.getUsername(),
    '-d', container.getDatabase(),
    '-v', 'ON_ERROR_STOP=1',
    '-f', DUMP_IN_CONTAINER,
  ])
  if (exitCode !== 0) {
    throw new Error(`applyDump: psql exit ${exitCode}\n${output}`)
  }
}

/**
 * Поднимает одноразовый PostgreSQL-контейнер, применяет database/dump.sql,
 * устанавливает DB_* в process.env и ДИНАМИЧЕСКИ импортирует pool + app.
 *
 * @returns {Promise<{container, pool, app, reset: () => Promise<void>}>}
 */
export async function setupIntegration() {
  // Прочитать dump в строку — кладём в контейнер через withCopyContentToContainer
  // (надёжный API testcontainers-node: контент-строка → target-путь, кладётся
  // на этапе билда, гарантированно на месте к моменту exec).
  const dumpContent = await readFile(DUMP_PATH, 'utf8')

  const container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('quest_dating')
    .withUsername('quest_user')
    .withPassword('test_password')
    .withCopyContentToContainer([
      { content: dumpContent, target: DUMP_IN_CONTAINER },
    ])
    .start()

  // Применить dump явно через psql exec — детерминированно, не зависит от
  // тайминга docker-entrypoint-initdb.d.
  await applyDump(container)

  // Установить env ДО импорта database.js — pool создаётся при импорте модуля.
  process.env.DB_HOST     = container.getHost()
  process.env.DB_PORT     = String(container.getPort())
  process.env.DB_NAME     = container.getDatabase()
  process.env.DB_USER     = container.getUsername()
  process.env.DB_PASSWORD = container.getPassword()
  process.env.NODE_ENV    = 'test'
  process.env.JWT_SECRET  = process.env.JWT_SECRET || 'test-secret-key-for-testing-only'
  process.env.JWT_EXPIRES_IN = '7d'

  // Динамические импорты ПОСЛЕ установки env.
  const { default: pool } = await import('@src/config/database.js')
  const { createApp } = await import('@src/app.js')
  const app = createApp()

  // Полный reset БД к состоянию dump.sql: дроп public schema и повторное
  // применение дампа (файл уже в контейнере). Самый надёжный способ —
  // гарантированно чистое состояние, никаких остаточных счётчиков/sequence.
  const reset = async () => {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
    await applyDump(container)
  }

  return { container, pool, app, reset }
}

/**
 * Останавливает контейнер и закрывает pool.
 */
export async function teardownIntegration(ctx) {
  if (!ctx) return
  if (ctx.pool) await ctx.pool.end()
  if (ctx.container) await ctx.container.stop()
}