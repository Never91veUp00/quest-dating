// Генерация уникального slug
export const generateSlug = (text) => {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  return text
    .toLowerCase()
    .split('')
    .map(char => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Добавление числового суффикса при дубликатах
export const makeUniqueSlug = async (baseSlug, tableName, pool) => {
  let slug = baseSlug
  let counter = 1
  let exists = true

  while (exists) {
    const result = await pool.query(
      `SELECT id FROM ${tableName} WHERE slug = $1`,
      [slug]
    )
    
    if (result.rows.length === 0) {
      exists = false
    } else {
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }

  return slug
}