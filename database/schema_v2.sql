-- Quest Marketplace Platform Database Schema
-- Переработанная версия для маркетплейса шаблонов

-- Включить расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Для поиска

-- ============================================
-- ПОЛЬЗОВАТЕЛИ И АВТОРЫ
-- ============================================

-- Таблица авторов шаблонов
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}', -- {instagram, telegram, vk}
    is_verified BOOLEAN DEFAULT false,
    total_templates INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- КАТЕГОРИИ И ТЕГИ
-- ============================================

-- Категории квестов
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji или иконка
    color VARCHAR(20), -- hex цвет для UI
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Теги для квестов
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ШАБЛОНЫ КВЕСТОВ (ПОРТФОЛИО)
-- ============================================

-- Основная таблица шаблонов (публичное портфолио)
CREATE TABLE quest_templates (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Основная информация
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tagline VARCHAR(200), -- Короткое описание для карточки
    description TEXT NOT NULL,
    
    -- Медиа
    cover_image VARCHAR(500), -- Главное изображение
    gallery JSONB DEFAULT '[]', -- Массив URL изображений
    demo_video_url VARCHAR(500),
    
    -- Характеристики квеста
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    duration_minutes INTEGER,
    location_type VARCHAR(50) CHECK (location_type IN ('city', 'indoor', 'park', 'universal')),
    min_locations INTEGER,
    max_locations INTEGER,
    
    -- Структура и возможности
    structure JSONB NOT NULL, -- Детальная структура блоков
    features JSONB DEFAULT '[]', -- ["загадки", "фото-задания", "QR-коды"]
    customization_options JSONB DEFAULT '{}', -- Что можно настроить
    
    -- Статистика и рейтинги
    views_count INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Цены и доступность
    base_price INTEGER, -- В копейках (например, 2990 рублей = 299000)
    is_free BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    
    -- Статус публикации
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    published_at TIMESTAMP,
    
    -- SEO
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь шаблонов с тегами (many-to-many)
CREATE TABLE template_tags (
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

-- ============================================
-- ОТЗЫВЫ И РЕЙТИНГИ
-- ============================================

-- Отзывы на шаблоны
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE CASCADE,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    images JSONB DEFAULT '[]', -- Фото от клиентов
    is_verified BOOLEAN DEFAULT false, -- Подтвержденный заказ
    is_featured BOOLEAN DEFAULT false, -- Выделенный отзыв
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ЗАКАЗЫ
-- ============================================

-- Таблица заказов (обновленная)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE SET NULL,
    
    -- Информация о клиенте
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    
    -- Детали заказа
    description TEXT NOT NULL, -- Описание задумки клиента
    event_date TIMESTAMP,
    event_city VARCHAR(100),
    
    -- Кастомизация на основе шаблона
    customization JSONB DEFAULT '{}', -- Выбранные опции из template.customization_options
    selected_features JSONB DEFAULT '[]',
    
    -- Ценообразование
    base_price INTEGER, -- Цена шаблона на момент заказа
    additional_costs INTEGER DEFAULT 0,
    total_price INTEGER,
    
    -- Статус заказа
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    
    -- Связанный созданный квест
    created_quest_id INTEGER, -- Будет ссылаться на таблицу created_quests
    
    -- Внутренние заметки
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- СОЗДАННЫЕ КВЕСТЫ (для клиентов)
-- ============================================

-- Готовые квесты для клиентов (приватные)
CREATE TABLE created_quests (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE SET NULL,
    
    -- Уникальный доступ
    slug VARCHAR(100) UNIQUE NOT NULL,
    access_code VARCHAR(50), -- Опциональный код доступа
    
    -- Информация
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    
    -- Контент квеста
    blocks JSONB NOT NULL, -- Массив блоков контента
    
    -- Настройки доступа
    is_public BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    started_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    
    -- Сроки жизни
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ПРОГРЕСС ПРОХОЖДЕНИЯ
-- ============================================

-- Сессии прохождения квестов
CREATE TABLE quest_sessions (
    id SERIAL PRIMARY KEY,
    created_quest_id INTEGER REFERENCES created_quests(id) ON DELETE CASCADE,
    session_id UUID DEFAULT uuid_generate_v4(),
    
    -- Прогресс
    completed_tasks JSONB DEFAULT '[]',
    current_block_position INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    
    -- Временные метки
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Статистика
    total_time_seconds INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

-- Авторы
CREATE INDEX idx_authors_username ON authors(username);
CREATE INDEX idx_authors_verified ON authors(is_verified);

-- Шаблоны
CREATE INDEX idx_templates_slug ON quest_templates(slug);
CREATE INDEX idx_templates_author ON quest_templates(author_id);
CREATE INDEX idx_templates_category ON quest_templates(category_id);
CREATE INDEX idx_templates_status ON quest_templates(status);
CREATE INDEX idx_templates_published ON quest_templates(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_templates_rating ON quest_templates(rating DESC);
CREATE INDEX idx_templates_orders ON quest_templates(orders_count DESC);
CREATE INDEX idx_templates_search ON quest_templates USING gin(to_tsvector('russian', title || ' ' || description));

-- Теги
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_template_tags_template ON template_tags(template_id);
CREATE INDEX idx_template_tags_tag ON template_tags(tag_id);

-- Отзывы
CREATE INDEX idx_reviews_template ON reviews(template_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- Заказы
CREATE INDEX idx_orders_template ON orders(template_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Созданные квесты
CREATE INDEX idx_created_quests_slug ON created_quests(slug);
CREATE INDEX idx_created_quests_order ON created_quests(order_id);

-- Сессии
CREATE INDEX idx_sessions_quest ON quest_sessions(created_quest_id);
CREATE INDEX idx_sessions_id ON quest_sessions(session_id);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON quest_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Обновление счетчика тегов
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_count AFTER INSERT OR DELETE ON template_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Обновление рейтинга шаблона при добавлении отзыва
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quest_templates SET
        rating = (SELECT AVG(rating) FROM reviews WHERE template_id = NEW.template_id),
        reviews_count = (SELECT COUNT(*) FROM reviews WHERE template_id = NEW.template_id)
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_rating_trigger AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_template_rating();

-- Обновление статистики автора
CREATE OR REPLACE FUNCTION update_author_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE authors SET
        total_templates = (SELECT COUNT(*) FROM quest_templates WHERE author_id = NEW.author_id AND status = 'published'),
        average_rating = (SELECT AVG(rating) FROM quest_templates WHERE author_id = NEW.author_id AND status = 'published')
    WHERE id = NEW.author_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_author_stats_trigger AFTER INSERT OR UPDATE ON quest_templates
    FOR EACH ROW EXECUTE FUNCTION update_author_stats();

-- ============================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================

-- Популярные шаблоны
CREATE OR REPLACE VIEW popular_templates AS
SELECT 
    qt.*,
    a.display_name as author_name,
    a.avatar_url as author_avatar,
    c.name as category_name,
    ARRAY_AGG(DISTINCT t.name) as tags
FROM quest_templates qt
LEFT JOIN authors a ON qt.author_id = a.id
LEFT JOIN categories c ON qt.category_id = c.id
LEFT JOIN template_tags tt ON qt.id = tt.template_id
LEFT JOIN tags t ON tt.tag_id = t.id
WHERE qt.status = 'published'
GROUP BY qt.id, a.display_name, a.avatar_url, c.name
ORDER BY qt.orders_count DESC, qt.rating DESC
LIMIT 12;

-- Новые шаблоны
CREATE OR REPLACE VIEW newest_templates AS
SELECT 
    qt.*,
    a.display_name as author_name,
    a.avatar_url as author_avatar,
    c.name as category_name
FROM quest_templates qt
LEFT JOIN authors a ON qt.author_id = a.id
LEFT JOIN categories c ON qt.category_id = c.id
WHERE qt.status = 'published'
ORDER BY qt.published_at DESC
LIMIT 12;

-- Топ авторы
CREATE OR REPLACE VIEW top_authors AS
SELECT 
    a.*,
    COUNT(qt.id) as published_templates,
    SUM(qt.orders_count) as total_orders
FROM authors a
LEFT JOIN quest_templates qt ON a.id = qt.author_id AND qt.status = 'published'
GROUP BY a.id
HAVING COUNT(qt.id) > 0
ORDER BY a.average_rating DESC, total_orders DESC
LIMIT 10;

-- ============================================
-- ДЕМО ДАННЫЕ
-- ============================================

-- Категории
INSERT INTO categories (name, slug, description, icon, color, position) VALUES
('Романтика', 'romance', 'Квесты для свиданий и романтических событий', '💝', '#FF6B9D', 1),
('Приключения', 'adventure', 'Активные городские квесты с загадками', '🗺️', '#4A90E2', 2),
('Детектив', 'detective', 'Расследования и поиск улик', '🕵️', '#7B68EE', 3),
('Для детей', 'kids', 'Семейные квесты и детские праздники', '🎈', '#FFB347', 4),
('Корпоратив', 'corporate', 'Тимбилдинг и корпоративные мероприятия', '👔', '#2ECC71', 5),
('Праздники', 'celebrations', 'Дни рождения, юбилеи, особые даты', '🎉', '#E74C3C', 6);

-- Теги
INSERT INTO tags (name, slug) VALUES
('загадки', 'riddles'),
('фото-задания', 'photo-tasks'),
('QR-коды', 'qr-codes'),
('подсказки', 'hints'),
('таймер', 'timer'),
('для двоих', 'for-two'),
('групповой', 'group'),
('городской', 'city'),
('домашний', 'home'),
('парк', 'park'),
('легкий', 'easy'),
('сложный', 'hard'),
('романтика', 'romantic'),
('смешной', 'funny'),
('интеллектуальный', 'intellectual');

-- Демо автор
INSERT INTO authors (username, email, display_name, bio, avatar_url, is_verified) VALUES
('questmaster', 'admin@questdating.com', 'Quest Master', 
'Профессиональный создатель квестов с опытом более 5 лет. Создал более 200 уникальных сценариев.', 
'/avatars/questmaster.jpg', true);

-- Демо шаблоны
INSERT INTO quest_templates (
    author_id, category_id, title, slug, tagline, description, 
    cover_image, difficulty, duration_minutes, location_type,
    min_locations, max_locations, structure, features, base_price, status, published_at
) VALUES
(
    1, 1, 
    'Детективное свидание в парке',
    'detective-park-date',
    'Раскройте тайну вместе в романтической атмосфере',
    'Погрузитесь в атмосферу детективного расследования! Вы и ваша вторая половинка становитесь частными детективами, которые должны раскрыть романтическую тайну, спрятанную в разных уголках парка. Каждая улика приближает вас к разгадке и к особенному сюрпризу в конце.',
    '/templates/detective-park.jpg',
    'medium',
    120,
    'park',
    4, 6,
    '{
        "intro": {"type": "story", "required": true},
        "locations": [
            {"name": "Скамейка у пруда", "task_type": "riddle"},
            {"name": "Фонтан", "task_type": "photo"},
            {"name": "Старый дуб", "task_type": "code"},
            {"name": "Мостик", "task_type": "puzzle"}
        ],
        "finale": {"type": "surprise", "required": true}
    }',
    '["загадки", "фото-задания", "подсказки", "романтическая история"]',
    2990,
    'published',
    CURRENT_TIMESTAMP
),
(
    1, 2,
    'Охота за сокровищами по городу',
    'city-treasure-hunt',
    'Найдите клад в самом сердце города',
    'Станьте настоящими охотниками за сокровищами! Карта приведет вас к различным локациям города, где спрятаны подсказки. Решайте головоломки, выполняйте задания и найдите главный приз!',
    '/templates/treasure-hunt.jpg',
    'easy',
    90,
    'city',
    3, 5,
    '{
        "intro": {"type": "map", "required": true},
        "checkpoints": 5,
        "final_treasure": true
    }',
    '["карта сокровищ", "QR-коды", "простые загадки", "финальный приз"]',
    1990,
    'published',
    CURRENT_TIMESTAMP
),
(
    1, 1,
    'Путешествие во времени',
    'time-travel-romance',
    'Вернитесь к началу вашей истории любви',
    'Отправьтесь в путешествие по местам, которые стали вехами вашей любви. Каждая локация — это глава вашей общей истории, наполненная воспоминаниями, сюрпризами и романтическими моментами.',
    '/templates/time-travel.jpg',
    'medium',
    150,
    'universal',
    5, 8,
    '{
        "timeline": true,
        "memory_blocks": 6,
        "photo_album": true,
        "future_vision": true
    }',
    '["персональная история", "фотографии", "видео-послания", "сюрпризы"]',
    4990,
    'published',
    CURRENT_TIMESTAMP
);

-- Связь шаблонов с тегами
INSERT INTO template_tags (template_id, tag_id) VALUES
-- Детективное свидание
(1, 1), (1, 3), (1, 4), (1, 6), (1, 9), (1, 13),
-- Охота за сокровищами
(2, 1), (2, 3), (2, 6), (2, 8), (2, 11),
-- Путешествие во времени
(3, 2), (3, 4), (3, 6), (3, 10), (3, 13);

-- Демо отзывы
INSERT INTO reviews (template_id, client_name, rating, title, comment, is_verified, is_featured) VALUES
(1, 'Анна К.', 5, 'Лучшее свидание в моей жизни!', 
'Парень организовал для меня этот квест, и я была в полном восторге! Каждая загадка была продумана, все задания интересные. В конце ждал сюрприз - он сделал предложение! Спасибо за незабываемые эмоции!', 
true, true),

(1, 'Дмитрий М.', 5, 'Отличная идея для свидания', 
'Искал что-то необычное для годовщины. Этот квест — просто находка! Девушке очень понравилось, весь вечер мы смеялись и разгадывали загадки. Рекомендую!', 
true, false),

(2, 'Екатерина Л.', 4, 'Интересно и весело', 
'Проходили квест с друзьями. Очень понравилось! Единственное - хотелось бы побольше сложных заданий, но в целом отлично!', 
true, false);

-- Функция для генерации slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_text TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT;
    counter INTEGER := 0;
    exists_check BOOLEAN;
BEGIN
    new_slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
    new_slug := trim(both '-' from new_slug);
    
    LOOP
        IF table_name = 'quest_templates' THEN
            SELECT EXISTS(SELECT 1 FROM quest_templates WHERE slug = new_slug) INTO exists_check;
        ELSIF table_name = 'created_quests' THEN
            SELECT EXISTS(SELECT 1 FROM created_quests WHERE slug = new_slug) INTO exists_check;
        END IF;
        
        EXIT WHEN NOT exists_check;
        
        counter := counter + 1;
        new_slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || counter;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Комментарии
COMMENT ON TABLE quest_templates IS 'Публичное портфолио шаблонов квестов (маркетплейс)';
COMMENT ON TABLE created_quests IS 'Созданные квесты для клиентов (приватные)';
COMMENT ON TABLE authors IS 'Авторы шаблонов квестов';
COMMENT ON TABLE reviews IS 'Отзывы клиентов на шаблоны';

-- Успешное завершение
SELECT 
    'Database schema v2 created successfully!' || E'\n' ||
    '✓ ' || (SELECT COUNT(*) FROM categories) || ' categories' || E'\n' ||
    '✓ ' || (SELECT COUNT(*) FROM tags) || ' tags' || E'\n' ||
    '✓ ' || (SELECT COUNT(*) FROM quest_templates) || ' demo templates' || E'\n' ||
    '✓ ' || (SELECT COUNT(*) FROM reviews) || ' demo reviews'
as result;