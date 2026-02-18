#!/usr/bin/env node

/**
 * Sitemap Generator
 * Quest Dating Platform
 *
 * Generates sitemap.xml for better SEO
 *
 * Usage:
 *   node scripts/generate-sitemap.js [options]
 *
 * Options:
 *   --env     Environment (development, production) [default: production]
 *   --output  Output file path [default: ./client/public/sitemap.xml]
 *   --help    Show help
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name, defaultValue) => {
  const index = args.indexOf(`--${name}`)
  return index > -1 ? args[index + 1] : defaultValue
}

if (args.includes('--help')) {
  console.log(`
Sitemap Generator for Quest Dating

Usage:
  node scripts/generate-sitemap.js [options]

Options:
  --env     Environment (development, production) [default: production]
  --output  Output file path [default: ./client/public/sitemap.xml]
  --help    Show this help

Examples:
  node scripts/generate-sitemap.js
  node scripts/generate-sitemap.js --env development
  node scripts/generate-sitemap.js --output ./dist/sitemap.xml
  `)
  process.exit(0)
}

const ENVIRONMENT = getArg('env', 'production')
const OUTPUT_FILE = getArg('output', './client/public/sitemap.xml')

// Configuration
const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    envFile: './server/.env'
  },
  production: {
    baseUrl: 'https://questdating.ru',
    envFile: './server/.env.production'
  }
}

const { baseUrl, envFile } = config[ENVIRONMENT]

// Load environment variables
require('dotenv').config({ path: envFile })

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`)
}

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quest_dating',
  user: process.env.DB_USER || 'quest_user',
  password: process.env.DB_PASSWORD
})

// Sitemap URLs with priority and change frequency
const staticUrls = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/templates', priority: 0.9, changefreq: 'daily' },
  { url: '/authors', priority: 0.8, changefreq: 'weekly' },
  { url: '/become-author', priority: 0.7, changefreq: 'monthly' },
  { url: '/about', priority: 0.6, changefreq: 'monthly' }
]

/**
 * Format date to W3C format (YYYY-MM-DD)
 */
function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0]
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Generate URL entry for sitemap
 */
function generateUrlEntry({ url, lastmod, changefreq, priority }) {
  return `
  <url>
    <loc>${baseUrl}${url}</loc>
    ${lastmod ? `<lastmod>${formatDate(lastmod)}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`
}

/**
 * Fetch templates from database
 */
async function fetchTemplates() {
  const query = `
    SELECT slug, updated_at
    FROM templates
    WHERE published_at IS NOT NULL
    ORDER BY updated_at DESC
  `
  const result = await pool.query(query)
  return result.rows
}

/**
 * Fetch categories from database
 */
async function fetchCategories() {
  const query = `
    SELECT slug, updated_at
    FROM categories
    ORDER BY "order"
  `
  const result = await pool.query(query)
  return result.rows
}

/**
 * Fetch authors from database
 */
async function fetchAuthors() {
  const query = `
    SELECT username, updated_at
    FROM authors
    WHERE published_templates > 0
    ORDER BY average_rating DESC
  `
  const result = await pool.query(query)
  return result.rows
}

/**
 * Generate sitemap XML
 */
async function generateSitemap() {
  try {
    log.info('Starting sitemap generation...')
    log.info(`Environment: ${ENVIRONMENT}`)
    log.info(`Base URL: ${baseUrl}`)
    log.info(`Output: ${OUTPUT_FILE}`)
    console.log('')

    // Fetch dynamic data
    log.info('Fetching data from database...')
    const [templates, categories, authors] = await Promise.all([
      fetchTemplates(),
      fetchCategories(),
      fetchAuthors()
    ])

    log.success(`Found ${templates.length} templates`)
    log.success(`Found ${categories.length} categories`)
    log.success(`Found ${authors.length} authors`)
    console.log('')

    // Build URLs array
    const urls = []

    // Add static URLs
    staticUrls.forEach(url => urls.push(url))

    // Add template URLs
    templates.forEach(template => {
      urls.push({
        url: `/template/${template.slug}`,
        lastmod: template.updated_at,
        changefreq: 'weekly',
        priority: 0.8
      })
    })

    // Add category URLs
    categories.forEach(category => {
      urls.push({
        url: `/categories/${category.slug}`,
        lastmod: category.updated_at,
        changefreq: 'weekly',
        priority: 0.7
      })
    })

    // Add author URLs
    authors.forEach(author => {
      urls.push({
        url: `/author/${author.username}`,
        lastmod: author.updated_at,
        changefreq: 'weekly',
        priority: 0.7
      })
    })

    // Generate XML
    log.info('Generating sitemap XML...')
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(generateUrlEntry).join('')}
</urlset>`

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write sitemap to file
    fs.writeFileSync(OUTPUT_FILE, xml.trim())

    const stats = fs.statSync(OUTPUT_FILE)
    const fileSize = (stats.size / 1024).toFixed(2)

    console.log('')
    log.success('Sitemap generated successfully!')
    log.success(`File: ${OUTPUT_FILE}`)
    log.success(`Size: ${fileSize} KB`)
    log.success(`Total URLs: ${urls.length}`)
    console.log('')

    // Display summary
    console.log('Summary:')
    console.log(`  Static pages:  ${staticUrls.length}`)
    console.log(`  Templates:     ${templates.length}`)
    console.log(`  Categories:    ${categories.length}`)
    console.log(`  Authors:       ${authors.length}`)
    console.log(`  ${'-'.repeat(30)}`)
    console.log(`  Total:         ${urls.length}`)
    console.log('')

    // Generate robots.txt reminder
    log.info('Remember to add sitemap to robots.txt:')
    console.log('')
    console.log('  User-agent: *')
    console.log('  Allow: /')
    console.log('')
    console.log(`  Sitemap: ${baseUrl}/sitemap.xml`)
    console.log('')

  } catch (error) {
    log.error('Sitemap generation failed!')
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run generator
generateSitemap()
  .then(() => {
    log.success('Done!')
    process.exit(0)
  })
  .catch((error) => {
    log.error('Error:')
    console.error(error)
    process.exit(1)
  })