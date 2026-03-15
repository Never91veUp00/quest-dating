--
-- PostgreSQL database dump
--

\restrict 4ICaxnYLLUgjfpZsFvY5U7amtvKzecHo44t13pE4vISJGCmbePuDPwtSVf7E7r5

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_author_stats(); Type: FUNCTION; Schema: public; Owner: quest_user
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


ALTER FUNCTION public.update_author_stats() OWNER TO quest_user;

--
-- Name: update_tag_usage_count(); Type: FUNCTION; Schema: public; Owner: quest_user
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


ALTER FUNCTION public.update_tag_usage_count() OWNER TO quest_user;

--
-- Name: update_template_rating(); Type: FUNCTION; Schema: public; Owner: quest_user
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


ALTER FUNCTION public.update_template_rating() OWNER TO quest_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: quest_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO quest_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: quest_user
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


ALTER TABLE public.authors OWNER TO quest_user;

--
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.authors_id_seq OWNER TO quest_user;

--
-- Name: authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.authors_id_seq OWNED BY public.authors.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: quest_user
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


ALTER TABLE public.categories OWNER TO quest_user;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO quest_user;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: created_quests; Type: TABLE; Schema: public; Owner: quest_user
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
    CONSTRAINT created_quests_theme_check CHECK (((theme)::text = ANY ((ARRAY['detective'::character varying, 'romantic'::character varying, 'city'::character varying, 'mystery'::character varying, 'treasure'::character varying])::text[])))
);


ALTER TABLE public.created_quests OWNER TO quest_user;

--
-- Name: COLUMN created_quests.theme; Type: COMMENT; Schema: public; Owner: quest_user
--

COMMENT ON COLUMN public.created_quests.theme IS 'Визуальная тема плеера: detective | romantic | city | mystery';


--
-- Name: COLUMN created_quests.final_message; Type: COMMENT; Schema: public; Owner: quest_user
--

COMMENT ON COLUMN public.created_quests.final_message IS 'Персональное послание заказчика, показывается на финальном экране';


--
-- Name: COLUMN created_quests.show_intro; Type: COMMENT; Schema: public; Owner: quest_user
--

COMMENT ON COLUMN public.created_quests.show_intro IS 'Показывать анимированную заставку перед сплэш-экраном';


--
-- Name: created_quests_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.created_quests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.created_quests_id_seq OWNER TO quest_user;

--
-- Name: created_quests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.created_quests_id_seq OWNED BY public.created_quests.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: quest_user
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
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO quest_user;

--
-- Name: COLUMN orders.newsletter_consent; Type: COMMENT; Schema: public; Owner: quest_user
--

COMMENT ON COLUMN public.orders.newsletter_consent IS 'Согласие клиента на получение рассылки';


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO quest_user;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: quest_sessions; Type: TABLE; Schema: public; Owner: quest_user
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


ALTER TABLE public.quest_sessions OWNER TO quest_user;

--
-- Name: quest_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.quest_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quest_sessions_id_seq OWNER TO quest_user;

--
-- Name: quest_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.quest_sessions_id_seq OWNED BY public.quest_sessions.id;


--
-- Name: quest_templates; Type: TABLE; Schema: public; Owner: quest_user
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
    CONSTRAINT quest_templates_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying, 'expert'::character varying])::text[]))),
    CONSTRAINT quest_templates_location_type_check CHECK (((location_type)::text = ANY ((ARRAY['city'::character varying, 'indoor'::character varying, 'park'::character varying, 'universal'::character varying])::text[]))),
    CONSTRAINT quest_templates_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'review'::character varying, 'published'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.quest_templates OWNER TO quest_user;

--
-- Name: quest_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.quest_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quest_templates_id_seq OWNER TO quest_user;

--
-- Name: quest_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.quest_templates_id_seq OWNED BY public.quest_templates.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: quest_user
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


ALTER TABLE public.reviews OWNER TO quest_user;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO quest_user;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: quest_user
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    usage_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tags OWNER TO quest_user;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: quest_user
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO quest_user;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quest_user
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: template_tags; Type: TABLE; Schema: public; Owner: quest_user
--

CREATE TABLE public.template_tags (
    template_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.template_tags OWNER TO quest_user;

--
-- Name: authors id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.authors ALTER COLUMN id SET DEFAULT nextval('public.authors_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: created_quests id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.created_quests ALTER COLUMN id SET DEFAULT nextval('public.created_quests_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: quest_sessions id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_sessions ALTER COLUMN id SET DEFAULT nextval('public.quest_sessions_id_seq'::regclass);


--
-- Name: quest_templates id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_templates ALTER COLUMN id SET DEFAULT nextval('public.quest_templates_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.authors (id, username, email, display_name, bio, avatar_url, website, social_links, is_verified, total_templates, average_rating, created_at, updated_at) FROM stdin;
6	vlad	vp.vlad00@mail.ru	Лиза Петри	Создаю персональные свидания-квесты с 2024 года. Каждый сценарий — с нуля под вашу пару: ваш город, ваши места, ваша история.	/images/avatars/author1.jpg	\N	{}	t	7	3.81	2026-02-20 23:59:14.038023	2026-03-15 00:13:19.987826
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.categories (id, name, slug, description, icon, color, "position", is_active, created_at) FROM stdin;
1	Городские квесты	city-quests	Квесты по интересным местам города	🏙️	#4A90E2	1	t	2026-02-11 22:43:44.497746
2	Парковые приключения	park-adventures	Романтические прогулки в парках	🌳	#2ECC71	2	t	2026-02-11 22:43:44.499173
3	Домашние квесты	home-quests	Уютные квесты не выходя из дома	🏠	#E74C3C	3	t	2026-02-11 22:43:44.499631
4	Экстремальные	extreme	Для любителей адреналина	⚡	#F39C12	4	t	2026-02-11 22:43:44.500016
5	Культурные	cultural	Музеи, галереи, театры	🎭	#9B59B6	5	t	2026-02-11 22:43:44.500261
6	Гастрономические	gastronomic	Кулинарные приключения для двоих	🍷	#E67E22	6	t	2026-02-11 22:43:44.500591
\.


--
-- Data for Name: created_quests; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.created_quests (id, order_id, template_id, slug, access_code, title, client_name, blocks, is_public, views_count, started_count, completed_count, published_at, expires_at, created_at, updated_at, theme, final_message, show_intro) FROM stdin;
9	39	9	ii-2026-208	123	Квест для ии	ии	[{"id": "block-1773510446163-0", "tasks": [], "title": "трмрол", "location": "", "description": ""}]	t	1	1	0	2026-03-14 20:47:34.956129	\N	2026-03-14 20:47:34.956129	2026-03-14 20:48:16.851438	detective	\N	t
7	\N	\N	elizaveta-2026-783	\N	Наша история	Елизавета	[{"id": "block-1772286245250", "tasks": [{"id": "task-1772286330485", "hint": "", "type": "simple", "title": "Вступление", "points": 10, "description": "Сегодня ты — детектив, и твоё дело — самое важное. Найди 7 улик о человеке, который тебя любит. Первая подсказка там, где всё начинается каждое утро."}, {"id": "task-1772286462484", "type": "location", "title": "Найди записку в месте", "points": 15, "description": "", "location_desc": "Здесь каждое утро начинается новый день. Здесь смываются усталость и тревоги. Здесь ты смотришь на себя — но сегодня загляни чуть левее зеркала.", "location_hint": "Где ты умываешься каждое утро?"}, {"id": "task-1772286611710", "hint": "белый, двухэтажный", "type": "riddle", "title": "Вопрос", "answer": "холодильник", "points": 30, "question": "Я всегда холодный, всегда голодный, но кормлю всю семью. Кто я?", "description": "Отгадай загадку"}], "title": "Начало пути", "location": "Ванная комната", "description": ""}, {"id": "block-1772286669972", "tasks": [{"id": "task-1772286704473", "hint": "", "type": "code_physical", "title": "Найди все — сложи слово.", "answer": "ЛЮБЛЮ", "points": 30, "code_hint": "", "description": "На кухне спрятаны 5 предметов с буквами."}, {"id": "task-1772286747698", "type": "text_answer", "title": "Ответь на вопрос", "points": 15, "question": "Напиши одно воспоминание о нас, которое ты никогда не забудешь", "description": "", "placeholder": ""}, {"id": "task-1772286769941", "type": "mini_game", "title": "Вопрос", "points": 40, "game_type": "quiz", "description": "", "game_images": [], "game_correct": 1, "game_options": ["Властелин колец", "Сказка о потерянном времени", "Тарзан", "А зори здесь тихие"], "puzzle_image": null, "game_question": "Какой фильм мы смотрели на нашем первом свидании?", "puzzle_pieces": 30}], "title": "Улики", "location": "Кухня", "description": ""}, {"id": "block-1772286878579", "tasks": [{"id": "task-1772286906208", "type": "location", "title": "Найди место", "points": 15, "description": "", "location_desc": "Иди туда, где мы чаще всего проводим вечера вместе", "location_hint": ""}, {"id": "task-1772286970856", "type": "media", "title": "Любящие тебя", "points": 10, "media_url": "/uploads/media/media-1772289950831-741802472.mp4", "media_size": 2408471, "media_type": "video", "description": "Посмотри на нас", "_mediaUploading": false, "media_original_name": "video_2026-02-28_17-16-49.mp4"}, {"id": "task-1772290013651", "type": "selfie", "title": "Селфи с условием", "points": 25, "description": "Действуй согласно требованиям", "selfie_emoji": "🤳", "selfie_condition": "Сфотографируйся с самым важным человеком в твоей жизни"}, {"id": "task-1772290069394", "hint": "", "type": "simple", "title": "Просто остановись где нужно", "points": 10, "description": "Не заходя в зал остановись в проходе двери"}], "title": "Финал", "location": "Прихожая", "description": ""}]	t	91	10	3	2026-02-28 17:50:26.866803	\N	2026-02-28 16:54:13.145821	2026-03-14 00:14:22.260122	romantic	Ты нашла все улики. Главная из них — ты сама. Обернись.	t
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.orders (id, template_id, client_name, client_email, client_phone, description, event_date, event_city, customization, selected_features, base_price, additional_costs, total_price, status, created_quest_id, admin_notes, created_at, updated_at, newsletter_consent) FROM stdin;
31	5	апвап	vp.vlad00@mail.ru	+79035101495	ываываываы	2026-03-23 00:00:00	вапвп	{}	[]	349000	0	349000	cancelled	\N	\N	2026-02-28 22:10:37.374827	2026-02-28 22:20:09.045257	f
30	4	в	vp.vlad00@mail.ru	+79035101495	ваыаываыва	2000-03-20 00:00:00	Шимент	{}	[]	499000	0	499000	cancelled	\N	\N	2026-02-28 22:03:40.848688	2026-02-28 23:21:06.603408	f
29	5	Влад Петров	vp.vlad00@mail.ru	+79035101495	оьгнрргшроиорроирпнпмлришгришрги	2026-02-28 00:00:00	Шимент	{}	["partner_surprises"]	349000	150000	499000	in_progress	\N	\N	2026-02-28 19:11:30.438911	2026-02-28 23:21:17.41478	f
33	9	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	pending	\N	\N	2026-03-03 22:02:11.580865	2026-03-03 22:02:11.580865	f
34	9	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	pending	\N	\N	2026-03-03 22:03:55.307884	2026-03-03 22:03:55.307884	f
35	9	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	pending	\N	\N	2026-03-03 22:05:58.671519	2026-03-03 22:05:58.671519	f
36	9	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	pending	\N	\N	2026-03-03 22:08:49.395316	2026-03-03 22:08:49.395316	f
37	9	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	pending	\N	\N	2026-03-03 22:11:27.840689	2026-03-03 22:11:27.840689	f
38	9	Влад Петров	vp.vlad00@mail.ru	+79035101495	ываываы	2000-02-14 00:00:00	Шимент	{}	["video_messages"]	0	100000	100000	pending	\N	\N	2026-03-08 15:14:26.043247	2026-03-08 15:14:26.043247	f
32	4	Влад Петров	vp.vlad00@mail.ru	+79035101495	фывфывфв	2026-03-01 00:00:00	Шимент	{}	[]	499000	0	499000	in_progress	\N	\N	2026-02-28 22:15:26.956612	2026-03-08 16:07:14.708388	f
39	9	ии	vp.vlad00@mail.ru	+79035101495	хочу чтобы все получилось	2026-03-28 00:00:00		{}	["partner_surprises", "qr_codes", "custom_photos", "background_music", "video_messages"]	0	430000	430000	in_progress	9	\N	2026-03-14 19:19:02.926332	2026-03-14 20:47:34.960909	f
40	3	Влад Петров	vp.vlad00@mail.ru	+79035101495	Партнёр: апврапвр\n\nПовод: екнвпр\n\nИнтересы: ваправп\n\nМеста: впрпр\n\nРеакция на сюрпризы: рпорр\n\nНастроение: 1\n\nИдеи: 123\n\nДополнительно: 1234435	2026-03-19 00:00:00		{}	["video_messages"]	0	100000	100000	pending	\N	\N	2026-03-14 23:48:09.322975	2026-03-14 23:48:09.322975	f
\.


--
-- Data for Name: quest_sessions; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.quest_sessions (id, created_quest_id, session_id, completed_tasks, current_block_position, points, achievements, started_at, last_activity, completed_at, total_time_seconds, hints_used) FROM stdin;
39	7	f05ea85b-054f-4b60-b1f8-b7c922225ef5	["task-1772286330485", "task-1772286462484", "task-1772286611710", "task-1772286704473", "task-1772286747698", "task-1772286769941", "task-1772286906208", "task-1772286970856", "task-1772290013651", "task-1772290069394"]	2	200	[]	2026-02-28 20:38:43.352126	2026-02-28 20:40:21.640273	2026-02-28 20:40:23.173834	99	0
40	7	bd0a2328-0753-4be5-86d3-08f7da13b12e	[]	0	0	[]	2026-03-01 14:19:49.792038	2026-03-01 14:19:49.792038	\N	0	0
36	7	07046044-a1bc-4a2b-a086-7e03c0e19f1c	[]	0	0	[]	2026-02-28 19:14:15.082625	2026-02-28 19:14:15.082625	\N	0	0
41	7	e5a87acc-2a2b-475d-824d-c6bcf8e78699	["task-1772286330485", "task-1772286462484", "task-1772286611710", "task-1772286704473", "task-1772286747698", "task-1772286769941", "task-1772286906208"]	2	155	[]	2026-03-02 21:59:40.571775	2026-03-02 22:00:48.534441	\N	0	0
42	7	5f2270b2-8651-4479-8d5d-7e4b67413872	[]	0	0	[]	2026-03-03 22:38:04.637262	2026-03-03 22:38:04.637262	\N	0	0
43	7	3a85bb4b-a3bd-4f0f-9cb1-714904002885	[]	0	0	[]	2026-03-08 16:00:44.232044	2026-03-08 16:00:44.232044	\N	0	0
44	7	0b4e6904-92c1-45b5-80bb-eca43e606245	[]	0	0	[]	2026-03-14 00:14:10.65398	2026-03-14 00:14:10.65398	\N	0	0
45	9	f205b39b-c968-454f-ba53-689a6b573868	[]	0	0	[]	2026-03-14 20:48:40.887445	2026-03-14 20:48:40.887445	\N	0	0
37	7	ed8ad47e-66a6-4aa5-918e-35e846bfff86	[]	0	0	[]	2026-02-28 20:15:33.721056	2026-02-28 20:15:33.721056	\N	0	0
34	7	9adec544-94ff-4335-8cc5-c33e7f3d248f	["task-1772286330485", "task-1772286462484", "task-1772286611710", "task-1772286704473", "task-1772286747698", "task-1772286769941", "task-1772286906208", "task-1772286970856", "task-1772290013651", "task-1772290069394"]	2	200	[]	2026-02-28 17:55:00.846705	2026-02-28 18:04:59.553149	2026-02-28 18:05:02.82677	601	0
35	7	25c6c461-7a39-424c-b97d-8bcf44db0698	[]	0	0	[]	2026-02-28 18:18:54.192655	2026-02-28 18:18:54.192655	\N	0	0
\.


--
-- Data for Name: quest_templates; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.quest_templates (id, author_id, category_id, title, slug, tagline, description, cover_image, gallery, demo_video_url, difficulty, duration_minutes, location_type, min_locations, max_locations, structure, features, customization_options, views_count, orders_count, rating, reviews_count, base_price, is_free, is_premium, status, published_at, meta_description, meta_keywords, created_at, updated_at, demo_quest_id, quick_view_description) FROM stdin;
2	6	2	Таинственная прогулка в парке	park-mystery-walk	Природа, загадки и романтика	Спокойная прогулка по парку с элементами детектива. Решайте загадки, находите тайники и наслаждайтесь природой.	\N	\N	\N	easy	120	park	4	6	{"intro": {"type": "map", "required": true}, "checkpoints": 4, "final_treasure": true}	["карта", "простые загадки", "природа", "релакс"]	{}	3736	2	4.50	2	199000	f	f	published	2026-02-11 22:43:44.562	\N	\N	2026-02-11 22:43:44.568745	2026-03-14 23:26:56.895884	\N	\N
3	6	3	Киновечер с сюрпризами	home-movie-night	Уютный вечер дома с интерактивными заданиями	Домашний квест для пар, которые любят проводить время вдвоем. Фильмы, игры, вкусная еда и романтическая атмосфера.	\N	\N	\N	easy	240	indoor	1	1	{"timeline": true, "surprises": 3, "activities": ["movie", "games", "dinner"]}	["фильмы", "игры", "романтический ужин"]	{}	2981	6	4.57	7	0	t	f	published	2026-02-11 22:43:44.563	\N	\N	2026-02-11 22:43:44.569897	2026-03-15 00:09:14.782272	\N	\N
10	6	\N	1	1	\N	2	\N	\N	\N	medium	60	universal	\N	\N	{"phases": []}	[]	{}	2	0	0.00	0	0	t	f	draft	2026-02-28 23:59:18.52693	\N	\N	2026-02-28 23:59:07.319649	2026-03-14 14:48:36.393093	\N	\N
6	6	6	Гастрономическое путешествие	gourmet-food-journey	Откройте вкус любви	Кулинарный квест с посещением лучших ресторанов и кафе города. Дегустации, мастер-классы и романтический ужин.	\N	\N	\N	medium	360	city	4	6	{"phases": []}	["дегустация", "мастер-класс", "ужин", "вино"]	{}	2047	4	4.33	6	1099000	f	t	published	2026-02-11 22:43:44.563	\N	\N	2026-02-11 22:43:44.574059	2026-03-15 00:10:28.458764	\N	\N
4	6	4	Экстремальный вызов	extreme-outdoor-challenge	Для тех, кто любит адреналин	Активный квест с элементами экстрима: веревочный парк, скалолазание, квадроциклы. Для спортивных пар!	\N	\N	\N	expert	300	universal	3	5	{"challenges": ["rope_park", "climbing", "atv"], "difficulty_levels": ["medium", "hard", "expert"]}	["экстрим", "спорт", "адреналин", "активный отдых"]	{}	4187	15	4.50	4	499000	f	t	published	2026-02-11 22:43:44.563	\N	\N	2026-02-11 22:43:44.570879	2026-03-15 00:10:28.461104	\N	\N
9	6	1	Мир	mir	круть	Привет	/uploads/templates/images-1773501034432-553965924.png	["/uploads/templates/images-1773501034432-553965924.png", "/uploads/templates/images-1773501044195-846900660.jpg"]	\N	medium	60	universal	\N	\N	{}	["1", "2", "3"]	{}	820	7	0.00	0	0	t	f	published	2026-02-28 23:46:13.7431	\N	\N	2026-02-28 23:42:20.575731	2026-03-15 00:13:19.987826	7	Хай
1	6	1	Романтическое приключение по городу	romantic-city-adventure	Откройте город заново вместе	Увлекательный квест по самым романтичным местам города. Включает посещение 5-7 локаций с интересными заданиями, фотозонами и сюрпризами.	\N	\N	\N	medium	180	city	5	7	{"intro": {"type": "story", "required": true}, "finale": {"type": "surprise", "required": true}, "locations": [{"name": "Центральная площадь", "task_type": "riddle"}, {"name": "Набережная", "task_type": "photo"}, {"name": "Старый парк", "task_type": "code"}, {"name": "Смотровая площадка", "task_type": "puzzle"}, {"name": "Романтическое кафе", "task_type": "surprise"}]}	["загадки", "фото-задания", "подсказки", "романтическая история"]	{}	4966	3	4.25	4	299000	f	f	published	2026-02-11 22:43:44.562	\N	\N	2026-02-11 22:43:44.564213	2026-03-14 23:51:18.176726	\N	\N
5	6	5	Арт-тур по музеям	museum-art-tour	Культурное свидание для эстетов	Посещение 2-3 музеев или галерей с интересными заданиями. Узнайте больше об искусстве вместе!	\N	\N	\N	medium	240	city	2	3	{"museums": ["modern_art", "history", "contemporary"], "tasks_per_museum": 3}	["культура", "искусство", "образование", "красота"]	{}	5535	3	4.50	2	349000	f	f	published	2026-02-11 22:43:44.563	\N	\N	2026-02-11 22:43:44.572203	2026-03-15 00:10:28.455656	\N	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.reviews (id, template_id, client_name, client_email, rating, title, comment, images, is_verified, is_featured, helpful_count, created_at, updated_at) FROM stdin;
1	1	Клиент 1	reviewer1@example.com	4	Очень понравилось	Квест понравился, но некоторые задания были слишком простыми	[]	t	f	0	2026-01-27 06:39:31.606	2026-02-11 22:43:44.597067
2	1	Клиент 2	reviewer2@example.com	5	Отлично провели время	Замечательно провели время! Спасибо автору за креатив!	[]	t	f	0	2026-01-02 23:38:11.448	2026-02-11 22:43:44.599145
3	1	Клиент 3	reviewer3@example.com	4	Рекомендую	Квест понравился, но некоторые задания были слишком простыми	[]	t	f	0	2026-01-11 20:55:30.84	2026-02-11 22:43:44.600147
4	1	Клиент 4	reviewer4@example.com	4	Стоит своих денег	Идеально для романтического свидания!	[]	t	f	0	2025-12-29 07:44:23.152	2026-02-11 22:43:44.601385
5	2	Клиент 5	reviewer5@example.com	5	Лучшее свидание!	Интересный маршрут, красивые места	[]	t	f	0	2026-02-09 07:26:49.686	2026-02-11 22:43:44.602291
6	2	Клиент 6	reviewer6@example.com	4	Стоит своих денег	Хороший квест, но можно было бы добавить больше сложных заданий	[]	t	f	0	2026-02-02 12:23:32.244	2026-02-11 22:43:44.603018
8	3	Клиент 8	reviewer8@example.com	4	Отлично провели время	Замечательно провели время! Спасибо автору за креатив!	[]	t	f	0	2026-02-07 16:46:19.868	2026-02-11 22:43:44.604273
9	3	Клиент 9	reviewer9@example.com	5	Отлично провели время	Идеально для романтического свидания!	[]	t	f	0	2026-01-17 16:29:46.74	2026-02-11 22:43:44.605059
10	3	Клиент 10	reviewer10@example.com	5	Всем советую	Интересный маршрут, красивые места	[]	t	f	0	2025-12-17 17:11:09.286	2026-02-11 22:43:44.605811
11	3	Клиент 11	reviewer11@example.com	5	Супер квест!	Отличный квест! Очень понравился, будем заказывать еще!	[]	t	f	0	2025-12-23 17:12:59.396	2026-02-11 22:43:44.606358
12	3	Клиент 12	reviewer12@example.com	4	Незабываемо	Превзошло все ожидания! Очень оригинально!	[]	t	f	0	2026-01-13 22:51:41.329	2026-02-11 22:43:44.606853
13	4	Клиент 13	reviewer13@example.com	4	Супер квест!	Хороший квест, но можно было бы добавить больше сложных заданий	[]	f	f	0	2025-12-22 08:20:09.076	2026-02-11 22:43:44.607364
14	4	Клиент 14	reviewer14@example.com	4	Рекомендую	Квест понравился, но некоторые задания были слишком простыми	[]	f	f	0	2025-12-18 00:48:29.539	2026-02-11 22:43:44.608388
16	4	Клиент 16	reviewer16@example.com	5	Рекомендую	Отличная организация, все четко и по времени	[]	t	f	0	2026-01-13 06:30:14.473	2026-02-11 22:43:44.609989
17	5	Клиент 17	reviewer17@example.com	4	Супер квест!	Хороший квест, но можно было бы добавить больше сложных заданий	[]	t	f	0	2025-12-18 18:24:43.711	2026-02-11 22:43:44.610569
18	5	Клиент 18	reviewer18@example.com	5	Отличная идея	Отличный квест! Очень понравился, будем заказывать еще!	[]	t	f	0	2026-02-03 02:16:58.688	2026-02-11 22:43:44.611099
19	6	Клиент 19	reviewer19@example.com	4	Незабываемо	Замечательно провели время! Спасибо автору за креатив!	[]	f	f	0	2026-01-10 19:25:35.555	2026-02-11 22:43:44.611606
20	6	Клиент 20	reviewer20@example.com	5	Стоит своих денег	Идеально для романтического свидания!	[]	t	f	0	2026-01-04 01:08:46.759	2026-02-11 22:43:44.612114
21	6	Клиент 21	reviewer21@example.com	4	Всем советую	Хороший квест, но можно было бы добавить больше сложных заданий	[]	t	f	0	2025-12-18 21:37:52.876	2026-02-11 22:43:44.612698
22	6	Клиент 22	reviewer22@example.com	4	Очень понравилось	Идеально для романтического свидания!	[]	t	f	0	2026-01-25 10:54:57.3	2026-02-11 22:43:44.613666
23	6	Клиент 23	reviewer23@example.com	4	Лучшее свидание!	Отличная организация, все четко и по времени	[]	f	f	0	2025-12-20 11:10:33.936	2026-02-11 22:43:44.614385
24	6	Клиент 24	reviewer24@example.com	5	Креативно и интересно	Незабываемые впечатления! Рекомендую!	[]	t	f	0	2026-01-03 18:57:53.09	2026-02-11 22:43:44.614989
7	3	Клиент 7	reviewer7@example.com	5	Лучшее свидание!	Идеально для романтического свидания!	[]	f	f	1	2026-01-16 23:09:10.962	2026-02-28 00:05:09.010486
25	3	Паша	pv.pasha@mail.ru	4	12345	123456789	[]	f	f	2	2026-02-27 07:06:14.50125	2026-02-28 00:05:14.536753
15	4	Клиент 15	reviewer15@example.com	5	Всем советую	Превзошло все ожидания! Очень оригинально!	[]	f	f	1	2026-02-02 11:06:55.942	2026-03-08 15:03:17.372276
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.tags (id, name, slug, usage_count, created_at) FROM stdin;
11	сюрприз	сюрприз	0	2026-02-11 22:43:44.56031
12	предложение руки и сердца	предложение-руки-и-сердца	0	2026-02-11 22:43:44.560496
13	годовщина	годовщина	0	2026-02-11 22:43:44.560683
16	головоломки	головоломки	0	2026-02-11 22:43:44.561323
17	квест-комната	квест-комната	0	2026-02-11 22:43:44.561528
19	зимний	зимний	0	2026-02-11 22:43:44.561928
20	летний	летний	0	2026-02-11 22:43:44.562136
21	весенний	весенний	0	2026-02-11 22:43:44.562314
22	осенний	осенний	0	2026-02-11 22:43:44.562486
10	фотосессия	фотосессия	1	2026-02-11 22:43:44.560127
4	природа	природа	1	2026-02-11 22:43:44.558499
14	первое свидание	первое-свидание	1	2026-02-11 22:43:44.560864
5	активный отдых	активный-отдых	1	2026-02-11 22:43:44.558825
18	на свежем воздухе	на-свежем-воздухе	2	2026-02-11 22:43:44.561722
6	культура	культура	1	2026-02-11 22:43:44.559182
7	искусство	искусство	1	2026-02-11 22:43:44.559485
8	еда	еда	1	2026-02-11 22:43:44.559718
9	винные дегустации	винные-дегустации	1	2026-02-11 22:43:44.559932
3	город	город	3	2026-02-11 22:43:44.558157
1	романтика	романтика	4	2026-02-11 22:43:44.55662
2	приключения	приключения	2	2026-02-11 22:43:44.557599
15	загадки	загадки	3	2026-02-11 22:43:44.561115
\.


--
-- Data for Name: template_tags; Type: TABLE DATA; Schema: public; Owner: quest_user
--

COPY public.template_tags (template_id, tag_id) FROM stdin;
1	1
1	3
1	15
1	10
2	1
2	4
2	15
2	18
3	1
3	14
4	2
4	5
4	18
5	6
5	7
5	3
6	8
6	9
6	3
6	1
9	2
9	15
\.


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.authors_id_seq', 6, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: created_quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.created_quests_id_seq', 9, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.orders_id_seq', 40, true);


--
-- Name: quest_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.quest_sessions_id_seq', 45, true);


--
-- Name: quest_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.quest_templates_id_seq', 10, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.reviews_id_seq', 25, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: quest_user
--

SELECT pg_catalog.setval('public.tags_id_seq', 22, true);


--
-- Name: authors authors_email_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_email_key UNIQUE (email);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: authors authors_username_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_username_key UNIQUE (username);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: created_quests created_quests_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_pkey PRIMARY KEY (id);


--
-- Name: created_quests created_quests_slug_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_slug_key UNIQUE (slug);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: quest_sessions quest_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_sessions
    ADD CONSTRAINT quest_sessions_pkey PRIMARY KEY (id);


--
-- Name: quest_templates quest_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_pkey PRIMARY KEY (id);


--
-- Name: quest_templates quest_templates_slug_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_slug_key UNIQUE (slug);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: template_tags template_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.template_tags
    ADD CONSTRAINT template_tags_pkey PRIMARY KEY (template_id, tag_id);


--
-- Name: idx_authors_username; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_authors_username ON public.authors USING btree (username);


--
-- Name: idx_authors_verified; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_authors_verified ON public.authors USING btree (is_verified);


--
-- Name: idx_created_quests_order; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_created_quests_order ON public.created_quests USING btree (order_id);


--
-- Name: idx_created_quests_slug; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_created_quests_slug ON public.created_quests USING btree (slug);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_template; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_orders_template ON public.orders USING btree (template_id);


--
-- Name: idx_reviews_created; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_reviews_created ON public.reviews USING btree (created_at DESC);


--
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating DESC);


--
-- Name: idx_reviews_template; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_reviews_template ON public.reviews USING btree (template_id);


--
-- Name: idx_sessions_id; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_sessions_id ON public.quest_sessions USING btree (session_id);


--
-- Name: idx_sessions_quest; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_sessions_quest ON public.quest_sessions USING btree (created_quest_id);


--
-- Name: idx_tags_slug; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_tags_slug ON public.tags USING btree (slug);


--
-- Name: idx_template_tags_tag; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_template_tags_tag ON public.template_tags USING btree (tag_id);


--
-- Name: idx_template_tags_template; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_template_tags_template ON public.template_tags USING btree (template_id);


--
-- Name: idx_templates_author; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_author ON public.quest_templates USING btree (author_id);


--
-- Name: idx_templates_category; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_category ON public.quest_templates USING btree (category_id);


--
-- Name: idx_templates_orders; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_orders ON public.quest_templates USING btree (orders_count DESC);


--
-- Name: idx_templates_published; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_published ON public.quest_templates USING btree (published_at DESC) WHERE ((status)::text = 'published'::text);


--
-- Name: idx_templates_rating; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_rating ON public.quest_templates USING btree (rating DESC);


--
-- Name: idx_templates_search; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_search ON public.quest_templates USING gin (to_tsvector('russian'::regconfig, (((title)::text || ' '::text) || description)));


--
-- Name: idx_templates_slug; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_slug ON public.quest_templates USING btree (slug);


--
-- Name: idx_templates_status; Type: INDEX; Schema: public; Owner: quest_user
--

CREATE INDEX idx_templates_status ON public.quest_templates USING btree (status);


--
-- Name: quest_templates update_author_stats_trigger; Type: TRIGGER; Schema: public; Owner: quest_user
--

CREATE TRIGGER update_author_stats_trigger AFTER INSERT OR UPDATE ON public.quest_templates FOR EACH ROW EXECUTE FUNCTION public.update_author_stats();


--
-- Name: authors update_authors_updated_at; Type: TRIGGER; Schema: public; Owner: quest_user
--

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: quest_user
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: quest_user
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: template_tags update_tag_count; Type: TRIGGER; Schema: public; Owner: quest_user
--

CREATE TRIGGER update_tag_count AFTER INSERT OR DELETE ON public.template_tags FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage_count();


--
-- Name: reviews update_template_rating_trigger; Type: TRIGGER; Schema: public; Owner: quest_user
--

CREATE TRIGGER update_template_rating_trigger AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_template_rating();


--
-- Name: quest_templates update_templates_updated_at; Type: TRIGGER; Schema: public; Owner: quest_user
--

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.quest_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: created_quests created_quests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: created_quests created_quests_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.created_quests
    ADD CONSTRAINT created_quests_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE SET NULL;


--
-- Name: orders fk_orders_created_quest; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_created_quest FOREIGN KEY (created_quest_id) REFERENCES public.created_quests(id) ON DELETE SET NULL;


--
-- Name: orders orders_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE SET NULL;


--
-- Name: quest_sessions quest_sessions_created_quest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_sessions
    ADD CONSTRAINT quest_sessions_created_quest_id_fkey FOREIGN KEY (created_quest_id) REFERENCES public.created_quests(id) ON DELETE CASCADE;


--
-- Name: quest_templates quest_templates_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


--
-- Name: quest_templates quest_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: quest_templates quest_templates_demo_quest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.quest_templates
    ADD CONSTRAINT quest_templates_demo_quest_id_fkey FOREIGN KEY (demo_quest_id) REFERENCES public.created_quests(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE CASCADE;


--
-- Name: template_tags template_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.template_tags
    ADD CONSTRAINT template_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: template_tags template_tags_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quest_user
--

ALTER TABLE ONLY public.template_tags
    ADD CONSTRAINT template_tags_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quest_templates(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 4ICaxnYLLUgjfpZsFvY5U7amtvKzecHo44t13pE4vISJGCmbePuDPwtSVf7E7r5

