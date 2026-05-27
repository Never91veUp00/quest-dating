--
-- Quest Dating — каноничный database dump для свежей установки
--
-- Содержит:
--   - Схему (9 таблиц + индексы + FK + триггеры + функции + расширения)
--   - Seed-данные: 1 автор (Лиза Петри), 7 категорий, 23 тега, 7 шаблонов
--     квестов + связи template_tags
--   - SETVAL для всех id_seq, синхронизированы с seed-данными
--
-- НЕ содержит:
--   - Заказы клиентов (orders) — PII
--   - Отзывы (reviews) — PII (имена клиентов)
--   - Сессии прохождения (quest_sessions) — PII
--   - Созданные квесты (created_quests) — PII (имена клиентов)
--
-- Этот файл подключается через bind-mount в docker-compose.yml:
--   ./database/dump.sql:/docker-entrypoint-initdb.d/init.sql:ro
-- Постgres применяет его автоматически при ПЕРВОМ старте контейнера
-- (когда volume пустой). На последующих стартах файл игнорируется.
--
-- Для проверки развёртывания с нуля:
--   docker compose down -v   # ВНИМАНИЕ: удалит prod-данные!
--   docker compose up -d
--
-- Снят с production 27 мая 2026 командой:
--   pg_dump --schema-only --no-owner --no-privileges
--   pg_dump --data-only --no-owner --table=categories --table=tags ...
-- (см. docs/incidents.md INC-001 — почему этот файл вообще нам нужен)
--

--
-- PostgreSQL database dump
--

\restrict myLWxN3EBgCJn1DZfwHPjGap6A5wfrPsCTLKH8zuCdhhIglJWW3ANd0bgG4NbDW

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: update_author_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_author_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE authors SET
        total_templates = (SELECT COUNT(*) FROM quest_templates WHERE author_id = NEW.author_id AND status = 'published'),
        average_rating = (SELECT AVG(rating) FROM quest_templates WHERE author_id = NEW.author_id AND status = 'published')
    WHERE id = NEW.author_id;
    RETURN NEW;
END;
$$;


--
-- Name: update_tag_usage_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_tag_usage_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: update_template_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_template_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE quest_templates SET
        rating = (SELECT AVG(rating) FROM reviews WHERE template_id = NEW.template_id),
        reviews_count = (SELECT COUNT(*) FROM reviews WHERE template_id = NEW.template_id)
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authors (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    display_name character varying(100) NOT NULL,
    bio text,
    avatar_url character varying(500),
    website character varying(255),
    social_links jsonb DEFAULT '{}'::jsonb,
    is_verified boolean DEFAULT false,
    total_templates integer DEFAULT 0,
    average_rating numeric(3,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.authors_id_seq OWNED BY public.authors.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    color character varying(20),
    "position" integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: created_quests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.created_quests (
    id integer NOT NULL,
    order_id integer,
    template_id integer,
    slug character varying(100) NOT NULL,
    access_code character varying(50),
    title character varying(255) NOT NULL,
    client_name character varying(255),
    blocks jsonb NOT NULL,
    is_public boolean DEFAULT false,
    views_count integer DEFAULT 0,
    started_count integer DEFAULT 0,
    completed_count integer DEFAULT 0,
    published_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    theme character varying(20) DEFAULT 'detective'::character varying,
    final_message text,
    show_intro boolean DEFAULT true NOT NULL,
    player_version character varying(10) DEFAULT 'v1'::character varying NOT NULL,
    CONSTRAINT created_quests_theme_check CHECK (((theme)::text = ANY (ARRAY['detective'::text, 'romantic'::text, 'city'::text, 'mystery'::text, 'treasure'::text, 'proposal'::text])))
);


--
-- Name: COLUMN created_quests.theme; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.created_quests.theme IS 'Визуальная тема плеера: detective | romantic | city | mystery';


--
-- Name: COLUMN created_quests.final_message; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.created_quests.final_message IS 'Персональное послание заказчика, показывается на финальном экране';


--
-- Name: COLUMN created_quests.show_intro; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.created_quests.show_intro IS 'Показывать анимированную заставку перед сплэш-экраном';


--
-- Name: created_quests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.created_quests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: created_quests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.created_quests_id_seq OWNED BY public.created_quests.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    template_id integer,
    client_name character varying(255) NOT NULL,
    client_email character varying(255) NOT NULL,
    client_phone character varying(50),
    description text NOT NULL,
    event_date timestamp without time zone,
    event_city character varying(100),
    customization jsonb DEFAULT '{}'::jsonb,
    selected_features jsonb DEFAULT '[]'::jsonb,
    base_price integer,
    additional_costs integer DEFAULT 0,
    total_price integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_quest_id integer,
    admin_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    newsletter_consent boolean DEFAULT false,
    view_token uuid DEFAULT gen_random_uuid() NOT NULL,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('in_progress'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: COLUMN orders.newsletter_consent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.orders.newsletter_consent IS 'Согласие клиента на получение рассылки';


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: quest_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quest_sessions (
    id integer NOT NULL,
    created_quest_id integer,
    session_id uuid DEFAULT gen_random_uuid(),
    completed_tasks jsonb DEFAULT '[]'::jsonb,
    current_block_position integer DEFAULT 0,
    points integer DEFAULT 0,
    achievements jsonb DEFAULT '[]'::jsonb,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    total_time_seconds integer DEFAULT 0,
    hints_used integer DEFAULT 0
);


--
-- Name: quest_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quest_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quest_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quest_sessions_id_seq OWNED BY public.quest_sessions.id;


--
-- Name: quest_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quest_templates (
    id integer NOT NULL,
    author_id integer,
    category_id integer,
    title character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    tagline character varying(200),
    description text NOT NULL,
    cover_image character varying(500),
    gallery jsonb DEFAULT '[]'::jsonb,
    demo_video_url character varying(500),
    difficulty character varying(20),
    duration_minutes integer,
    location_type character varying(50),
    min_locations integer,
    max_locations integer,
    structure jsonb NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    customization_options jsonb DEFAULT '{}'::jsonb,
    views_count integer DEFAULT 0,
    orders_count integer DEFAULT 0,
    rating numeric(3,2) DEFAULT 0,
    reviews_count integer DEFAULT 0,
    base_price integer,
    is_free boolean DEFAULT false,
    is_premium boolean DEFAULT false,
    status character varying(20) DEFAULT 'draft'::character varying,
    published_at timestamp without time zone,
    meta_description text,
    meta_keywords character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    demo_quest_id integer,
    quick_view_description text,
    default_theme character varying(50) DEFAULT 'detective'::character varying,
    default_player_version character varying(10) DEFAULT 'v1'::character varying,
    default_show_intro boolean DEFAULT true,
    CONSTRAINT quest_templates_difficulty_check CHECK (((difficulty)::text = ANY (ARRAY[('easy'::character varying)::text, ('medium'::character varying)::text, ('hard'::character varying)::text, ('expert'::character varying)::text]))),
    CONSTRAINT quest_templates_location_type_check CHECK (((location_type)::text = ANY (ARRAY[('city'::character varying)::text, ('indoor'::character varying)::text, ('park'::character varying)::text, ('universal'::character varying)::text]))),
    CONSTRAINT quest_templates_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('review'::character varying)::text, ('published'::character varying)::text, ('archived'::character varying)::text])))
);


--
-- Name: quest_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quest_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quest_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quest_templates_id_seq OWNED BY public.quest_templates.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    template_id integer,
    client_name character varying(100) NOT NULL,
    client_email character varying(255),
    rating integer,
    title character varying(200),
    comment text,
    images jsonb DEFAULT '[]'::jsonb,
    is_verified boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    usage_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: template_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_tags (
    template_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- Name: authors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors ALTER COLUMN id SET DEFAULT nextval('public.authors_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: created_quests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.created_quests ALTER COLUMN id SET DEFAULT nextval('public.created_quests_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: quest_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_sessions ALTER COLUMN id SET DEFAULT nextval('public.quest_sessions_id_seq'::regclass);


--
-- Name: quest_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_templates ALTER COLUMN id SET DEFAULT nextval('public.quest_templates_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: authors authors_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_email_key UNIQUE (email);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: authors authors_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_username_key UNIQUE (username);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: created_quests created_quests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_pkey PRIMARY KEY (id);


--
-- Name: created_quests created_quests_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_slug_key UNIQUE (slug);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: quest_sessions quest_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_sessions
    ADD CONSTRAINT quest_sessions_pkey PRIMARY KEY (id);


--
-- Name: quest_templates quest_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_pkey PRIMARY KEY (id);


--
-- Name: quest_templates quest_templates_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_slug_key UNIQUE (slug);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: template_tags template_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_tags
    ADD CONSTRAINT template_tags_pkey PRIMARY KEY (template_id, tag_id);


--
-- Name: idx_authors_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_authors_username ON public.authors USING btree (username);


--
-- Name: idx_authors_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_authors_verified ON public.authors USING btree (is_verified);


--
-- Name: idx_categories_active_pos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_active_pos ON public.categories USING btree (is_active, "position");


--
-- Name: idx_created_quests_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_created_quests_order ON public.created_quests USING btree (order_id);


--
-- Name: idx_created_quests_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_created_quests_slug ON public.created_quests USING btree (slug);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_template ON public.orders USING btree (template_id);


--
-- Name: idx_reviews_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_created ON public.reviews USING btree (created_at DESC);


--
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating DESC);


--
-- Name: idx_reviews_rating_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_rating_created ON public.reviews USING btree (rating DESC, created_at DESC);


--
-- Name: idx_reviews_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_template ON public.reviews USING btree (template_id);


--
-- Name: idx_reviews_verified_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_verified_rating ON public.reviews USING btree (is_verified, rating DESC);


--
-- Name: idx_sessions_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_id ON public.quest_sessions USING btree (session_id);


--
-- Name: idx_sessions_quest; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_quest ON public.quest_sessions USING btree (created_quest_id);


--
-- Name: idx_tags_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tags_slug ON public.tags USING btree (slug);


--
-- Name: idx_template_tags_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_template_tags_tag ON public.template_tags USING btree (tag_id);


--
-- Name: idx_template_tags_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_template_tags_template ON public.template_tags USING btree (template_id);


--
-- Name: idx_templates_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_author ON public.quest_templates USING btree (author_id);


--
-- Name: idx_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_category ON public.quest_templates USING btree (category_id);


--
-- Name: idx_templates_orders; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_orders ON public.quest_templates USING btree (orders_count DESC);


--
-- Name: idx_templates_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_published ON public.quest_templates USING btree (published_at DESC) WHERE ((status)::text = 'published'::text);


--
-- Name: idx_templates_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_rating ON public.quest_templates USING btree (rating DESC);


--
-- Name: idx_templates_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_search ON public.quest_templates USING gin (to_tsvector('russian'::regconfig, (((title)::text || ' '::text) || description)));


--
-- Name: idx_templates_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_slug ON public.quest_templates USING btree (slug);


--
-- Name: idx_templates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_status ON public.quest_templates USING btree (status);


--
-- Name: idx_templates_status_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_status_category ON public.quest_templates USING btree (status, category_id);


--
-- Name: idx_templates_status_orders; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_status_orders ON public.quest_templates USING btree (status, orders_count DESC);


--
-- Name: idx_templates_status_premium; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_status_premium ON public.quest_templates USING btree (status, is_premium);


--
-- Name: idx_templates_status_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_status_published ON public.quest_templates USING btree (status, published_at DESC);


--
-- Name: idx_templates_tagline_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_tagline_trgm ON public.quest_templates USING gin (tagline public.gin_trgm_ops);


--
-- Name: idx_templates_title_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_title_trgm ON public.quest_templates USING gin (title public.gin_trgm_ops);


--
-- Name: orders_view_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_view_token_idx ON public.orders USING btree (view_token);


--
-- Name: quest_templates update_author_stats_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_author_stats_trigger AFTER INSERT OR UPDATE ON public.quest_templates FOR EACH ROW EXECUTE FUNCTION public.update_author_stats();


--
-- Name: authors update_authors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: template_tags update_tag_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tag_count AFTER INSERT OR DELETE ON public.template_tags FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_count();


--
-- Name: reviews update_template_rating_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_template_rating_trigger AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_template_rating();


--
-- Name: quest_templates update_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.quest_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: created_quests created_quests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: created_quests created_quests_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE SET NULL;


--
-- Name: orders fk_orders_created_quest; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_created_quest FOREIGN KEY (created_quest_id) REFERENCES public.created_quests(id) ON DELETE SET NULL;


--
-- Name: orders orders_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE SET NULL;


--
-- Name: quest_sessions quest_sessions_created_quest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_sessions
    ADD CONSTRAINT quest_sessions_created_quest_id_fkey FOREIGN KEY (created_quest_id) REFERENCES public.created_quests(id) ON DELETE CASCADE;


--
-- Name: quest_templates quest_templates_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


--
-- Name: quest_templates quest_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: quest_templates quest_templates_demo_quest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_demo_quest_id_fkey FOREIGN KEY (demo_quest_id) REFERENCES public.created_quests(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE CASCADE;


--
-- Name: template_tags template_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_tags
    ADD CONSTRAINT template_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: template_tags template_tags_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_tags
    ADD CONSTRAINT template_tags_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


--
-- DATA: seed-данные (вставлены вручную, без estrict обёртки —
-- единый estrict блок уже открыт из schema-дампа)
--

--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.authors (id, username, email, display_name, bio, avatar_url, website, social_links, is_verified, total_templates, average_rating, created_at, updated_at) FROM stdin;
6	vlad	vp.vlad00@mail.ru	Лиза Петри	Создаю персональные свидания-квесты с 2024 года. Каждый сценарий — с нуля под вашу пару: ваш город, ваши места, ваша история.	/uploads/avatars/liza.jpg	\N	{}	t	7	4.69	2026-02-20 23:59:14.038023	2026-05-27 13:52:32.033412
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, description, icon, color, "position", is_active, created_at) FROM stdin;
1	Городские квесты	city-quests	Свидание-квест по улицам и достопримечательностям вашего города. Лиза Петри создаёт маршрут из мест с историей именно для вашей пары — загадки, сюрпризы и незабываемый финал.	🏙️	#4A90E2	1	t	2026-02-11 22:43:44.497746
2	Парковые приключения	park-adventures	Романтическая прогулка-квест в парке с персональным сценарием от Лизы Петри. Задания ведут от одного уголка парка к другому — к финальному сюрпризу среди природы.	🌳	#2ECC71	2	t	2026-02-11 22:43:44.499173
3	Домашние квесты	home-quests	Квест-сюрприз для двоих не выходя из дома. Уютный домашний сценарий от Лизы Петри с заданиями, загадками и финалом — идеально для вечера вдвоём или особого повода.	🏠	#E74C3C	3	t	2026-02-11 22:43:44.499631
4	Экстремальные	extreme	Свидание-квест для пар, которые любят адреналин и нестандартные впечатления. Лиза Петри разработает сценарий с неожиданными испытаниями и финалом который запомнится надолго.	⚡	#F39C12	4	t	2026-02-11 22:43:44.500016
5	Культурные	cultural	Квест-свидание по музеям, галереям и культурным местам города. Лиза Петри создаёт персональный маршрут с заданиями — искусство и романтика в одном приключении для двоих.	🎭	#9B59B6	5	t	2026-02-11 22:43:44.500261
6	Гастрономические	gastronomic	Кулинарное свидание-квест для двоих — дегустации, кафе и ресторанные задания с персональным маршрутом от Лизы Петри. Вкусное приключение которое не забудется.	🍷	#E67E22	6	t	2026-02-11 22:43:44.500591
7	Предложение	proposal	Квест-предложение руки и сердца от Лизы Петри. Персональный сценарий где каждый шаг ведёт к главному моменту — дома или по любимым местам вашей пары.	💍	#d4af37	7	t	2026-03-22 14:54:12.233853
\.


--
-- Data for Name: quest_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quest_templates (id, author_id, category_id, title, slug, tagline, description, cover_image, gallery, demo_video_url, difficulty, duration_minutes, location_type, min_locations, max_locations, structure, features, customization_options, views_count, orders_count, rating, reviews_count, base_price, is_free, is_premium, status, published_at, meta_description, meta_keywords, created_at, updated_at, demo_quest_id, quick_view_description, default_theme, default_player_version, default_show_intro) FROM stdin;
16	6	7	Предложение дома: Момент навсегда	proposal-home	Квест-сюрприз ведущий к самому важному вопросу	Особый вечер, который запомнится на всю жизнь. Партнёр проходит цепочку нежных заданий, каждое из которых — часть вашей истории. В финале — самый важный вопрос.\n\nКвест полностью проходится дома. Не требует специальной подготовки — только кольцо и желание сделать этот момент незабываемым.	\N	[]	\N	easy	50	indoor	1	1	[{"id": "block-dom-1", "tasks": [{"id": "task-dom-1-1", "hint": "", "type": "simple", "title": "Найди первую подсказку", "points": 10, "description": "Укажите куда смотреть, например под подушкой или у зеркала"}], "title": "Первый конверт", "location": "", "description": "Начало квеста дома"}, {"id": "block-dom-2", "tasks": [{"id": "task-dom-2-1", "hint": "", "type": "riddle", "title": "Загадка о нашей первой встрече", "answer": "ответ", "points": 30, "question": "Где мы впервые встретились?", "description": "Загадка связанная с тем где вы познакомились"}, {"id": "task-dom-2-2", "hint": "", "type": "simple", "title": "Найди следующую подсказку", "points": 10, "description": "Спрячьте следующий конверт в значимом месте дома"}], "title": "Наша история", "location": "", "description": "Задание про общие воспоминания"}, {"id": "block-dom-3", "tasks": [{"id": "task-dom-3-1", "type": "text_answer", "title": "Назови 3 причины почему я тебя люблю", "points": 25, "question": "Напиши 3 причины почему я тебя люблю", "description": "Клиент должен написать ответ", "placeholder": "Потому что..."}], "title": "Причины любить тебя", "location": "", "description": "Романтическое задание"}, {"id": "block-dom-4", "tasks": [{"id": "task-dom-4-1", "hint": "Загляни туда где хранится самое ценное", "type": "simple", "title": "Найди главный сюрприз", "points": 50, "description": "Укажите точное место где спрятан главный сюрприз"}, {"id": "task-dom-4-2", "type": "selfie", "title": "Наш особый момент", "points": 25, "description": "Сфотографируйтесь вместе в этот счастливый момент", "selfie_emoji": "💍", "selfie_condition": "Сделайте совместное фото!"}], "title": "Главный сюрприз", "location": "", "description": "Место с кольцом или главным сюрпризом"}]	["Нежные загадки", "Вопросы о вашей истории", "Текстовые признания", "Пары воспоминаний", "Финальный вопрос"]	{}	178	1	4.67	3	49900	f	f	published	2026-03-15 18:34:51.881303	Квест для предложения руки и сердца дома. 5 этапов, нежные задания, финальный вопрос. Золотая тема оформления.	\N	2026-03-15 18:34:51.881303	2026-05-27 13:52:32.033412	\N	\N	proposal	v1	t
15	6	3	Шоколадный детектив	chocolate-detective-home	Сладкие загадки и вкусный финал	Игривый, тёплый квест для уютного вечера. Загадки связаны с едой, вкусами и совместными воспоминаниями о кафе, ужинах и маленьких радостях. Каждый правильный ответ приближает к финальному сюрпризу — чему-то сладкому и особенному.\n\nЛёгкий, смешной, немного романтичный. Хорошо работает с бокалом вина и пледом.	\N	[]	\N	easy	50	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Сигнал тревоги", "points": 10, "description": "«Дорогой детектив! ЧП на кухне. Самый вкусный десерт исчез бесследно. Подозреваемых нет. Только вы можете раскрыть это дело.»"}, {"id": "t2", "hint": "Итальянский десерт", "type": "riddle", "title": "Первая улика", "answer": "ТИРАМИСУ", "points": 20, "description": "«Я сладкий снаружи и внутри. Меня едят в хорошую погоду и в плохую. Лучше всего сочетаюсь с кофе. Что я такое?»"}], "title": "Пропажа десерта", "description": "Срочное сообщение от шеф-повара."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Допрос о вкусах — вопрос 1", "points": 15, "game_type": "quiz", "description": "Детектив выясняет вкусовые предпочтения.", "game_correct": 0, "game_options": ["Торт", "Мороженое", "Пирожное", "Фруктовый салат"], "game_question": "Что партнёр выбирает в кафе на десерт?"}, {"id": "t4", "type": "mini_game", "title": "Допрос о вкусах — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 1, "game_options": ["Тёмный", "Молочный", "Белый", "Не ест шоколад"], "game_question": "Какой шоколад партнёр предпочитает?"}], "title": "Вкусовые показания", "description": "Свидетели дают показания."}, {"id": "b3", "tasks": [{"id": "t5", "hint": "Без этого еда невкусная", "type": "riddle", "title": "Загадка шеф-повара", "answer": "СОЛЬ", "points": 20, "description": "«Я есть в каждом доме. Без меня невозможно приготовить ни одно блюдо. Без меня вкус плоский. Что я такое?»"}, {"id": "t6", "hint": "Противоположность сладкого", "type": "riddle", "title": "Вторая кухонная загадка", "answer": "ГОРЕЧЬ", "points": 20, "description": "«Меня боятся сладкоежки, но без меня не бывает настоящего шоколада. Без меня всё слишком приторно. Что я такое?»"}], "title": "Улики на кухне", "description": "Детектив исследует место преступления."}, {"id": "b4", "tasks": [{"id": "t7", "type": "mini_game", "pairs": [{"left": "Сладкий", "right": "Когда всё хорошо"}, {"left": "Острый", "right": "Когда смеётесь до слёз"}, {"left": "Горький", "right": "Когда скучаете друг по другу"}, {"left": "Кислый", "right": "Когда спорите но остаётесь вместе"}], "title": "Вкусы и моменты", "points": 30, "game_type": "pairs", "description": "Соедините каждый вкус с подходящим совместным моментом."}], "title": "Сладкие воспоминания", "description": "Показания о совместных кулинарных моментах."}, {"id": "b5", "tasks": [{"id": "t8", "type": "text_answer", "title": "Рецепт идеального вечера", "points": 25, "description": "Запишите рецепт. Что нужно чтобы вечер с партнёром стал особенным? Перечислите 3-5 пунктов.", "placeholder": "Нужно взять..."}], "title": "Признание", "description": "Главный свидетель раскрывает тайну."}, {"id": "b6", "tasks": [{"id": "t9", "hint": "Это то что вы чувствуете прямо сейчас", "type": "riddle", "title": "Последняя улика", "answer": "СЧАСТЬЕ", "points": 50, "description": "«Я слаще любого десерта. Меня нельзя приготовить по рецепту. Я появляюсь сама когда рядом нужный человек. Что я такое?»"}], "title": "Дело раскрыто", "description": "Финал расследования."}]	["Кулинарные загадки", "Вопросы о вкусах", "Текстовые задания", "Пары моментов", "Сладкий финал"]	{}	249	1	4.67	3	49900	f	t	published	2026-03-15 08:49:46.952907	Игривый домашний квест с кулинарной темой. Загадки о еде и совместных воспоминаниях, сладкий финал.	\N	2026-03-15 08:49:46.952907	2026-05-27 06:19:45.373582	\N	\N	detective	v1	t
17	6	7	Предложение в Москве: Городской маршрут	proposal-moscow	Маршрут по значимым местам к самому важному вопросу	Городской квест-маршрут для предложения руки и сердца. Партнёр проходит по памятным местам Москвы, получая подсказки и задания на каждой точке. Финал — в заранее выбранном вами месте.\n\nМаршрут и задания адаптируются под ваши места. Подходит для любого сезона.	/uploads/templates/images-1773858000910-809090487.jpg	["/uploads/templates/images-1773858000910-809090487.jpg"]	\N	medium	90	city	3	5	[{"id": "block-msk-1", "tasks": [{"id": "task-msk-1-1", "hint": "", "type": "simple", "title": "Найди первое послание", "points": 10, "description": "Укажите место старта и где спрятана первая подсказка"}, {"id": "task-msk-1-2", "type": "selfie", "title": "Фото у первой точки", "points": 15, "description": "Сделай фото у места старта", "selfie_emoji": "📍", "selfie_condition": "Сфотографируйся у этого места"}], "title": "Старт маршрута", "location": "", "description": "Первая точка городского маршрута"}, {"id": "block-msk-2", "tasks": [{"id": "task-msk-2-1", "hint": "", "type": "riddle", "title": "Загадка об этом месте", "answer": "ответ", "points": 30, "question": "Загадка про место", "description": "Загадка связанная с этим местом или его историей"}, {"id": "task-msk-2-2", "hint": "", "type": "simple", "title": "Следующая точка", "points": 10, "description": "Укажите как добраться до следующей точки маршрута"}], "title": "Значимое место 1", "location": "", "description": "Первое значимое место маршрута"}, {"id": "block-msk-3", "tasks": [{"id": "task-msk-3-1", "hint": "", "type": "simple", "title": "Задание в этом месте", "points": 15, "description": "Опишите задание которое нужно выполнить в этой точке"}, {"id": "task-msk-3-2", "type": "selfie", "title": "Памятное фото", "points": 20, "description": "Сделай фото в этом особом месте", "selfie_emoji": "🏙️", "selfie_condition": "Сфотографируйся здесь"}], "title": "Значимое место 2", "location": "", "description": "Второе значимое место"}, {"id": "block-msk-4", "tasks": [{"id": "task-msk-4-1", "hint": "", "type": "riddle", "title": "Наша история в этом городе", "answer": "ответ", "points": 40, "question": "Загадка здесь", "description": "Загадка о вашем общем воспоминании"}], "title": "Значимое место 3", "location": "", "description": "Третье значимое место"}, {"id": "block-msk-5", "tasks": [{"id": "task-msk-5-1", "hint": "Ты почти у цели!", "type": "simple", "title": "Найди финальный сюрприз", "points": 50, "description": "Укажите финальную точку маршрута где будет главный сюрприз"}, {"id": "task-msk-5-2", "type": "selfie", "title": "Этот момент навсегда", "points": 30, "description": "Запечатлейте самый важный момент", "selfie_emoji": "💍", "selfie_condition": "Сделайте фото в этот особый момент"}], "title": "Финальная точка", "location": "", "description": "Место где произойдёт самое важное"}]	["Маршрут по городу", "Загадки на каждой точке", "История вашей пары", "Шифры и послания", "Финальный вопрос"]	{}	196	2	4.67	3	49900	f	t	published	2026-03-15 18:34:51.89485	Городской квест для предложения руки и сердца в Москве. Маршрут по значимым местам, финальный вопрос в особом месте.	\N	2026-03-15 18:34:51.89485	2026-05-27 05:39:13.939415	\N	\N	proposal	v1	t
12	6	3	Машина времени	time-machine-home	Путешествие по вашей общей истории	Этот квест — билет в прошлое. Каждый этап переносит вас в определённый момент ваших отношений: первое сообщение, первый совместный вечер, смешная история, важный день. Вопросы, загадки и маленькие открытия о том, как вы оказались там, где вы есть сейчас.\n\nИдеально для годовщины. Не требует ничего, кроме телефона и воспоминаний.	\N	[]	\N	easy	45	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Бортовой журнал", "points": 10, "description": "Вы садитесь в машину времени. Маршрут: назад по вашей общей истории. Первая остановка — самое начало."}], "title": "Отправление", "description": "Машина времени готова к запуску."}, {"id": "b2", "tasks": [{"id": "t2", "type": "mini_game", "title": "Проверка памяти — вопрос 1", "points": 15, "game_type": "quiz", "description": "Насколько хорошо вы помните первые дни?", "game_correct": 0, "game_options": ["Я", "Партнёр", "Оба одновременно", "Уже не помню"], "game_question": "Кто первым написал сообщение?"}, {"id": "t3", "type": "mini_game", "title": "Проверка памяти — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Интерес", "Волнение", "Симпатию", "Ничего особенного поначалу"], "game_question": "Что вы почувствовали при первой встрече?"}], "title": "Первая остановка: Знакомство", "description": "Проверка памяти о первых днях."}, {"id": "b3", "tasks": [{"id": "t4", "hint": "Спросите у партнёра если не помните", "type": "riddle", "title": "Что было на первом свидании?", "answer": "ЛЮБОЙ", "points": 20, "description": "Вспомните первое свидание. Что вы ели или пили? Введите одно слово.", "ignore_answer": true}, {"id": "t5", "type": "text_answer", "title": "Что вы думали тогда", "points": 25, "description": "Напишите одну мысль которая у вас была в тот вечер. Можно то чего не говорили вслух.", "placeholder": "Я тогда думал(а)..."}], "title": "Вторая остановка: Первое свидание", "description": "Тот вечер когда всё стало понятно."}, {"id": "b4", "tasks": [{"id": "t6", "type": "mini_game", "pairs": [{"left": "Первый раз остались на ночь", "right": "Близость"}, {"left": "Первая поездка вместе", "right": "Приключение"}, {"left": "Первая ссора и примирение", "right": "Понимание"}, {"left": "Сказали «я тебя люблю»", "right": "Смелость"}], "title": "Наши моменты", "points": 30, "game_type": "pairs", "description": "Соедините описание момента с тем что вы почувствовали."}], "title": "Третья остановка: Важный момент", "description": "Когда стало понятно что это серьёзно."}, {"id": "b5", "tasks": [{"id": "t7", "type": "text_answer", "title": "Послание в будущее", "points": 40, "description": "Напишите одно предложение — что бы вы хотели чтобы будущая версия вас знала об этих отношениях.", "placeholder": "Я хочу чтобы ты знал(а)..."}], "title": "Возвращение: Сейчас", "description": "Машина времени доставила вас обратно."}]	["Вопросы о партнёре", "Путешествие по воспоминаниям", "Текстовые признания", "Мини-игры", "Послание в будущее"]	{}	180	6	4.67	3	49900	f	t	published	2026-03-15 08:49:46.947025	Романтический квест-путешествие по истории пары. Вопросы, загадки и воспоминания о важных моментах отношений. Идеально для годовщины.	\N	2026-03-15 08:49:46.947025	2026-05-27 05:32:13.757417	\N	\N	mystery	v1	t
11	6	3	Детективное расследование	detective-home	Раскройте дело о пропавшем подарке	Вечер превращается в детективную историю. Один из вас — детектив, второй — главный свидетель. Серия улик, зашифрованных записок и логических задач ведёт к финальной разгадке — и к сюрпризу, который ждёт в конце расследования.\n\nКвест полностью проходится дома, не требует заранее спрятанных предметов и специальной подготовки — только телефон и желание поиграть.	\N	[]	\N	medium	60	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Входящее сообщение", "points": 10, "description": "«Добрый вечер, детектив. Нам поступил сигнал о пропаже. Изучите материалы дела и приступайте к работе. Времени мало.»"}, {"id": "t2", "hint": "Замените каждую букву на предыдущую в алфавите", "type": "riddle", "title": "Зашифрованная записка", "answer": "СНОВА ИДИ", "points": 20, "description": "На столе найдена записка. Каждая буква заменена следующей по алфавиту. Расшифруйте: «ТНЖБТ ДПДЙ»"}], "title": "Первая улика", "description": "Детектив получает первое задание."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Алиби — вопрос 1", "points": 15, "game_type": "quiz", "description": "Детектив проверяет алиби.", "game_correct": 1, "game_options": ["Читал", "Смотрел телефон", "Готовил", "Смотрел в окно"], "game_question": "Что партнёр делал последние 30 минут?"}, {"id": "t4", "type": "mini_game", "title": "Алиби — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Чай", "Кофе", "Воду", "Сок"], "game_question": "Какой напиток партнёр выпил сегодня последним?"}], "title": "Допрос свидетеля", "description": "Детектив проверяет алиби."}, {"id": "b3", "tasks": [{"id": "t5", "hint": "Всегда с вами", "type": "riddle", "title": "Загадка номер один", "answer": "ТЕЛЕФОН", "points": 25, "description": "«Меня берут в руки, когда хотят поговорить. Меня кладут в карман, когда разговор окончен. Без меня вы не нашли бы друг друга в первый день. Что я такое?»"}, {"id": "t6", "hint": "Вспомните самое начало", "type": "riddle", "title": "Загадка номер два", "answer": "СООБЩЕНИЕ", "points": 25, "description": "«Я был первым что вы написали друг другу. Я не занимаю места, но занимаю память. Я короткий, но важный. Что я такое?»"}], "title": "Вещественные доказательства", "description": "Важные улики по делу."}, {"id": "b4", "tasks": [{"id": "t7", "type": "mini_game", "pairs": [{"left": "Волнение", "right": "Первое свидание"}, {"left": "Радость", "right": "Когда смеётесь вместе"}, {"left": "Тепло", "right": "Когда обнимаетесь"}, {"left": "Спокойствие", "right": "Когда молчите рядом"}], "title": "Соедините пары", "points": 30, "game_type": "pairs", "description": "Соедините каждое чувство с подходящим моментом."}], "title": "Реконструкция событий", "description": "Детектив восстанавливает хронологию."}, {"id": "b5", "tasks": [{"id": "t8", "type": "text_answer", "title": "Показания", "points": 20, "description": "Вопрос: «Опишите одним предложением что вам больше всего нравится в вашем партнёре»", "placeholder": "Введите показания..."}], "title": "Показания очевидца", "description": "Главный свидетель готов говорить."}, {"id": "b6", "tasks": [{"id": "t9", "hint": "Посоветуйтесь с партнёром", "type": "riddle", "title": "Финальный код", "answer": "ЛЮБОЙ", "points": 50, "description": "Последняя улика. Код — это год когда вы впервые встретились. Введите его чтобы закрыть дело.", "ignore_answer": true}], "title": "Дело закрыто", "description": "Финал расследования."}]	["Загадки и шифры", "Мини-игры", "Текстовые задания", "Подсказки", "Финальный сюрприз"]	{}	151	1	4.75	4	49900	f	f	published	2026-03-15 08:49:46.936304	Домашний детективный квест для двоих — раскройте дело о пропавшем подарке. 6 этапов загадок и улик, финальный сюрприз.	\N	2026-03-15 08:49:46.936304	2026-05-27 05:48:44.280111	\N	\N	detective	v1	t
13	6	3	Искатель клада	treasure-hunter-home	Найдите сокровище по зашифрованной карте	Зашифрованная карта, пиратские загадки, тайные коды и финальный клад — всё это умещается в один вечер дома. Квест в духе настоящего приключения: шифры, логические задачи, маленькие испытания и сюрприз в финале.\n\nПодходит для тех, кто любит игры и хочет провести вечер активно и весело. Сложнее, чем кажется — но не настолько, чтобы расстроиться.	\N	[]	\N	medium	75	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Послание капитана", "points": 10, "description": "«Смелый мореход! Ты получил карту к величайшему сокровищу. Путь непрост, но достоин двоих. Семь испытаний ждут тебя. Готовься.»"}, {"id": "t2", "hint": "А=1, Б=2, В=3, Г=4... Л=12", "type": "riddle", "title": "Первый шифр", "answer": "КЛАД", "points": 25, "description": "Числовой шифр: 3-1-12-1-4. Каждая цифра — номер буквы в алфавите. Расшифруй слово."}], "title": "Карта капитана", "description": "Первая отметка на карте."}, {"id": "b2", "tasks": [{"id": "t3", "hint": "Это нематериально", "type": "riddle", "title": "Загадка острова", "answer": "ЯМА", "points": 20, "description": "«Чем больше берёшь — тем больше становится. Что это?»"}, {"id": "t4", "hint": "Смотрите на это каждый день но не видите", "type": "riddle", "title": "Вторая загадка", "answer": "БУДУЩЕЕ", "points": 20, "description": "«Всегда перед вами, но увидеть невозможно. Что это?»"}], "title": "Остров загадок", "description": "Второй этап пути."}, {"id": "b3", "tasks": [{"id": "t5", "type": "mini_game", "title": "Испытание знанием — вопрос 1", "points": 20, "game_type": "quiz", "description": "Капитан проверяет знаете ли вы своего спутника.", "game_correct": 2, "game_options": ["Утро", "День", "Вечер", "Ночь"], "game_question": "Какое любимое время суток у партнёра?"}, {"id": "t6", "type": "mini_game", "title": "Испытание знанием — вопрос 2", "points": 20, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Дома", "Гулять", "С друзьями", "Путешествовать"], "game_question": "Как партнёр предпочитает проводить выходной?"}], "title": "Пещера испытаний", "description": "Проверка знания партнёра."}, {"id": "b4", "tasks": [{"id": "t7", "hint": "Это то чем делятся", "type": "riddle", "title": "Код от сундука", "answer": "УЛЫБКА", "points": 30, "description": "«Я есть у каждого, но у тебя другой чем у меня. Ты можешь отдать его мне, и у тебя станет больше, не меньше.»"}], "title": "Бухта сокровищ", "description": "Четвёртый этап."}, {"id": "b5", "tasks": [{"id": "t8", "type": "mini_game", "pairs": [{"left": "Забота", "right": "Спрашивает как дела"}, {"left": "Честность", "right": "Говорит правду даже когда трудно"}, {"left": "Юмор", "right": "Умеет рассмешить"}, {"left": "Надёжность", "right": "Всегда рядом когда нужно"}], "title": "Соедините ценности", "points": 30, "game_type": "pairs", "description": "Соедините каждое качество с тем как оно проявляется у партнёра."}], "title": "Карта сердца", "description": "Пятый этап."}, {"id": "b6", "tasks": [{"id": "t9", "type": "text_answer", "title": "Послание пирата", "points": 20, "description": "Капитан требует последнее доказательство. Напиши одно слово — то которым ты бы описал сегодняшний вечер.", "placeholder": "Одно слово..."}], "title": "Последнее испытание", "description": "Шестой этап."}, {"id": "b7", "tasks": [{"id": "t10", "hint": "Посмотри на человека рядом", "type": "riddle", "title": "Главная загадка", "answer": "ЛЮБОВЬ", "points": 50, "description": "«Я не золото и не серебро. Меня нельзя купить. Но именно из-за меня стоило пройти весь этот путь. Что я такое?»"}], "title": "Клад найден", "description": "Финал."}]	["Шифры и коды", "Загадки", "Мини-игры", "Пары слов", "Финальный клад"]	{}	203	0	4.75	4	49900	f	f	published	2026-03-15 08:49:46.949384	Домашний квест в стиле охоты за сокровищами. Шифры, загадки, пиратская тема. 7 этапов, финальный клад-сюрприз.	\N	2026-03-15 08:49:46.949384	2026-05-27 05:34:43.778636	\N	\N	treasure	v1	t
14	6	3	Звёздная ночь	starry-night-home	Романтическое путешествие между звёздами	Тёплый, нежный квест для особого вечера. Каждый блок — это «планета» с заданием: написать что-то важное, вспомнить совместный момент, ответить на вопрос о партнёре. Финал — маленькое признание, которое останется с вами.\n\nМягкая сложность, никакого стресса. Просто красивый вечер вдвоём.	/uploads/templates/images-1774780481392-659374086.jpg	["/uploads/templates/images-1774780481392-659374086.jpg", "/uploads/templates/images-1774780483583-71434204.jpg"]	\N	easy	40	indoor	1	1	[{"id": "block-zv-1", "tasks": [{"id": "task-zv-1-1", "hint": "", "type": "simple", "title": "Найди конверт с заданием", "points": 10, "description": "Опишите где спрятан конверт с первым заданием"}], "title": "Первое послание", "location": "", "description": "Начало квеста — клиент находит первую подсказку"}, {"id": "block-zv-2", "tasks": [{"id": "task-zv-2-1", "hint": "Подсказка если нужна", "type": "riddle", "title": "Загадка о вас двоих", "answer": "ответ", "points": 30, "question": "Загадка здесь", "description": "Придумайте загадку связанную с вашей историей"}], "title": "Под звёздным небом", "location": "", "description": "Романтическое задание посвящённое вашей истории"}, {"id": "block-zv-3", "tasks": [{"id": "task-zv-3-1", "hint": "", "type": "simple", "title": "Найди спрятанное послание", "points": 15, "description": "Опишите задание в особом месте"}, {"id": "task-zv-3-2", "type": "selfie", "title": "Сделай фото здесь", "points": 25, "description": "Памятное фото на память", "selfie_emoji": "📸", "selfie_condition": "Сфотографируйся в этом месте"}], "title": "Особое место", "location": "", "description": "Место с особым значением для вас"}, {"id": "block-zv-4", "tasks": [{"id": "task-zv-4-1", "hint": "", "type": "simple", "title": "Финальный сюрприз", "points": 20, "description": "Опишите финальный сюрприз или послание"}], "title": "Финал: Звёздный момент", "location": "", "description": "Кульминация — главный сюрприз"}]	["Романтические загадки", "Вопросы о партнёре", "Текстовые признания", "Пары качеств", "Послание в будущее"]	{}	272	5	4.67	3	49900	f	t	published	2026-03-15 08:49:46.951222	Романтический домашний квест в космической теме. 5 этапов, лёгкие задания, финальное признание.	\N	2026-03-15 08:49:46.951222	2026-05-27 05:36:13.81044	\N	\N	romantic	v1	t
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tags (id, name, slug, usage_count, created_at) FROM stdin;
17	квест-комната	квест-комната	0	2026-02-11 22:43:44.561528
19	зимний	зимний	0	2026-02-11 22:43:44.561928
20	летний	летний	0	2026-02-11 22:43:44.562136
21	весенний	весенний	0	2026-02-11 22:43:44.562314
22	осенний	осенний	0	2026-02-11 22:43:44.562486
10	фотосессия	фотосессия	0	2026-02-11 22:43:44.560127
4	природа	природа	0	2026-02-11 22:43:44.558499
5	активный отдых	активный-отдых	0	2026-02-11 22:43:44.558825
18	на свежем воздухе	на-свежем-воздухе	0	2026-02-11 22:43:44.561722
6	культура	культура	0	2026-02-11 22:43:44.559182
7	искусство	искусство	0	2026-02-11 22:43:44.559485
8	еда	еда	0	2026-02-11 22:43:44.559718
9	винные дегустации	винные-дегустации	0	2026-02-11 22:43:44.559932
3	город	город	0	2026-02-11 22:43:44.558157
2	приключения	приключения	0	2026-02-11 22:43:44.557599
15	загадки	загадки	0	2026-02-11 22:43:44.561115
1	романтика	романтика	0	2026-02-11 22:43:44.55662
16	головоломки	головоломки	3	2026-02-11 22:43:44.561323
12	предложение руки и сердца	предложение-руки-и-сердца	3	2026-02-11 22:43:44.560496
23	предложение	proposal	2	2026-03-22 14:51:48.724295
13	годовщина	годовщина	2	2026-02-11 22:43:44.560683
14	первое свидание	первое-свидание	3	2026-02-11 22:43:44.560864
11	сюрприз	сюрприз	7	2026-02-11 22:43:44.56031
\.


--
-- Data for Name: template_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.template_tags (template_id, tag_id) FROM stdin;
11	11
11	16
11	14
12	13
12	11
12	14
13	16
13	11
15	12
15	16
15	11
16	12
16	11
17	12
17	11
16	23
17	23
14	13
14	14
14	11
\.


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.authors_id_seq', 6, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 7, true);


--
-- Name: quest_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_templates_id_seq', 17, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_id_seq', 23, true);


--

-- PostgreSQL database dump complete
--

\unrestrict myLWxN3EBgCJn1DZfwHPjGap6A5wfrPsCTLKH8zuCdhhIglJWW3ANd0bgG4NbDW

