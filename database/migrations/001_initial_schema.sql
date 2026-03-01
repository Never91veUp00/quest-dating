-- Quest Dating - Clean Schema (UTF-8)
-- Только структура таблиц, без демо-данных

-- ============================================
-- АВТОРЫ
-- ============================================

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    total_templates INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- КАТЕГОРИИ
-- ============================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ТЕГИ
-- ============================================

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ШАБЛОНЫ КВЕСТОВ
-- ============================================

CREATE TABLE quest_templates (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tagline VARCHAR(200),
    description TEXT NOT NULL,
    cover_image VARCHAR(500),
    gallery JSONB DEFAULT '[]',
    demo_video_url VARCHAR(500),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    duration_minutes INTEGER,
    location_type VARCHAR(50) CHECK (location_type IN ('city', 'indoor', 'park', 'universal')),
    min_locations INTEGER,
    max_locations INTEGER,
    structure JSONB NOT NULL,
    features JSONB DEFAULT '[]',
    customization_options JSONB DEFAULT '{}',
    views_count INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    base_price INTEGER,
    is_free BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    published_at TIMESTAMP,
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- СВЯЗЬ ШАБЛОНОВ И ТЕГОВ
-- ============================================

CREATE TABLE template_tags (
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

-- ============================================
-- ОТЗЫВЫ
-- ============================================

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE CASCADE,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    images JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ЗАКАЗЫ
-- ============================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    description TEXT NOT NULL,
    event_date TIMESTAMP,
    event_city VARCHAR(100),
    customization JSONB DEFAULT '{}',
    selected_features JSONB DEFAULT '[]',
    base_price INTEGER,
    additional_costs INTEGER DEFAULT 0,
    total_price INTEGER,
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    created_quest_id INTEGER,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- СОЗДАННЫЕ КВЕСТЫ
-- ============================================

CREATE TABLE created_quests (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE SET NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    access_code VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    blocks JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    started_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавить внешний ключ обратно
ALTER TABLE orders ADD CONSTRAINT fk_orders_created_quest 
    FOREIGN KEY (created_quest_id) REFERENCES created_quests(id) ON DELETE SET NULL;

-- ============================================
-- СЕССИИ ПРОХОЖДЕНИЯ
-- ============================================

CREATE TABLE quest_sessions (
    id SERIAL PRIMARY KEY,
    created_quest_id INTEGER REFERENCES created_quests(id) ON DELETE CASCADE,
    session_id UUID DEFAULT gen_random_uuid(),
    completed_tasks JSONB DEFAULT '[]',
    current_block_position INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_time_seconds INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

CREATE INDEX idx_authors_username ON authors(username);
CREATE INDEX idx_authors_verified ON authors(is_verified);

CREATE INDEX idx_templates_slug ON quest_templates(slug);
CREATE INDEX idx_templates_author ON quest_templates(author_id);
CREATE INDEX idx_templates_category ON quest_templates(category_id);
CREATE INDEX idx_templates_status ON quest_templates(status);
CREATE INDEX idx_templates_published ON quest_templates(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_templates_rating ON quest_templates(rating DESC);
CREATE INDEX idx_templates_orders ON quest_templates(orders_count DESC);
CREATE INDEX idx_templates_search ON quest_templates USING gin(to_tsvector('russian', title || ' ' || description));

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_template_tags_template ON template_tags(template_id);
CREATE INDEX idx_template_tags_tag ON template_tags(tag_id);

CREATE INDEX idx_reviews_template ON reviews(template_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

CREATE INDEX idx_orders_template ON orders(template_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE INDEX idx_created_quests_slug ON created_quests(slug);
CREATE INDEX idx_created_quests_order ON created_quests(order_id);

CREATE INDEX idx_sessions_quest ON quest_sessions(created_quest_id);
CREATE INDEX idx_sessions_id ON quest_sessions(session_id);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

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

-- Обновление рейтинга шаблона
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

-- Success message
SELECT 'Clean schema created successfully!' as result;