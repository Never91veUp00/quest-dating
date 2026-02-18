#!/usr/bin/env node

/**
 * Database Seeding Script
 * Quest Dating Platform
 *
 * Populates database with sample data for development/testing
 *
 * Usage:
 *   node scripts/seed-database.js [options]
 *
 * Options:
 *   --env      Environment (development, production) [default: development]
 *   --clean    Clean database before seeding
 *   --minimal  Seed minimal data only
 *   --help     Show help
 */

const { Pool } = require('pg')
const bcrypt = require('bcrypt')

// Parse command line arguments
const args = process.argv.slice(2)

if (args.includes('--help')) {
  console.log(`
Database Seeding Script for Quest Dating

Usage:
  node scripts/seed-database.js [options]

Options:
  --env      Environment (development, production) [default: development]
  --clean    Clean database before seeding
  --minimal  Seed minimal data only
  --help     Show this help

Examples:
  node scripts/seed-database.js
  node scripts/seed-database.js --clean
  node scripts/seed-database.js --minimal --clean
  `)
  process.exit(0)
}

const ENVIRONMENT = args.includes('--env') 
  ? args[args.indexOf('--env') + 1] 
  : 'development'
const CLEAN_DB = args.includes('--clean')
const MINIMAL = args.includes('--minimal')

// Load environment variables
const envFile = ENVIRONMENT === 'production' 
  ? './server/.env.production' 
  : './server/.env'

require('dotenv').config({ path: envFile })

// Colors for console
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}▸${colors.reset} ${msg}`)
}

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quest_dating',
  user: process.env.DB_USER || 'quest_user',
  password: process.env.DB_PASSWORD
})

/**
 * Clean database tables
 */
async function cleanDatabase() {
  log.step('Cleaning database...')
  
  const tables = [
    'reviews',
    'quest_sessions',
    'orders',
    'created_quests',
    'template_tags',
    'quest_templates',
    'tags',
    'authors',
    'categories'
  ]

  for (const table of tables) {
    try {
      await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`)
      log.success(`Cleaned table: ${table}`)
    } catch (error) {
      log.warning(`Skipped table: ${table} (${error.message})`)
    }
  }
  
  console.log('')
}

/**
 * Seed categories
 */
async function seedCategories() {
  log.step('Seeding categories...')
  
  const categories = [
    {
      name: 'Городские квесты',
      slug: 'city-quests',
      description: 'Квесты по интересным местам города',
      icon: '🏙️',
      color: '#4A90E2',
      position: 1
    },
    {
      name: 'Парковые приключения',
      slug: 'park-adventures',
      description: 'Романтические прогулки в парках',
      icon: '🌳',
      color: '#2ECC71',
      position: 2
    },
    {
      name: 'Домашние квесты',
      slug: 'home-quests',
      description: 'Уютные квесты не выходя из дома',
      icon: '🏠',
      color: '#E74C3C',
      position: 3
    },
    {
      name: 'Экстремальные',
      slug: 'extreme',
      description: 'Для любителей адреналина',
      icon: '⚡',
      color: '#F39C12',
      position: 4
    },
    {
      name: 'Культурные',
      slug: 'cultural',
      description: 'Музеи, галереи, театры',
      icon: '🎭',
      color: '#9B59B6',
      position: 5
    },
    {
      name: 'Гастрономические',
      slug: 'gastronomic',
      description: 'Кулинарные приключения для двоих',
      icon: '🍷',
      color: '#E67E22',
      position: 6
    }
  ]

  for (const category of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug, description, icon, color, position)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [category.name, category.slug, category.description, category.icon, category.color, category.position]
    )
  }

  log.success(`Seeded ${categories.length} categories`)
  console.log('')
}

/**
 * Seed authors
 */
async function seedAuthors() {
  log.step('Seeding authors...')
  
  const password = await bcrypt.hash('password123', 10)
  
  const authors = [
    {
      username: 'anna_quest',
      email: 'anna@example.com',
      display_name: 'Анна Иванова',
      bio: 'Создаю романтические квесты более 5 лет. Помогла организовать более 500 незабываемых свиданий!',
      avatar_url: '/avatars/anna.jpg',
      is_verified: true
    },
    {
      username: 'dmitry_adventures',
      email: 'dmitry@example.com',
      display_name: 'Дмитрий Петров',
      bio: 'Специализируюсь на экстремальных и активных квестах. Люблю приключения!',
      avatar_url: '/avatars/dmitry.jpg',
      is_verified: true
    },
    {
      username: 'maria_creative',
      email: 'maria@example.com',
      display_name: 'Мария Сидорова',
      bio: 'Креативный сценарист с опытом в театре. Создаю уникальные истории для влюбленных пар.',
      avatar_url: '/avatars/maria.jpg',
      is_verified: true
    },
    {
      username: 'alex_city',
      email: 'alex@example.com',
      display_name: 'Алексей Новиков',
      bio: 'Знаю город как свои пять пальцев. Открою вам тайные и романтичные места.',
      avatar_url: '/avatars/alex.jpg',
      is_verified: false
    },
    {
      username: 'elena_gourmet',
      email: 'elena@example.com',
      display_name: 'Елена Волкова',
      bio: 'Повар и организатор гастрономических туров. Совмещаю любовь и кулинарию!',
      avatar_url: '/avatars/elena.jpg',
      is_verified: true
    }
  ]

  for (const author of authors) {
    await pool.query(
      `INSERT INTO authors 
       (username, email, display_name, bio, avatar_url, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [author.username, author.email, author.display_name, author.bio, author.avatar_url, author.is_verified]
    )
  }

  log.success(`Seeded ${authors.length} authors`)
  console.log('')
}

/**
 * Seed tags
 */
async function seedTags() {
  log.step('Seeding tags...')
  
  const tags = [
    'романтика', 'приключения', 'город', 'природа', 'активный отдых',
    'культура', 'искусство', 'еда', 'винные дегустации', 'фотосессия',
    'сюрприз', 'предложение руки и сердца', 'годовщина', 'первое свидание',
    'загадки', 'головоломки', 'квест-комната', 'на свежем воздухе',
    'зимний', 'летний', 'весенний', 'осенний'
  ]

  for (const tagName of tags) {
    const slug = tagName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zа-я0-9-]/g, '')
    
    await pool.query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2)',
      [tagName, slug]
    )
  }

  log.success(`Seeded ${tags.length} tags`)
  console.log('')
}

/**
 * Seed templates
 */
async function seedTemplates() {
  log.step('Seeding templates...')
  
  const templates = [
    {
      slug: 'romantic-city-adventure',
      title: 'Романтическое приключение по городу',
      tagline: 'Откройте город заново вместе',
      description: 'Увлекательный квест по самым романтичным местам города. Включает посещение 5-7 локаций с интересными заданиями, фотозонами и сюрпризами.',
      cover_image: '/templates/romantic-city.jpg',
      gallery: JSON.stringify(['/gallery/romantic-1.jpg', '/gallery/romantic-2.jpg', '/gallery/romantic-3.jpg']),
      category_id: 1,
      author_id: 1,
      difficulty: 'medium',
      duration_minutes: 180,
      min_locations: 5,
      max_locations: 7,
      location_type: 'city',
      base_price: 299000,
      is_free: false,
      is_premium: false,
      status: 'published',
      published_at: new Date(),
      structure: JSON.stringify({
        intro: { type: 'story', required: true },
        locations: [
          { name: 'Центральная площадь', task_type: 'riddle' },
          { name: 'Набережная', task_type: 'photo' },
          { name: 'Старый парк', task_type: 'code' },
          { name: 'Смотровая площадка', task_type: 'puzzle' },
          { name: 'Романтическое кафе', task_type: 'surprise' }
        ],
        finale: { type: 'surprise', required: true }
      }),
      features: JSON.stringify(['загадки', 'фото-задания', 'подсказки', 'романтическая история'])
    },
    {
      slug: 'park-mystery-walk',
      title: 'Таинственная прогулка в парке',
      tagline: 'Природа, загадки и романтика',
      description: 'Спокойная прогулка по парку с элементами детектива. Решайте загадки, находите тайники и наслаждайтесь природой.',
      cover_image: '/templates/park-mystery.jpg',
      gallery: JSON.stringify(['/gallery/park-1.jpg', '/gallery/park-2.jpg']),
      category_id: 2,
      author_id: 2,
      difficulty: 'easy',
      duration_minutes: 120,
      min_locations: 4,
      max_locations: 6,
      location_type: 'park',
      base_price: 199000,
      is_free: false,
      is_premium: false,
      status: 'published',
      published_at: new Date(),
      structure: JSON.stringify({
        intro: { type: 'map', required: true },
        checkpoints: 4,
        final_treasure: true
      }),
      features: JSON.stringify(['карта', 'простые загадки', 'природа', 'релакс'])
    },
    {
      slug: 'home-movie-night',
      title: 'Киновечер с сюрпризами',
      tagline: 'Уютный вечер дома с интерактивными заданиями',
      description: 'Домашний квест для пар, которые любят проводить время вдвоем. Фильмы, игры, вкусная еда и романтическая атмосфера.',
      cover_image: '/templates/home-movie.jpg',
      gallery: JSON.stringify(['/gallery/home-1.jpg']),
      category_id: 3,
      author_id: 3,
      difficulty: 'easy',
      duration_minutes: 240,
      min_locations: 1,
      max_locations: 1,
      location_type: 'indoor',
      base_price: 0,
      is_free: true,
      is_premium: false,
      status: 'published',
      published_at: new Date(),
      structure: JSON.stringify({
        timeline: true,
        activities: ['movie', 'games', 'dinner'],
        surprises: 3
      }),
      features: JSON.stringify(['фильмы', 'игры', 'романтический ужин'])
    },
    {
      slug: 'extreme-outdoor-challenge',
      title: 'Экстремальный вызов',
      tagline: 'Для тех, кто любит адреналин',
      description: 'Активный квест с элементами экстрима: веревочный парк, скалолазание, квадроциклы. Для спортивных пар!',
      cover_image: '/templates/extreme.jpg',
      gallery: JSON.stringify(['/gallery/extreme-1.jpg', '/gallery/extreme-2.jpg', '/gallery/extreme-3.jpg']),
      category_id: 4,
      author_id: 2,
      difficulty: 'expert',
      duration_minutes: 300,
      min_locations: 3,
      max_locations: 5,
      location_type: 'universal',
      base_price: 499000,
      is_free: false,
      is_premium: true,
      status: 'published',
      published_at: new Date(),
      structure: JSON.stringify({
        challenges: ['rope_park', 'climbing', 'atv'],
        difficulty_levels: ['medium', 'hard', 'expert']
      }),
      features: JSON.stringify(['экстрим', 'спорт', 'адреналин', 'активный отдых'])
    },
    {
      slug: 'museum-art-tour',
      title: 'Арт-тур по музеям',
      tagline: 'Культурное свидание для эстетов',
      description: 'Посещение 2-3 музеев или галерей с интересными заданиями. Узнайте больше об искусстве вместе!',
      cover_image: '/templates/museum.jpg',
      gallery: JSON.stringify(['/gallery/museum-1.jpg', '/gallery/museum-2.jpg']),
      category_id: 5,
      author_id: 3,
      difficulty: 'medium',
      duration_minutes: 240,
      min_locations: 2,
      max_locations: 3,
      location_type: 'city',
      base_price: 349000,
      is_free: false,
      is_premium: false,
      status: 'published',
      published_at: new Date(),
      structure: JSON.stringify({
        museums: ['modern_art', 'history', 'contemporary'],
        tasks_per_museum: 3
      }),
      features: JSON.stringify(['культура', 'искусство', 'образование', 'красота'])
    },
    {
      slug: 'gourmet-food-journey',
      title: 'Гастрономическое путешествие',
      tagline: 'Откройте вкус любви',
      description: 'Кулинарный квест с посещением лучших ресторанов и кафе города. Дегустации, мастер-классы и романтический ужин.',
      cover_image: '/templates/gourmet.jpg',
      gallery: JSON.stringify(['/gallery/food-1.jpg', '/gallery/food-2.jpg', '/gallery/food-3.jpg']),
      category_id: 6,
      author_id: 5,
      difficulty: 'medium',
      duration_minutes: 360,
      min_locations: 4,
      max_locations: 6,
      location_type: 'city',
      base_price: 599000,
      is_free: false,
      is_premium: true,
      status: 'published',
      published_at: new Date(),
      structure: JSON.stringify({
        course: ['appetizer', 'soup', 'main', 'dessert', 'drinks'],
        restaurants: 4
      }),
      features: JSON.stringify(['дегустация', 'мастер-класс', 'ужин', 'вино'])
    }
  ]

  const templateIds = []

  for (const template of templates) {
    const result = await pool.query(
      `INSERT INTO quest_templates 
       (slug, title, tagline, description, cover_image, gallery, category_id, author_id, 
        difficulty, duration_minutes, min_locations, max_locations, location_type, 
        base_price, is_free, is_premium, status, published_at, structure, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING id`,
      [
        template.slug, template.title, template.tagline, template.description,
        template.cover_image, template.gallery, template.category_id, template.author_id,
        template.difficulty, template.duration_minutes, template.min_locations, 
        template.max_locations, template.location_type, template.base_price,
        template.is_free, template.is_premium, template.status, template.published_at,
        template.structure, template.features
      ]
    )
    
    templateIds.push(result.rows[0].id)
  }

  log.success(`Seeded ${templates.length} templates`)
  console.log('')
  
  return templateIds
}

/**
 * Seed template tags
 */
async function seedTemplateTags(templateIds) {
  log.step('Seeding template tags...')
  
  // Исправленные slug'и - используем кириллицу как в базе
  const tagAssignments = [
    { 
      templateId: templateIds[0], 
      tagNames: ['романтика', 'город', 'загадки', 'фотосессия'] 
    },
    { 
      templateId: templateIds[1], 
      tagNames: ['романтика', 'природа', 'загадки', 'на свежем воздухе'] 
    },
    { 
      templateId: templateIds[2], 
      tagNames: ['романтика', 'первое свидание'] 
    },
    { 
      templateId: templateIds[3], 
      tagNames: ['приключения', 'активный отдых', 'на свежем воздухе'] 
    },
    { 
      templateId: templateIds[4], 
      tagNames: ['культура', 'искусство', 'город'] 
    },
    { 
      templateId: templateIds[5], 
      tagNames: ['еда', 'винные дегустации', 'город', 'романтика'] 
    }
  ]

  let count = 0
  for (const assignment of tagAssignments) {
    for (const tagName of assignment.tagNames) {
      // Ищем по имени вместо slug
      const tagResult = await pool.query('SELECT id FROM tags WHERE name = $1', [tagName])
      if (tagResult.rows.length > 0) {
        try {
          await pool.query(
            'INSERT INTO template_tags (template_id, tag_id) VALUES ($1, $2)',
            [assignment.templateId, tagResult.rows[0].id]
          )
          count++
        } catch (error) {
          // Игнорируем дубликаты
          if (error.code !== '23505') {
            log.warning(`Failed to insert tag: ${error.message}`)
          }
        }
      }
    }
  }

  log.success(`Seeded ${count} template-tag associations`)
  console.log('')
}

/**
 * Seed orders (if not minimal)
 */
async function seedOrders(templateIds) {
  if (MINIMAL) {
    log.warning('Skipping orders (minimal mode)')
    console.log('')
    return
  }

  log.step('Seeding orders...')
  
  const statuses = ['pending', 'confirmed', 'in_progress', 'completed']
  const count = 15

  for (let i = 0; i < count; i++) {
    const templateId = templateIds[Math.floor(Math.random() * templateIds.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    await pool.query(
      `INSERT INTO orders 
       (template_id, client_name, client_email, client_phone,
        description, event_date, event_city, status, base_price, total_price, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        templateId,
        `Клиент ${i + 1}`,
        `client${i + 1}@example.com`,
        `+7999${String(i).padStart(7, '0')}`,
        'Хочу удивить свою вторую половинку!',
        new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        'Москва',
        status,
        Math.floor(Math.random() * 500000) + 100000,
        Math.floor(Math.random() * 500000) + 100000,
        new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      ]
    )
  }

  log.success(`Seeded ${count} orders`)
  console.log('')
}

/**
 * Seed reviews (if not minimal)
 */
async function seedReviews(templateIds) {
  if (MINIMAL) {
    log.warning('Skipping reviews (minimal mode)')
    console.log('')
    return
  }

  log.step('Seeding reviews...')
  
  const comments = [
    'Отличный квест! Очень понравился, будем заказывать еще!',
    'Замечательно провели время! Спасибо автору за креатив!',
    'Все прошло великолепно! Девушка была в восторге!',
    'Хороший квест, но можно было бы добавить больше сложных заданий',
    'Идеально для романтического свидания!',
    'Превзошло все ожидания! Очень оригинально!',
    'Отличная организация, все четко и по времени',
    'Незабываемые впечатления! Рекомендую!',
    'Интересный маршрут, красивые места',
    'Квест понравился, но некоторые задания были слишком простыми'
  ]

  const titles = [
    'Лучшее свидание!',
    'Очень понравилось',
    'Рекомендую',
    'Отлично провели время',
    'Незабываемо',
    'Супер квест!',
    'Стоит своих денег',
    'Отличная идея',
    'Креативно и интересно',
    'Всем советую'
  ]

  let count = 0
  for (const templateId of templateIds) {
    const reviewCount = Math.floor(Math.random() * 5) + 2
    
    for (let i = 0; i < reviewCount; i++) {
      const rating = Math.floor(Math.random() * 2) + 4  // 4 or 5
      const comment = comments[Math.floor(Math.random() * comments.length)]
      const title = titles[Math.floor(Math.random() * titles.length)]
      
      await pool.query(
        `INSERT INTO reviews 
         (template_id, rating, title, comment, client_name, client_email, is_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          templateId,
          rating,
          title,
          comment,
          `Клиент ${count + 1}`,
          `reviewer${count + 1}@example.com`,
          Math.random() > 0.3, // 70% verified
          new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
        ]
      )
      
      count++
    }
  }

  log.success(`Seeded ${count} reviews`)
  console.log('')
}

/**
 * Update template statistics
 */
async function updateTemplateStats() {
  log.step('Updating template statistics...')
  
  await pool.query(`
    UPDATE quest_templates t
    SET 
      rating = COALESCE((
        SELECT AVG(rating)::numeric(3,2)
        FROM reviews
        WHERE template_id = t.id
      ), 0),
      reviews_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE template_id = t.id
      ),
      orders_count = (
        SELECT COUNT(*)
        FROM orders
        WHERE template_id = t.id
      ),
      views_count = FLOOR(RANDOM() * 5000 + 1000)::INTEGER
  `)

  log.success('Updated template statistics')
  console.log('')
}

/**
 * Update author statistics
 */
async function updateAuthorStats() {
  log.step('Updating author statistics...')
  
  await pool.query(`
    UPDATE authors a
    SET 
      total_templates = (
        SELECT COUNT(*)
        FROM quest_templates
        WHERE author_id = a.id AND status = 'published'
      ),
      average_rating = COALESCE((
        SELECT AVG(t.rating)::numeric(3,2)
        FROM quest_templates t
        WHERE t.author_id = a.id AND status = 'published'
      ), 0)
  `)

  log.success('Updated author statistics')
  console.log('')
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  console.log('')
  log.info('====================================')
  log.info('Quest Dating - Database Seeding')
  log.info('====================================')
  log.info(`Environment: ${ENVIRONMENT}`)
  log.info(`Mode: ${MINIMAL ? 'Minimal' : 'Full'}`)
  log.info(`Clean first: ${CLEAN_DB ? 'Yes' : 'No'}`)
  console.log('')

  try {
    // Test connection
    await pool.query('SELECT NOW()')
    log.success('Database connection established')
    console.log('')

    // Clean database if requested
    if (CLEAN_DB) {
      await cleanDatabase()
    }

    // Seed data
    await seedCategories()
    await seedAuthors()
    await seedTags()
    const templateIds = await seedTemplates()
    await seedTemplateTags(templateIds)
    await seedOrders(templateIds)
    await seedReviews(templateIds)
    
    // Update statistics
    await updateTemplateStats()
    await updateAuthorStats()

    console.log('')
    log.success('====================================')
    log.success('Database seeding completed!')
    log.success('====================================')
    console.log('')
    
    log.info('Summary:')
    const counts = await Promise.all([
      pool.query('SELECT COUNT(*) FROM categories'),
      pool.query('SELECT COUNT(*) FROM authors'),
      pool.query('SELECT COUNT(*) FROM tags'),
      pool.query('SELECT COUNT(*) FROM quest_templates'),
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COUNT(*) FROM reviews')
    ])

    console.log(`  Categories:  ${counts[0].rows[0].count}`)
    console.log(`  Authors:     ${counts[1].rows[0].count}`)
    console.log(`  Tags:        ${counts[2].rows[0].count}`)
    console.log(`  Templates:   ${counts[3].rows[0].count}`)
    console.log(`  Orders:      ${counts[4].rows[0].count}`)
    console.log(`  Reviews:     ${counts[5].rows[0].count}`)
    console.log('')

  } catch (error) {
    log.error('Seeding failed!')
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    log.success('Done!')
    process.exit(0)
  })
  .catch((error) => {
    log.error('Error:')
    console.error(error)
    process.exit(1)
  })