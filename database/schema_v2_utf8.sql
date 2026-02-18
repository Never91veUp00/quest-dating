-- Quest Marketplace Platform Database Schema
-- РџРµСЂРµСЂР°Р±РѕС‚Р°РЅРЅР°СЏ РІРµСЂСЃРёСЏ РґР»СЏ РјР°СЂРєРµС‚РїР»РµР№СЃР° С€Р°Р±Р»РѕРЅРѕРІ

-- Р’РєР»СЋС‡РёС‚СЊ СЂР°СЃС€РёСЂРµРЅРёСЏ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Р”Р»СЏ РїРѕРёСЃРєР°

-- ============================================
-- РџРћР›Р¬Р—РћР’РђРўР•Р›Р Р РђР’РўРћР Р«
-- ============================================

-- РўР°Р±Р»РёС†Р° Р°РІС‚РѕСЂРѕРІ С€Р°Р±Р»РѕРЅРѕРІ
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
-- РљРђРўР•Р“РћР РР Р РўР•Р“Р
-- ============================================

-- РљР°С‚РµРіРѕСЂРёРё РєРІРµСЃС‚РѕРІ
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji РёР»Рё РёРєРѕРЅРєР°
    color VARCHAR(20), -- hex С†РІРµС‚ РґР»СЏ UI
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- РўРµРіРё РґР»СЏ РєРІРµСЃС‚РѕРІ
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- РЁРђР‘Р›РћРќР« РљР’Р•РЎРўРћР’ (РџРћР РўР¤РћР›РРћ)
-- ============================================

-- РћСЃРЅРѕРІРЅР°СЏ С‚Р°Р±Р»РёС†Р° С€Р°Р±Р»РѕРЅРѕРІ (РїСѓР±Р»РёС‡РЅРѕРµ РїРѕСЂС‚С„РѕР»РёРѕ)
CREATE TABLE quest_templates (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    
    -- РћСЃРЅРѕРІРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tagline VARCHAR(200), -- РљРѕСЂРѕС‚РєРѕРµ РѕРїРёСЃР°РЅРёРµ РґР»СЏ РєР°СЂС‚РѕС‡РєРё
    description TEXT NOT NULL,
    
    -- РњРµРґРёР°
    cover_image VARCHAR(500), -- Р“Р»Р°РІРЅРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ
    gallery JSONB DEFAULT '[]', -- РњР°СЃСЃРёРІ URL РёР·РѕР±СЂР°Р¶РµРЅРёР№
    demo_video_url VARCHAR(500),
    
    -- РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё РєРІРµСЃС‚Р°
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    duration_minutes INTEGER,
    location_type VARCHAR(50) CHECK (location_type IN ('city', 'indoor', 'park', 'universal')),
    min_locations INTEGER,
    max_locations INTEGER,
    
    -- РЎС‚СЂСѓРєС‚СѓСЂР° Рё РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё
    structure JSONB NOT NULL, -- Р”РµС‚Р°Р»СЊРЅР°СЏ СЃС‚СЂСѓРєС‚СѓСЂР° Р±Р»РѕРєРѕРІ
    features JSONB DEFAULT '[]', -- ["Р·Р°РіР°РґРєРё", "С„РѕС‚Рѕ-Р·Р°РґР°РЅРёСЏ", "QR-РєРѕРґС‹"]
    customization_options JSONB DEFAULT '{}', -- Р§С‚Рѕ РјРѕР¶РЅРѕ РЅР°СЃС‚СЂРѕРёС‚СЊ
    
    -- РЎС‚Р°С‚РёСЃС‚РёРєР° Рё СЂРµР№С‚РёРЅРіРё
    views_count INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Р¦РµРЅС‹ Рё РґРѕСЃС‚СѓРїРЅРѕСЃС‚СЊ
    base_price INTEGER, -- Р’ РєРѕРїРµР№РєР°С… (РЅР°РїСЂРёРјРµСЂ, 2990 СЂСѓР±Р»РµР№ = 299000)
    is_free BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    
    -- РЎС‚Р°С‚СѓСЃ РїСѓР±Р»РёРєР°С†РёРё
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    published_at TIMESTAMP,
    
    -- SEO
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- РЎРІСЏР·СЊ С€Р°Р±Р»РѕРЅРѕРІ СЃ С‚РµРіР°РјРё (many-to-many)
CREATE TABLE template_tags (
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (template_id, tag_id)
);

-- ============================================
-- РћРўР—Р«Р’Р« Р Р Р•Р™РўРРќР“Р
-- ============================================

-- РћС‚Р·С‹РІС‹ РЅР° С€Р°Р±Р»РѕРЅС‹
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE CASCADE,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    images JSONB DEFAULT '[]', -- Р¤РѕС‚Рѕ РѕС‚ РєР»РёРµРЅС‚РѕРІ
    is_verified BOOLEAN DEFAULT false, -- РџРѕРґС‚РІРµСЂР¶РґРµРЅРЅС‹Р№ Р·Р°РєР°Р·
    is_featured BOOLEAN DEFAULT false, -- Р’С‹РґРµР»РµРЅРЅС‹Р№ РѕС‚Р·С‹РІ
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Р—РђРљРђР—Р«
-- ============================================

-- РўР°Р±Р»РёС†Р° Р·Р°РєР°Р·РѕРІ (РѕР±РЅРѕРІР»РµРЅРЅР°СЏ)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE SET NULL,
    
    -- РРЅС„РѕСЂРјР°С†РёСЏ Рѕ РєР»РёРµРЅС‚Рµ
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    
    -- Р”РµС‚Р°Р»Рё Р·Р°РєР°Р·Р°
    description TEXT NOT NULL, -- РћРїРёСЃР°РЅРёРµ Р·Р°РґСѓРјРєРё РєР»РёРµРЅС‚Р°
    event_date TIMESTAMP,
    event_city VARCHAR(100),
    
    -- РљР°СЃС‚РѕРјРёР·Р°С†РёСЏ РЅР° РѕСЃРЅРѕРІРµ С€Р°Р±Р»РѕРЅР°
    customization JSONB DEFAULT '{}', -- Р’С‹Р±СЂР°РЅРЅС‹Рµ РѕРїС†РёРё РёР· template.customization_options
    selected_features JSONB DEFAULT '[]',
    
    -- Р¦РµРЅРѕРѕР±СЂР°Р·РѕРІР°РЅРёРµ
    base_price INTEGER, -- Р¦РµРЅР° С€Р°Р±Р»РѕРЅР° РЅР° РјРѕРјРµРЅС‚ Р·Р°РєР°Р·Р°
    additional_costs INTEGER DEFAULT 0,
    total_price INTEGER,
    
    -- РЎС‚Р°С‚СѓСЃ Р·Р°РєР°Р·Р°
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    
    -- РЎРІСЏР·Р°РЅРЅС‹Р№ СЃРѕР·РґР°РЅРЅС‹Р№ РєРІРµСЃС‚
    created_quest_id INTEGER, -- Р‘СѓРґРµС‚ СЃСЃС‹Р»Р°С‚СЊСЃСЏ РЅР° С‚Р°Р±Р»РёС†Сѓ created_quests
    
    -- Р’РЅСѓС‚СЂРµРЅРЅРёРµ Р·Р°РјРµС‚РєРё
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- РЎРћР—Р”РђРќРќР«Р• РљР’Р•РЎРўР« (РґР»СЏ РєР»РёРµРЅС‚РѕРІ)
-- ============================================

-- Р“РѕС‚РѕРІС‹Рµ РєРІРµСЃС‚С‹ РґР»СЏ РєР»РёРµРЅС‚РѕРІ (РїСЂРёРІР°С‚РЅС‹Рµ)
CREATE TABLE created_quests (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    template_id INTEGER REFERENCES quest_templates(id) ON DELETE SET NULL,
    
    -- РЈРЅРёРєР°Р»СЊРЅС‹Р№ РґРѕСЃС‚СѓРї
    slug VARCHAR(100) UNIQUE NOT NULL,
    access_code VARCHAR(50), -- РћРїС†РёРѕРЅР°Р»СЊРЅС‹Р№ РєРѕРґ РґРѕСЃС‚СѓРїР°
    
    -- РРЅС„РѕСЂРјР°С†РёСЏ
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    
    -- РљРѕРЅС‚РµРЅС‚ РєРІРµСЃС‚Р°
    blocks JSONB NOT NULL, -- РњР°СЃСЃРёРІ Р±Р»РѕРєРѕРІ РєРѕРЅС‚РµРЅС‚Р°
    
    -- РќР°СЃС‚СЂРѕР№РєРё РґРѕСЃС‚СѓРїР°
    is_public BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    started_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    
    -- РЎСЂРѕРєРё Р¶РёР·РЅРё
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- РџР РћР“Р Р•РЎРЎ РџР РћРҐРћР–Р”Р•РќРРЇ
-- ============================================

-- РЎРµСЃСЃРёРё РїСЂРѕС…РѕР¶РґРµРЅРёСЏ РєРІРµСЃС‚РѕРІ
CREATE TABLE quest_sessions (
    id SERIAL PRIMARY KEY,
    created_quest_id INTEGER REFERENCES created_quests(id) ON DELETE CASCADE,
    session_id UUID DEFAULT uuid_generate_v4(),
    
    -- РџСЂРѕРіСЂРµСЃСЃ
    completed_tasks JSONB DEFAULT '[]',
    current_block_position INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    
    -- Р’СЂРµРјРµРЅРЅС‹Рµ РјРµС‚РєРё
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- РЎС‚Р°С‚РёСЃС‚РёРєР°
    total_time_seconds INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0
);

-- ============================================
-- РРќР”Р•РљРЎР«
-- ============================================

-- РђРІС‚РѕСЂС‹
CREATE INDEX idx_authors_username ON authors(username);
CREATE INDEX idx_authors_verified ON authors(is_verified);

-- РЁР°Р±Р»РѕРЅС‹
CREATE INDEX idx_templates_slug ON quest_templates(slug);
CREATE INDEX idx_templates_author ON quest_templates(author_id);
CREATE INDEX idx_templates_category ON quest_templates(category_id);
CREATE INDEX idx_templates_status ON quest_templates(status);
CREATE INDEX idx_templates_published ON quest_templates(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_templates_rating ON quest_templates(rating DESC);
CREATE INDEX idx_templates_orders ON quest_templates(orders_count DESC);
CREATE INDEX idx_templates_search ON quest_templates USING gin(to_tsvector('russian', title || ' ' || description));

-- РўРµРіРё
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_template_tags_template ON template_tags(template_id);
CREATE INDEX idx_template_tags_tag ON template_tags(tag_id);

-- РћС‚Р·С‹РІС‹
CREATE INDEX idx_reviews_template ON reviews(template_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- Р—Р°РєР°Р·С‹
CREATE INDEX idx_orders_template ON orders(template_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- РЎРѕР·РґР°РЅРЅС‹Рµ РєРІРµСЃС‚С‹
CREATE INDEX idx_created_quests_slug ON created_quests(slug);
CREATE INDEX idx_created_quests_order ON created_quests(order_id);

-- РЎРµСЃСЃРёРё
CREATE INDEX idx_sessions_quest ON quest_sessions(created_quest_id);
CREATE INDEX idx_sessions_id ON quest_sessions(session_id);

-- ============================================
-- РўР РР“Р“Р•Р Р«
-- ============================================

-- РђРІС‚РѕРѕР±РЅРѕРІР»РµРЅРёРµ updated_at
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

-- РћР±РЅРѕРІР»РµРЅРёРµ СЃС‡РµС‚С‡РёРєР° С‚РµРіРѕРІ
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

-- РћР±РЅРѕРІР»РµРЅРёРµ СЂРµР№С‚РёРЅРіР° С€Р°Р±Р»РѕРЅР° РїСЂРё РґРѕР±Р°РІР»РµРЅРёРё РѕС‚Р·С‹РІР°
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

-- РћР±РЅРѕРІР»РµРЅРёРµ СЃС‚Р°С‚РёСЃС‚РёРєРё Р°РІС‚РѕСЂР°
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
-- РџР Р•Р”РЎРўРђР’Р›Р•РќРРЇ (VIEWS)
-- ============================================

-- РџРѕРїСѓР»СЏСЂРЅС‹Рµ С€Р°Р±Р»РѕРЅС‹
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

-- РќРѕРІС‹Рµ С€Р°Р±Р»РѕРЅС‹
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

-- РўРѕРї Р°РІС‚РѕСЂС‹
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
-- Р”Р•РњРћ Р”РђРќРќР«Р•
-- ============================================

-- РљР°С‚РµРіРѕСЂРёРё
INSERT INTO categories (name, slug, description, icon, color, position) VALUES
('Р РѕРјР°РЅС‚РёРєР°', 'romance', 'РљРІРµСЃС‚С‹ РґР»СЏ СЃРІРёРґР°РЅРёР№ Рё СЂРѕРјР°РЅС‚РёС‡РµСЃРєРёС… СЃРѕР±С‹С‚РёР№', 'рџ’ќ', '#FF6B9D', 1),
('РџСЂРёРєР»СЋС‡РµРЅРёСЏ', 'adventure', 'РђРєС‚РёРІРЅС‹Рµ РіРѕСЂРѕРґСЃРєРёРµ РєРІРµСЃС‚С‹ СЃ Р·Р°РіР°РґРєР°РјРё', 'рџ—єпёЏ', '#4A90E2', 2),
('Р”РµС‚РµРєС‚РёРІ', 'detective', 'Р Р°СЃСЃР»РµРґРѕРІР°РЅРёСЏ Рё РїРѕРёСЃРє СѓР»РёРє', 'рџ•µпёЏ', '#7B68EE', 3),
('Р”Р»СЏ РґРµС‚РµР№', 'kids', 'РЎРµРјРµР№РЅС‹Рµ РєРІРµСЃС‚С‹ Рё РґРµС‚СЃРєРёРµ РїСЂР°Р·РґРЅРёРєРё', 'рџЋ€', '#FFB347', 4),
('РљРѕСЂРїРѕСЂР°С‚РёРІ', 'corporate', 'РўРёРјР±РёР»РґРёРЅРі Рё РєРѕСЂРїРѕСЂР°С‚РёРІРЅС‹Рµ РјРµСЂРѕРїСЂРёСЏС‚РёСЏ', 'рџ‘”', '#2ECC71', 5),
('РџСЂР°Р·РґРЅРёРєРё', 'celebrations', 'Р”РЅРё СЂРѕР¶РґРµРЅРёСЏ, СЋР±РёР»РµРё, РѕСЃРѕР±С‹Рµ РґР°С‚С‹', 'рџЋ‰', '#E74C3C', 6);

-- РўРµРіРё
INSERT INTO tags (name, slug) VALUES
('Р·Р°РіР°РґРєРё', 'riddles'),
('С„РѕС‚Рѕ-Р·Р°РґР°РЅРёСЏ', 'photo-tasks'),
('QR-РєРѕРґС‹', 'qr-codes'),
('РїРѕРґСЃРєР°Р·РєРё', 'hints'),
('С‚Р°Р№РјРµСЂ', 'timer'),
('РґР»СЏ РґРІРѕРёС…', 'for-two'),
('РіСЂСѓРїРїРѕРІРѕР№', 'group'),
('РіРѕСЂРѕРґСЃРєРѕР№', 'city'),
('РґРѕРјР°С€РЅРёР№', 'home'),
('РїР°СЂРє', 'park'),
('Р»РµРіРєРёР№', 'easy'),
('СЃР»РѕР¶РЅС‹Р№', 'hard'),
('СЂРѕРјР°РЅС‚РёРєР°', 'romantic'),
('СЃРјРµС€РЅРѕР№', 'funny'),
('РёРЅС‚РµР»Р»РµРєС‚СѓР°Р»СЊРЅС‹Р№', 'intellectual');

-- Р”РµРјРѕ Р°РІС‚РѕСЂ
INSERT INTO authors (username, email, display_name, bio, avatar_url, is_verified) VALUES
('questmaster', 'admin@questdating.com', 'Quest Master', 
'РџСЂРѕС„РµСЃСЃРёРѕРЅР°Р»СЊРЅС‹Р№ СЃРѕР·РґР°С‚РµР»СЊ РєРІРµСЃС‚РѕРІ СЃ РѕРїС‹С‚РѕРј Р±РѕР»РµРµ 5 Р»РµС‚. РЎРѕР·РґР°Р» Р±РѕР»РµРµ 200 СѓРЅРёРєР°Р»СЊРЅС‹С… СЃС†РµРЅР°СЂРёРµРІ.', 
'/avatars/questmaster.jpg', true);

-- Р”РµРјРѕ С€Р°Р±Р»РѕРЅС‹
INSERT INTO quest_templates (
    author_id, category_id, title, slug, tagline, description, 
    cover_image, difficulty, duration_minutes, location_type,
    min_locations, max_locations, structure, features, base_price, status, published_at
) VALUES
(
    1, 1, 
    'Р”РµС‚РµРєС‚РёРІРЅРѕРµ СЃРІРёРґР°РЅРёРµ РІ РїР°СЂРєРµ',
    'detective-park-date',
    'Р Р°СЃРєСЂРѕР№С‚Рµ С‚Р°Р№РЅСѓ РІРјРµСЃС‚Рµ РІ СЂРѕРјР°РЅС‚РёС‡РµСЃРєРѕР№ Р°С‚РјРѕСЃС„РµСЂРµ',
    'РџРѕРіСЂСѓР·РёС‚РµСЃСЊ РІ Р°С‚РјРѕСЃС„РµСЂСѓ РґРµС‚РµРєС‚РёРІРЅРѕРіРѕ СЂР°СЃСЃР»РµРґРѕРІР°РЅРёСЏ! Р’С‹ Рё РІР°С€Р° РІС‚РѕСЂР°СЏ РїРѕР»РѕРІРёРЅРєР° СЃС‚Р°РЅРѕРІРёС‚РµСЃСЊ С‡Р°СЃС‚РЅС‹РјРё РґРµС‚РµРєС‚РёРІР°РјРё, РєРѕС‚РѕСЂС‹Рµ РґРѕР»Р¶РЅС‹ СЂР°СЃРєСЂС‹С‚СЊ СЂРѕРјР°РЅС‚РёС‡РµСЃРєСѓСЋ С‚Р°Р№РЅСѓ, СЃРїСЂСЏС‚Р°РЅРЅСѓСЋ РІ СЂР°Р·РЅС‹С… СѓРіРѕР»РєР°С… РїР°СЂРєР°. РљР°Р¶РґР°СЏ СѓР»РёРєР° РїСЂРёР±Р»РёР¶Р°РµС‚ РІР°СЃ Рє СЂР°Р·РіР°РґРєРµ Рё Рє РѕСЃРѕР±РµРЅРЅРѕРјСѓ СЃСЋСЂРїСЂРёР·Сѓ РІ РєРѕРЅС†Рµ.',
    '/templates/detective-park.jpg',
    'medium',
    120,
    'park',
    4, 6,
    '{
        "intro": {"type": "story", "required": true},
        "locations": [
            {"name": "РЎРєР°РјРµР№РєР° Сѓ РїСЂСѓРґР°", "task_type": "riddle"},
            {"name": "Р¤РѕРЅС‚Р°РЅ", "task_type": "photo"},
            {"name": "РЎС‚Р°СЂС‹Р№ РґСѓР±", "task_type": "code"},
            {"name": "РњРѕСЃС‚РёРє", "task_type": "puzzle"}
        ],
        "finale": {"type": "surprise", "required": true}
    }',
    '["Р·Р°РіР°РґРєРё", "С„РѕС‚Рѕ-Р·Р°РґР°РЅРёСЏ", "РїРѕРґСЃРєР°Р·РєРё", "СЂРѕРјР°РЅС‚РёС‡РµСЃРєР°СЏ РёСЃС‚РѕСЂРёСЏ"]',
    2990,
    'published',
    CURRENT_TIMESTAMP
),
(
    1, 2,
    'РћС…РѕС‚Р° Р·Р° СЃРѕРєСЂРѕРІРёС‰Р°РјРё РїРѕ РіРѕСЂРѕРґСѓ',
    'city-treasure-hunt',
    'РќР°Р№РґРёС‚Рµ РєР»Р°Рґ РІ СЃР°РјРѕРј СЃРµСЂРґС†Рµ РіРѕСЂРѕРґР°',
    'РЎС‚Р°РЅСЊС‚Рµ РЅР°СЃС‚РѕСЏС‰РёРјРё РѕС…РѕС‚РЅРёРєР°РјРё Р·Р° СЃРѕРєСЂРѕРІРёС‰Р°РјРё! РљР°СЂС‚Р° РїСЂРёРІРµРґРµС‚ РІР°СЃ Рє СЂР°Р·Р»РёС‡РЅС‹Рј Р»РѕРєР°С†РёСЏРј РіРѕСЂРѕРґР°, РіРґРµ СЃРїСЂСЏС‚Р°РЅС‹ РїРѕРґСЃРєР°Р·РєРё. Р РµС€Р°Р№С‚Рµ РіРѕР»РѕРІРѕР»РѕРјРєРё, РІС‹РїРѕР»РЅСЏР№С‚Рµ Р·Р°РґР°РЅРёСЏ Рё РЅР°Р№РґРёС‚Рµ РіР»Р°РІРЅС‹Р№ РїСЂРёР·!',
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
    '["РєР°СЂС‚Р° СЃРѕРєСЂРѕРІРёС‰", "QR-РєРѕРґС‹", "РїСЂРѕСЃС‚С‹Рµ Р·Р°РіР°РґРєРё", "С„РёРЅР°Р»СЊРЅС‹Р№ РїСЂРёР·"]',
    1990,
    'published',
    CURRENT_TIMESTAMP
),
(
    1, 1,
    'РџСѓС‚РµС€РµСЃС‚РІРёРµ РІРѕ РІСЂРµРјРµРЅРё',
    'time-travel-romance',
    'Р’РµСЂРЅРёС‚РµСЃСЊ Рє РЅР°С‡Р°Р»Сѓ РІР°С€РµР№ РёСЃС‚РѕСЂРёРё Р»СЋР±РІРё',
    'РћС‚РїСЂР°РІСЊС‚РµСЃСЊ РІ РїСѓС‚РµС€РµСЃС‚РІРёРµ РїРѕ РјРµСЃС‚Р°Рј, РєРѕС‚РѕСЂС‹Рµ СЃС‚Р°Р»Рё РІРµС…Р°РјРё РІР°С€РµР№ Р»СЋР±РІРё. РљР°Р¶РґР°СЏ Р»РѕРєР°С†РёСЏ вЂ” СЌС‚Рѕ РіР»Р°РІР° РІР°С€РµР№ РѕР±С‰РµР№ РёСЃС‚РѕСЂРёРё, РЅР°РїРѕР»РЅРµРЅРЅР°СЏ РІРѕСЃРїРѕРјРёРЅР°РЅРёСЏРјРё, СЃСЋСЂРїСЂРёР·Р°РјРё Рё СЂРѕРјР°РЅС‚РёС‡РµСЃРєРёРјРё РјРѕРјРµРЅС‚Р°РјРё.',
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
    '["РїРµСЂСЃРѕРЅР°Р»СЊРЅР°СЏ РёСЃС‚РѕСЂРёСЏ", "С„РѕС‚РѕРіСЂР°С„РёРё", "РІРёРґРµРѕ-РїРѕСЃР»Р°РЅРёСЏ", "СЃСЋСЂРїСЂРёР·С‹"]',
    4990,
    'published',
    CURRENT_TIMESTAMP
);

-- РЎРІСЏР·СЊ С€Р°Р±Р»РѕРЅРѕРІ СЃ С‚РµРіР°РјРё
INSERT INTO template_tags (template_id, tag_id) VALUES
-- Р”РµС‚РµРєС‚РёРІРЅРѕРµ СЃРІРёРґР°РЅРёРµ
(1, 1), (1, 3), (1, 4), (1, 6), (1, 9), (1, 13),
-- РћС…РѕС‚Р° Р·Р° СЃРѕРєСЂРѕРІРёС‰Р°РјРё
(2, 1), (2, 3), (2, 6), (2, 8), (2, 11),
-- РџСѓС‚РµС€РµСЃС‚РІРёРµ РІРѕ РІСЂРµРјРµРЅРё
(3, 2), (3, 4), (3, 6), (3, 10), (3, 13);

-- Р”РµРјРѕ РѕС‚Р·С‹РІС‹
INSERT INTO reviews (template_id, client_name, rating, title, comment, is_verified, is_featured) VALUES
(1, 'РђРЅРЅР° Рљ.', 5, 'Р›СѓС‡С€РµРµ СЃРІРёРґР°РЅРёРµ РІ РјРѕРµР№ Р¶РёР·РЅРё!', 
'РџР°СЂРµРЅСЊ РѕСЂРіР°РЅРёР·РѕРІР°Р» РґР»СЏ РјРµРЅСЏ СЌС‚РѕС‚ РєРІРµСЃС‚, Рё СЏ Р±С‹Р»Р° РІ РїРѕР»РЅРѕРј РІРѕСЃС‚РѕСЂРіРµ! РљР°Р¶РґР°СЏ Р·Р°РіР°РґРєР° Р±С‹Р»Р° РїСЂРѕРґСѓРјР°РЅР°, РІСЃРµ Р·Р°РґР°РЅРёСЏ РёРЅС‚РµСЂРµСЃРЅС‹Рµ. Р’ РєРѕРЅС†Рµ Р¶РґР°Р» СЃСЋСЂРїСЂРёР· - РѕРЅ СЃРґРµР»Р°Р» РїСЂРµРґР»РѕР¶РµРЅРёРµ! РЎРїР°СЃРёР±Рѕ Р·Р° РЅРµР·Р°Р±С‹РІР°РµРјС‹Рµ СЌРјРѕС†РёРё!', 
true, true),

(1, 'Р”РјРёС‚СЂРёР№ Рњ.', 5, 'РћС‚Р»РёС‡РЅР°СЏ РёРґРµСЏ РґР»СЏ СЃРІРёРґР°РЅРёСЏ', 
'РСЃРєР°Р» С‡С‚Рѕ-С‚Рѕ РЅРµРѕР±С‹С‡РЅРѕРµ РґР»СЏ РіРѕРґРѕРІС‰РёРЅС‹. Р­С‚РѕС‚ РєРІРµСЃС‚ вЂ” РїСЂРѕСЃС‚Рѕ РЅР°С…РѕРґРєР°! Р”РµРІСѓС€РєРµ РѕС‡РµРЅСЊ РїРѕРЅСЂР°РІРёР»РѕСЃСЊ, РІРµСЃСЊ РІРµС‡РµСЂ РјС‹ СЃРјРµСЏР»РёСЃСЊ Рё СЂР°Р·РіР°РґС‹РІР°Р»Рё Р·Р°РіР°РґРєРё. Р РµРєРѕРјРµРЅРґСѓСЋ!', 
true, false),

(2, 'Р•РєР°С‚РµСЂРёРЅР° Р›.', 4, 'РРЅС‚РµСЂРµСЃРЅРѕ Рё РІРµСЃРµР»Рѕ', 
'РџСЂРѕС…РѕРґРёР»Рё РєРІРµСЃС‚ СЃ РґСЂСѓР·СЊСЏРјРё. РћС‡РµРЅСЊ РїРѕРЅСЂР°РІРёР»РѕСЃСЊ! Р•РґРёРЅСЃС‚РІРµРЅРЅРѕРµ - С…РѕС‚РµР»РѕСЃСЊ Р±С‹ РїРѕР±РѕР»СЊС€Рµ СЃР»РѕР¶РЅС‹С… Р·Р°РґР°РЅРёР№, РЅРѕ РІ С†РµР»РѕРј РѕС‚Р»РёС‡РЅРѕ!', 
true, false);

-- Р¤СѓРЅРєС†РёСЏ РґР»СЏ РіРµРЅРµСЂР°С†РёРё slug
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

-- РљРѕРјРјРµРЅС‚Р°СЂРёРё
COMMENT ON TABLE quest_templates IS 'РџСѓР±Р»РёС‡РЅРѕРµ РїРѕСЂС‚С„РѕР»РёРѕ С€Р°Р±Р»РѕРЅРѕРІ РєРІРµСЃС‚РѕРІ (РјР°СЂРєРµС‚РїР»РµР№СЃ)';
COMMENT ON TABLE created_quests IS 'РЎРѕР·РґР°РЅРЅС‹Рµ РєРІРµСЃС‚С‹ РґР»СЏ РєР»РёРµРЅС‚РѕРІ (РїСЂРёРІР°С‚РЅС‹Рµ)';
COMMENT ON TABLE authors IS 'РђРІС‚РѕСЂС‹ С€Р°Р±Р»РѕРЅРѕРІ РєРІРµСЃС‚РѕРІ';
COMMENT ON TABLE reviews IS 'РћС‚Р·С‹РІС‹ РєР»РёРµРЅС‚РѕРІ РЅР° С€Р°Р±Р»РѕРЅС‹';

-- РЈСЃРїРµС€РЅРѕРµ Р·Р°РІРµСЂС€РµРЅРёРµ
SELECT 
    'Database schema v2 created successfully!' || E'\n' ||
    'вњ“ ' || (SELECT COUNT(*) FROM categories) || ' categories' || E'\n' ||
    'вњ“ ' || (SELECT COUNT(*) FROM tags) || ' tags' || E'\n' ||
    'вњ“ ' || (SELECT COUNT(*) FROM quest_templates) || ' demo templates' || E'\n' ||
    'вњ“ ' || (SELECT COUNT(*) FROM reviews) || ' demo reviews'
as result;
