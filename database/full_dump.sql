--
-- PostgreSQL database dump
--

\restrict QP9dKdWPgPBztiXgaDtcC7ITakxmm1ryLb6yQf261Lbff3MKcTOaGYNjQHxegpg

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
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.authors (id, username, email, display_name, bio, avatar_url, website, social_links, is_verified, total_templates, average_rating, created_at, updated_at) FROM stdin;
6	vlad	vp.vlad00@mail.ru	Лиза Петри	Создаю персональные свидания-квесты с 2024 года. Каждый сценарий — с нуля под вашу пару: ваш город, ваши места, ваша история.	/uploads/avatars/liza.jpg	\N	{}	t	7	3.36	2026-02-20 23:59:14.038023	2026-03-23 06:02:27.556302
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
-- Data for Name: created_quests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.created_quests (id, order_id, template_id, slug, access_code, title, client_name, blocks, is_public, views_count, started_count, completed_count, published_at, expires_at, created_at, updated_at, theme, final_message, show_intro) FROM stdin;
15	\N	11	detective-home-demo	\N	Детективное расследование	Дорогой детектив	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Входящее сообщение", "points": 10, "description": "«Добрый вечер, детектив. Нам поступил сигнал о пропаже. Изучите материалы дела и приступайте к работе. Времени мало.»"}, {"id": "t2", "hint": "Замените каждую букву на предыдущую в алфавите", "type": "riddle", "title": "Зашифрованная записка", "answer": "СНОВА ИДИ", "points": 20, "description": "На столе найдена записка. Каждая буква заменена следующей по алфавиту. Расшифруйте: «ТНЖБТ ДПДЙ»"}], "title": "Первая улика", "description": "Детектив получает первое задание."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Алиби — вопрос 1", "points": 15, "game_type": "quiz", "description": "Детектив проверяет алиби.", "game_correct": 1, "game_options": ["Читал", "Смотрел телефон", "Готовил", "Смотрел в окно"], "game_question": "Что партнёр делал последние 30 минут?"}, {"id": "t4", "type": "mini_game", "title": "Алиби — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Чай", "Кофе", "Воду", "Сок"], "game_question": "Какой напиток партнёр выпил сегодня последним?"}], "title": "Допрос свидетеля", "description": "Детектив проверяет алиби."}, {"id": "b3", "tasks": [{"id": "t5", "hint": "Всегда с вами", "type": "riddle", "title": "Загадка номер один", "answer": "ТЕЛЕФОН", "points": 25, "description": "«Меня берут в руки, когда хотят поговорить. Меня кладут в карман, когда разговор окончен. Без меня вы не нашли бы друг друга в первый день. Что я такое?»"}, {"id": "t6", "hint": "Вспомните самое начало", "type": "riddle", "title": "Загадка номер два", "answer": "СООБЩЕНИЕ", "points": 25, "description": "«Я был первым что вы написали друг другу. Я не занимаю места, но занимаю память. Я короткий, но важный. Что я такое?»"}], "title": "Вещественные доказательства", "description": "Важные улики по делу."}, {"id": "b4", "tasks": [{"id": "t7", "type": "mini_game", "pairs": [{"left": "Волнение", "right": "Первое свидание"}, {"left": "Радость", "right": "Когда смеётесь вместе"}, {"left": "Тепло", "right": "Когда обнимаетесь"}, {"left": "Спокойствие", "right": "Когда молчите рядом"}], "title": "Соедините пары", "points": 30, "game_type": "pairs", "description": "Соедините каждое чувство с подходящим моментом."}], "title": "Реконструкция событий", "description": "Детектив восстанавливает хронологию."}, {"id": "b5", "tasks": [{"id": "t8", "type": "text_answer", "title": "Показания", "points": 20, "description": "Вопрос: «Опишите одним предложением что вам больше всего нравится в вашем партнёре»", "placeholder": "Введите показания..."}], "title": "Показания очевидца", "description": "Главный свидетель готов говорить."}, {"id": "b6", "tasks": [{"id": "t9", "hint": "Посоветуйтесь с партнёром", "type": "riddle", "title": "Финальный код", "answer": "ЛЮБОЙ", "points": 50, "description": "Последняя улика. Код — это год когда вы впервые встретились. Введите его чтобы закрыть дело.", "ignore_answer": true}], "title": "Дело закрыто", "description": "Финал расследования."}]	t	2	1	1	2026-03-15 09:04:55.033837	\N	2026-03-15 09:04:55.033837	2026-03-15 09:04:55.033837	detective	Дело раскрыто! Вы оказались блестящими детективами. А сюрприз, который вы искали всё это время — это сам вечер, который вы провели вместе.	t
16	\N	12	time-machine-home-demo	\N	Машина времени	Дорогой путешественник	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Бортовой журнал", "points": 10, "description": "Вы садитесь в машину времени. Маршрут: назад по вашей общей истории. Первая остановка — самое начало."}], "title": "Отправление", "description": "Машина времени готова к запуску."}, {"id": "b2", "tasks": [{"id": "t2", "type": "mini_game", "title": "Проверка памяти — вопрос 1", "points": 15, "game_type": "quiz", "description": "Насколько хорошо вы помните первые дни?", "game_correct": 0, "game_options": ["Я", "Партнёр", "Оба одновременно", "Уже не помню"], "game_question": "Кто первым написал сообщение?"}, {"id": "t3", "type": "mini_game", "title": "Проверка памяти — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Интерес", "Волнение", "Симпатию", "Ничего особенного поначалу"], "game_question": "Что вы почувствовали при первой встрече?"}], "title": "Первая остановка: Знакомство", "description": "Проверка памяти о первых днях."}, {"id": "b3", "tasks": [{"id": "t4", "hint": "Спросите у партнёра если не помните", "type": "riddle", "title": "Что было на первом свидании?", "answer": "ЛЮБОЙ", "points": 20, "description": "Вспомните первое свидание. Что вы ели или пили? Введите одно слово.", "ignore_answer": true}, {"id": "t5", "type": "text_answer", "title": "Что вы думали тогда", "points": 25, "description": "Напишите одну мысль которая у вас была в тот вечер. Можно то чего не говорили вслух.", "placeholder": "Я тогда думал(а)..."}], "title": "Вторая остановка: Первое свидание", "description": "Тот вечер когда всё стало понятно."}, {"id": "b4", "tasks": [{"id": "t6", "type": "mini_game", "pairs": [{"left": "Первый раз остались на ночь", "right": "Близость"}, {"left": "Первая поездка вместе", "right": "Приключение"}, {"left": "Первая ссора и примирение", "right": "Понимание"}, {"left": "Сказали «я тебя люблю»", "right": "Смелость"}], "title": "Наши моменты", "points": 30, "game_type": "pairs", "description": "Соедините описание момента с тем что вы почувствовали."}], "title": "Третья остановка: Важный момент", "description": "Когда стало понятно что это серьёзно."}, {"id": "b5", "tasks": [{"id": "t7", "type": "text_answer", "title": "Послание в будущее", "points": 40, "description": "Напишите одно предложение — что бы вы хотели чтобы будущая версия вас знала об этих отношениях.", "placeholder": "Я хочу чтобы ты знал(а)..."}], "title": "Возвращение: Сейчас", "description": "Машина времени доставила вас обратно."}]	t	0	0	0	2026-03-15 09:04:55.036071	\N	2026-03-15 09:04:55.036071	2026-03-15 09:04:55.036071	romantic	Вы вернулись. Путешествие завершено — но история продолжается. Спасибо за каждый момент, который вы создали вместе.	t
17	\N	13	treasure-hunter-home-demo	\N	Искатель клада	Отважный искатель	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Послание капитана", "points": 10, "description": "«Смелый мореход! Ты получил карту к величайшему сокровищу. Путь непрост, но достоин двоих. Семь испытаний ждут тебя. Готовься.»"}, {"id": "t2", "hint": "А=1, Б=2, В=3, Г=4... Л=12", "type": "riddle", "title": "Первый шифр", "answer": "КЛАД", "points": 25, "description": "Числовой шифр: 3-1-12-1-4. Каждая цифра — номер буквы в алфавите. Расшифруй слово."}], "title": "Карта капитана", "description": "Первая отметка на карте."}, {"id": "b2", "tasks": [{"id": "t3", "hint": "Это нематериально", "type": "riddle", "title": "Загадка острова", "answer": "ЯМА", "points": 20, "description": "«Чем больше берёшь — тем больше становится. Что это?»"}, {"id": "t4", "hint": "Смотрите на это каждый день но не видите", "type": "riddle", "title": "Вторая загадка", "answer": "БУДУЩЕЕ", "points": 20, "description": "«Всегда перед вами, но увидеть невозможно. Что это?»"}], "title": "Остров загадок", "description": "Второй этап пути."}, {"id": "b3", "tasks": [{"id": "t5", "type": "mini_game", "title": "Испытание знанием — вопрос 1", "points": 20, "game_type": "quiz", "description": "Капитан проверяет знаете ли вы своего спутника.", "game_correct": 2, "game_options": ["Утро", "День", "Вечер", "Ночь"], "game_question": "Какое любимое время суток у партнёра?"}, {"id": "t6", "type": "mini_game", "title": "Испытание знанием — вопрос 2", "points": 20, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Дома", "Гулять", "С друзьями", "Путешествовать"], "game_question": "Как партнёр предпочитает проводить выходной?"}], "title": "Пещера испытаний", "description": "Проверка знания партнёра."}, {"id": "b4", "tasks": [{"id": "t7", "hint": "Это то чем делятся", "type": "riddle", "title": "Код от сундука", "answer": "УЛЫБКА", "points": 30, "description": "«Я есть у каждого, но у тебя другой чем у меня. Ты можешь отдать его мне, и у тебя станет больше, не меньше.»"}], "title": "Бухта сокровищ", "description": "Четвёртый этап."}, {"id": "b5", "tasks": [{"id": "t8", "type": "mini_game", "pairs": [{"left": "Забота", "right": "Спрашивает как дела"}, {"left": "Честность", "right": "Говорит правду даже когда трудно"}, {"left": "Юмор", "right": "Умеет рассмешить"}, {"left": "Надёжность", "right": "Всегда рядом когда нужно"}], "title": "Соедините ценности", "points": 30, "game_type": "pairs", "description": "Соедините каждое качество с тем как оно проявляется у партнёра."}], "title": "Карта сердца", "description": "Пятый этап."}, {"id": "b6", "tasks": [{"id": "t9", "type": "text_answer", "title": "Послание пирата", "points": 20, "description": "Капитан требует последнее доказательство. Напиши одно слово — то которым ты бы описал сегодняшний вечер.", "placeholder": "Одно слово..."}], "title": "Последнее испытание", "description": "Шестой этап."}, {"id": "b7", "tasks": [{"id": "t10", "hint": "Посмотри на человека рядом", "type": "riddle", "title": "Главная загадка", "answer": "ЛЮБОВЬ", "points": 50, "description": "«Я не золото и не серебро. Меня нельзя купить. Но именно из-за меня стоило пройти весь этот путь. Что я такое?»"}], "title": "Клад найден", "description": "Финал."}]	t	0	0	0	2026-03-15 09:04:55.037231	\N	2026-03-15 09:04:55.037231	2026-03-15 09:04:55.037231	treasure	Клад найден! Семь испытаний позади. Настоящее сокровище — это не то что в конце карты. Это тот, кто прошёл этот путь рядом с вами.	t
18	\N	14	starry-night-home-demo	\N	Звёздная ночь	Дорогой космонавт	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Сигнал из космоса", "points": 10, "description": "«Бортовой журнал, дата: сегодня. Мы отправляемся в межзвёздное путешествие. Впереди пять планет. На каждой — своя миссия. Экипаж готов.»"}, {"id": "t2", "hint": "Это то что между вами прямо сейчас", "type": "riddle", "title": "Координаты первой планеты", "answer": "БЛИЗОСТЬ", "points": 20, "description": "«Я нахожусь везде где есть два человека, которым хорошо вместе. Я невидима, но очень ощутима. Меня не передать словами, но вы оба знаете что я есть. Что я такое?»"}], "title": "Планета Начала", "description": "Первая планета в вашей галактике."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Архив галактики — вопрос 1", "points": 20, "game_type": "quiz", "description": "Проверка памяти космонавтов.", "game_correct": 0, "game_options": ["Молчит", "Говорит больше обычного", "Смеётся", "Теребит что-то в руках"], "game_question": "Что партнёр делает когда нервничает?"}, {"id": "t4", "type": "mini_game", "title": "Архив галактики — вопрос 2", "points": 20, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Объятие", "Разговор", "Сам подходит", "Молчанием"], "game_question": "Как партнёр предпочитает мириться после ссоры?"}], "title": "Планета Воспоминаний", "description": "Архив ваших совместных моментов."}, {"id": "b3", "tasks": [{"id": "t5", "type": "text_answer", "title": "Межзвёздное послание", "points": 35, "description": "Напиши партнёру три вещи за которые ты благодарен(а) прямо сейчас. Можно совсем маленькие.", "placeholder": "1. Спасибо за...\\n2. Спасибо за...\\n3. Спасибо за..."}], "title": "Планета Признаний", "description": "На этой планете говорят то что думают."}, {"id": "b4", "tasks": [{"id": "t6", "type": "mini_game", "pairs": [{"left": "Терпение", "right": "Никогда не торопит меня"}, {"left": "Любопытство", "right": "Хочет узнать что-то новое"}, {"left": "Тепло", "right": "Умеет создать уют"}, {"left": "Смелость", "right": "Говорит о чувствах"}], "title": "Карта звёздного характера", "points": 30, "game_type": "pairs", "description": "Соедините каждую черту с тем как она проявляется у партнёра."}], "title": "Планета Открытий", "description": "Открываем что-то новое друг о друге."}, {"id": "b5", "tasks": [{"id": "t7", "type": "text_answer", "title": "Координаты мечты", "points": 40, "description": "Напиши одну вещь которую хочешь сделать с партнёром в этом году.", "placeholder": "Я хочу чтобы мы..."}], "title": "Планета Мечт", "description": "Последняя планета — о будущем."}]	t	0	0	0	2026-03-15 09:04:55.038312	\N	2026-03-15 09:04:55.038312	2026-03-15 09:04:55.038312	mystery	Путешествие завершено. Вы побывали на пяти планетах и вернулись домой. Знаете что осталось неизменным? То, что вы рядом.	t
19	\N	15	chocolate-detective-home-demo	\N	Шоколадный детектив	Дорогой сладкоежка	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Сигнал тревоги", "points": 10, "description": "«Дорогой детектив! ЧП на кухне. Самый вкусный десерт исчез бесследно. Подозреваемых нет. Только вы можете раскрыть это дело.»"}, {"id": "t2", "hint": "Итальянский десерт", "type": "riddle", "title": "Первая улика", "answer": "ТИРАМИСУ", "points": 20, "description": "«Я сладкий снаружи и внутри. Меня едят в хорошую погоду и в плохую. Лучше всего сочетаюсь с кофе. Что я такое?»"}], "title": "Пропажа десерта", "description": "Срочное сообщение от шеф-повара."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Допрос о вкусах — вопрос 1", "points": 15, "game_type": "quiz", "description": "Детектив выясняет вкусовые предпочтения.", "game_correct": 0, "game_options": ["Торт", "Мороженое", "Пирожное", "Фруктовый салат"], "game_question": "Что партнёр выбирает в кафе на десерт?"}, {"id": "t4", "type": "mini_game", "title": "Допрос о вкусах — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 1, "game_options": ["Тёмный", "Молочный", "Белый", "Не ест шоколад"], "game_question": "Какой шоколад партнёр предпочитает?"}], "title": "Вкусовые показания", "description": "Свидетели дают показания."}, {"id": "b3", "tasks": [{"id": "t5", "hint": "Без этого еда невкусная", "type": "riddle", "title": "Загадка шеф-повара", "answer": "СОЛЬ", "points": 20, "description": "«Я есть в каждом доме. Без меня невозможно приготовить ни одно блюдо. Без меня вкус плоский. Что я такое?»"}, {"id": "t6", "hint": "Противоположность сладкого", "type": "riddle", "title": "Вторая кухонная загадка", "answer": "ГОРЕЧЬ", "points": 20, "description": "«Меня боятся сладкоежки, но без меня не бывает настоящего шоколада. Без меня всё слишком приторно. Что я такое?»"}], "title": "Улики на кухне", "description": "Детектив исследует место преступления."}, {"id": "b4", "tasks": [{"id": "t7", "type": "mini_game", "pairs": [{"left": "Сладкий", "right": "Когда всё хорошо"}, {"left": "Острый", "right": "Когда смеётесь до слёз"}, {"left": "Горький", "right": "Когда скучаете друг по другу"}, {"left": "Кислый", "right": "Когда спорите но остаётесь вместе"}], "title": "Вкусы и моменты", "points": 30, "game_type": "pairs", "description": "Соедините каждый вкус с подходящим совместным моментом."}], "title": "Сладкие воспоминания", "description": "Показания о совместных кулинарных моментах."}, {"id": "b5", "tasks": [{"id": "t8", "type": "text_answer", "title": "Рецепт идеального вечера", "points": 25, "description": "Запишите рецепт. Что нужно чтобы вечер с партнёром стал особенным? Перечислите 3-5 пунктов.", "placeholder": "Нужно взять..."}], "title": "Признание", "description": "Главный свидетель раскрывает тайну."}, {"id": "b6", "tasks": [{"id": "t9", "hint": "Это то что вы чувствуете прямо сейчас", "type": "riddle", "title": "Последняя улика", "answer": "СЧАСТЬЕ", "points": 50, "description": "«Я слаще любого десерта. Меня нельзя приготовить по рецепту. Я появляюсь сама когда рядом нужный человек. Что я такое?»"}], "title": "Дело раскрыто", "description": "Финал расследования."}]	t	1	0	0	2026-03-15 09:04:55.039513	\N	2026-03-15 09:04:55.039513	2026-03-15 09:04:55.039513	romantic	Дело о пропавшем десерте раскрыто. Виновник — этот уютный вечер, который украл время и превратил его в нечто особенное.	t
22	\N	16	proposal-home-demo	\N	Момент навсегда	Дорогая	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Для тебя", "points": 10, "description": "Сегодня вечер только для нас. Никаких планов, никаких забот. Просто мы двое и небольшое путешествие по нашей истории. Начнём?"}, {"id": "t2", "hint": "Подумай о нашем самом первом совместном моменте", "type": "riddle", "title": "Первая загадка", "answer": "ПЕРВОЕ СВИДАНИЕ", "points": 20, "description": "Я случился однажды и не повторился больше. Я был первым для нас обоих. Ты помнишь каждую деталь того дня. Что я такое?", "ignore_answer": true}], "title": "Первый момент", "description": "Всё начинается здесь."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Ты знаешь меня — вопрос 1", "points": 20, "game_type": "quiz", "description": "Маленький тест — насколько хорошо мы знаем друг друга.", "game_correct": 0, "game_options": ["Молчу", "Много говорю", "Смеюсь", "Теребю что-нибудь"], "game_question": "Что я делаю когда нервничаю?"}, {"id": "t4", "type": "mini_game", "title": "Ты знаешь меня — вопрос 2", "points": 20, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Первая встреча", "Первое признание", "Первое путешествие", "Когда ты был(а) рядом в трудный момент"], "game_question": "Какой момент я считаю самым важным в нашей паре?"}], "title": "Наша история", "description": "То что мы помним только вдвоём."}, {"id": "b3", "tasks": [{"id": "t5", "type": "mini_game", "pairs": [{"left": "Когда ты смеёшься", "right": "Хочу чтобы это длилось вечно"}, {"left": "Когда тебе грустно", "right": "Готов(а) на всё чтобы помочь"}, {"left": "Когда ты рядом", "right": "Мне не нужно ничего больше"}, {"left": "Когда ты далеко", "right": "Считаю часы до встречи"}], "title": "Моменты и чувства", "points": 30, "game_type": "pairs", "description": "Соедини каждый наш момент с тем что я чувствую."}], "title": "Что ты для меня значишь", "description": "Иногда слова важнее всего."}, {"id": "b4", "tasks": [{"id": "t6", "type": "text_answer", "title": "Напиши мне", "points": 30, "description": "Прежде чем идти дальше — напиши одно предложение. Что для тебя значат наши отношения?", "placeholder": "Для меня это..."}], "title": "Признание", "description": "Самое честное что я могу сказать."}, {"id": "b5", "tasks": [{"id": "t7", "hint": "Посмотри на человека рядом — у него есть ответ", "type": "riddle", "title": "Последняя загадка", "answer": "КОЛЬЦО", "points": 100, "description": "Я маленький и круглый. Я ничего не вешу, но несу в себе всё. Я задаю вопрос без слов. Что я такое?"}], "title": "Финальный момент", "description": "Самое важное — впереди."}]	t	17	1	1	2026-03-15 18:58:13.433353	\N	2026-03-15 18:58:13.433353	2026-03-15 18:58:13.433353	proposal	Ты — лучшее что случилось в моей жизни. Каждый день рядом с тобой — подарок. И я хочу чтобы таких дней было как можно больше.	t
23	\N	17	proposal-moscow-demo	\N	Предложение в Москве	Дорогая	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Послание", "points": 10, "description": "Сегодня Москва — наша. Впереди несколько остановок, каждая из которых — часть нашей истории. Следуй подсказкам."}, {"id": "t2", "hint": "Главная площадь Москвы", "type": "riddle", "title": "Первая загадка", "answer": "КРАСНАЯ ПЛОЩАДЬ", "points": 25, "description": "Я есть в каждом городе, но у каждого своя. Сюда приходят с мечтами. Отсюда уходят с надеждой. Здесь бьётся сердце города. Что это?", "ignore_answer": true}], "title": "Маршрут получен", "description": "Особый день в особом городе."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Город нашей истории — вопрос 1", "points": 20, "game_type": "quiz", "description": "Вопросы о наших московских моментах.", "game_correct": 0, "game_options": ["В парке", "В кафе", "В музее", "На набережной"], "game_question": "Где мы были в первый раз вдвоём в Москве?"}, {"id": "t4", "type": "mini_game", "title": "Город нашей истории — вопрос 2", "points": 20, "game_type": "quiz", "description": "", "game_correct": 3, "game_options": ["Арбат", "Патриаршие", "Замоскворечье", "Это наше место"], "game_question": "Какой район Москвы нравится нам больше всего?"}], "title": "Наши места", "description": "Город который помнит нас."}, {"id": "b3", "tasks": [{"id": "t5", "hint": "То что между нами", "type": "riddle", "title": "Загадка о нас", "answer": "НАША ИСТОРИЯ", "points": 25, "description": "Я начался в этом городе. Я рос здесь вместе с нами. Я стал больше каждого из нас. Что это?", "ignore_answer": true}, {"id": "t6", "hint": "Помогает не потеряться", "type": "riddle", "title": "Городская загадка", "answer": "ОРИЕНТИР", "points": 20, "description": "Я есть у каждой улицы и у каждой пары. Я указываю направление. Без меня можно заблудиться. Что я такое?", "ignore_answer": true}], "title": "Загадки города", "description": "Москва хранит свои секреты."}, {"id": "b4", "tasks": [{"id": "t7", "type": "mini_game", "pairs": [{"left": "Первая прогулка по центру", "right": "Всё только начинается"}, {"left": "Поздний вечер на набережной", "right": "Хочется остановить время"}, {"left": "Уютное кафе в переулке", "right": "Весь мир — только мы двое"}, {"left": "Смотровая площадка", "right": "Хочу видеть этот город с тобой"}], "title": "Наши московские моменты", "points": 30, "game_type": "pairs", "description": "Соедини место с тем что мы там чувствовали."}], "title": "Мы и этот город", "description": "То что связывает нас с Москвой."}, {"id": "b5", "tasks": [{"id": "t8", "type": "text_answer", "title": "Твои слова", "points": 30, "description": "Прежде чем сделать последний шаг — напиши: что значит для тебя этот город и этот человек?", "placeholder": "Для меня Москва — это..."}], "title": "Финальная точка", "description": "Самое важное место в нашем маршруте."}, {"id": "b6", "tasks": [{"id": "t9", "hint": "Посмотри на человека рядом", "type": "riddle", "title": "Последняя загадка", "answer": "КОЛЬЦО", "points": 100, "description": "Я маленький и круглый. Без слов задаю самый важный вопрос. Я создан чтобы остаться на пальце навсегда. Что я такое?"}], "title": "Этот момент", "description": "Москва станет свидетелем."}]	t	14	2	1	2026-03-15 19:09:06.540479	\N	2026-03-15 19:09:06.540479	2026-03-15 19:09:06.540479	proposal	Этот город видел тысячи историй. Сегодня он стал свидетелем нашей. Ты — лучшее что случилось со мной в этом городе. И я хочу чтобы наша история продолжалась.	t
7	\N	\N	elizaveta-2026-783	\N	Наша история	Елизавета	[{"id": "block-1772286245250", "tasks": [{"id": "task-1772286330485", "hint": "", "type": "simple", "title": "Вступление", "points": 10, "description": "Сегодня ты — детектив, и твоё дело — самое важное. Найди 7 улик о человеке, который тебя любит. Первая подсказка там, где всё начинается каждое утро."}, {"id": "task-1772286462484", "type": "location", "title": "Найди записку в месте", "points": 15, "description": "", "location_desc": "Здесь каждое утро начинается новый день. Здесь смываются усталость и тревоги. Здесь ты смотришь на себя — но сегодня загляни чуть левее зеркала.", "location_hint": "Где ты умываешься каждое утро?"}, {"id": "task-1772286611710", "hint": "белый, двухэтажный", "type": "riddle", "title": "Вопрос", "answer": "холодильник", "points": 30, "question": "Я всегда холодный, всегда голодный, но кормлю всю семью. Кто я?", "description": "Отгадай загадку"}], "title": "Начало пути", "location": "Ванная комната", "description": ""}, {"id": "block-1772286669972", "tasks": [{"id": "task-1772286704473", "hint": "", "type": "code_physical", "title": "Найди все — сложи слово.", "answer": "ЛЮБЛЮ", "points": 30, "code_hint": "", "description": "На кухне спрятаны 5 предметов с буквами."}, {"id": "task-1772286747698", "type": "text_answer", "title": "Ответь на вопрос", "points": 15, "question": "Напиши одно воспоминание о нас, которое ты никогда не забудешь", "description": "", "placeholder": ""}, {"id": "task-1772286769941", "type": "mini_game", "title": "Вопрос", "points": 40, "game_type": "quiz", "description": "", "game_images": [], "game_correct": 1, "game_options": ["Властелин колец", "Сказка о потерянном времени", "Тарзан", "А зори здесь тихие"], "puzzle_image": null, "game_question": "Какой фильм мы смотрели на нашем первом свидании?", "puzzle_pieces": 30}], "title": "Улики", "location": "Кухня", "description": ""}, {"id": "block-1772286878579", "tasks": [{"id": "task-1772286906208", "type": "location", "title": "Найди место", "points": 15, "description": "", "location_desc": "Иди туда, где мы чаще всего проводим вечера вместе", "location_hint": ""}, {"id": "task-1772286970856", "type": "media", "title": "Любящие тебя", "points": 10, "media_url": "/uploads/media/media-1772289950831-741802472.mp4", "media_size": 2408471, "media_type": "video", "description": "Посмотри на нас", "_mediaUploading": false, "media_original_name": "video_2026-02-28_17-16-49.mp4"}, {"id": "task-1772290013651", "type": "selfie", "title": "Селфи с условием", "points": 25, "description": "Действуй согласно требованиям", "selfie_emoji": "🤳", "selfie_condition": "Сфотографируйся с самым важным человеком в твоей жизни"}, {"id": "task-1772290069394", "hint": "", "type": "simple", "title": "Просто остановись где нужно", "points": 10, "description": "Не заходя в зал остановись в проходе двери"}], "title": "Финал", "location": "Прихожая", "description": ""}]	t	100	13	3	2026-02-28 17:50:26.866803	\N	2026-02-28 16:54:13.145821	2026-03-14 00:14:22.260122	romantic	Ты нашла все улики. Главная из них — ты сама. Обернись.	t
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, template_id, client_name, client_email, client_phone, description, event_date, event_city, customization, selected_features, base_price, additional_costs, total_price, status, created_quest_id, admin_notes, created_at, updated_at, newsletter_consent) FROM stdin;
42	12	Влад Петров	vp.vlad00@mail.ru	+79035101495	Партнёр: Лиза\n\nВместе: 2–5 лет\n\nПовод: Годовщина\n\nУвлечения: Музыка, Книги, Искусство\n\nНастроение: romantic\n\nВаша история знакомства: 12345\n\nЧто-то особенное только для вас двоих: 54321\n\nПартнёр хорошо решает загадки?: Да, любит сложные\n\nФинальный сюрприз — что планируете?: подарок\n\nЧто точно не подходит?: другие женщины\n\nДополнительно: 987654321	2026-03-22 00:00:00		{}	[]	49900	0	49900	pending	\N	\N	2026-03-20 17:40:41.137948	2026-03-20 17:40:41.137948	f
32	\N	Влад Петров	vp.vlad00@mail.ru	+79035101495	фывфывфв	2026-03-01 00:00:00	Шимент	{}	[]	499000	0	499000	in_progress	\N	\N	2026-02-28 22:15:26.956612	2026-03-15 08:50:12.984497	f
33	\N	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	cancelled	\N	\N	2026-03-03 22:02:11.580865	2026-03-15 08:50:24.291975	f
34	\N	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	cancelled	\N	\N	2026-03-03 22:03:55.307884	2026-03-15 08:50:24.291975	f
38	\N	Влад Петров	vp.vlad00@mail.ru	+79035101495	ываываы	2000-02-14 00:00:00	Шимент	{}	["video_messages"]	0	100000	100000	cancelled	\N	\N	2026-03-08 15:14:26.043247	2026-03-15 08:50:24.291975	f
39	\N	ии	vp.vlad00@mail.ru	+79035101495	хочу чтобы все получилось	2026-03-28 00:00:00		{}	["partner_surprises", "qr_codes", "custom_photos", "background_music", "video_messages"]	0	430000	430000	cancelled	\N	\N	2026-03-14 19:19:02.926332	2026-03-15 08:50:24.291975	f
41	\N	Влад Петров	vp.vlad00@mail.ru	+79035101495	Пожелания не указаны	2026-03-26 00:00:00		{}	["background_music"]	0	50000	50000	confirmed	\N	\N	2026-03-15 07:37:18.190587	2026-03-15 08:50:24.291975	f
43	15	Владислав	vp.vlad00@mail.ru	+79035101495	Партнёр: ыва\n\nВместе: 1–2 года\n\nПовод: 8 марта\n\nУвлечения: Спорт\n\nНастроение: fun\n\nВаша история знакомства: ыва\n\nЧто-то особенное только для вас двоих: ывааы\n\nФинальный сюрприз — что планируете?: вапвп\n\nЧто точно не подходит?: цукцукц\n\nДополнительно: чисич	2026-03-21 00:00:00		{}	[]	49900	0	49900	pending	\N	\N	2026-03-20 17:45:18.866567	2026-03-20 17:45:18.866567	f
36	\N	Александр Тестовый	test@example.com	+79161234567	Романтический вечер для двоих. Хотим провести незабываемый квест в честь нашей годовщины свадьбы.	2026-06-03 00:00:00		{}	[]	0	0	0	in_progress	\N	\N	2026-03-03 22:08:49.395316	2026-03-20 19:01:07.998186	f
40	\N	Влад Петров	vp.vlad00@mail.ru	+79035101495	Партнёр: апврапвр\n\nПовод: екнвпр\n\nИнтересы: ваправп\n\nМеста: впрпр\n\nРеакция на сюрпризы: рпорр\n\nНастроение: 1\n\nИдеи: 123\n\nДополнительно: 1234435	2026-03-19 00:00:00		{}	["video_messages"]	0	100000	100000	in_progress	\N	\N	2026-03-14 23:48:09.322975	2026-03-22 10:35:02.865044	f
\.


--
-- Data for Name: quest_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quest_sessions (id, created_quest_id, session_id, completed_tasks, current_block_position, points, achievements, started_at, last_activity, completed_at, total_time_seconds, hints_used) FROM stdin;
39	7	f05ea85b-054f-4b60-b1f8-b7c922225ef5	["task-1772286330485", "task-1772286462484", "task-1772286611710", "task-1772286704473", "task-1772286747698", "task-1772286769941", "task-1772286906208", "task-1772286970856", "task-1772290013651", "task-1772290069394"]	2	200	[]	2026-02-28 20:38:43.352126	2026-02-28 20:40:21.640273	2026-02-28 20:40:23.173834	99	0
40	7	bd0a2328-0753-4be5-86d3-08f7da13b12e	[]	0	0	[]	2026-03-01 14:19:49.792038	2026-03-01 14:19:49.792038	\N	0	0
36	7	07046044-a1bc-4a2b-a086-7e03c0e19f1c	[]	0	0	[]	2026-02-28 19:14:15.082625	2026-02-28 19:14:15.082625	\N	0	0
41	7	e5a87acc-2a2b-475d-824d-c6bcf8e78699	["task-1772286330485", "task-1772286462484", "task-1772286611710", "task-1772286704473", "task-1772286747698", "task-1772286769941", "task-1772286906208"]	2	155	[]	2026-03-02 21:59:40.571775	2026-03-02 22:00:48.534441	\N	0	0
42	7	5f2270b2-8651-4479-8d5d-7e4b67413872	[]	0	0	[]	2026-03-03 22:38:04.637262	2026-03-03 22:38:04.637262	\N	0	0
43	7	3a85bb4b-a3bd-4f0f-9cb1-714904002885	[]	0	0	[]	2026-03-08 16:00:44.232044	2026-03-08 16:00:44.232044	\N	0	0
44	7	0b4e6904-92c1-45b5-80bb-eca43e606245	[]	0	0	[]	2026-03-14 00:14:10.65398	2026-03-14 00:14:10.65398	\N	0	0
37	7	ed8ad47e-66a6-4aa5-918e-35e846bfff86	[]	0	0	[]	2026-02-28 20:15:33.721056	2026-02-28 20:15:33.721056	\N	0	0
34	7	9adec544-94ff-4335-8cc5-c33e7f3d248f	["task-1772286330485", "task-1772286462484", "task-1772286611710", "task-1772286704473", "task-1772286747698", "task-1772286769941", "task-1772286906208", "task-1772286970856", "task-1772290013651", "task-1772290069394"]	2	200	[]	2026-02-28 17:55:00.846705	2026-02-28 18:04:59.553149	2026-02-28 18:05:02.82677	601	0
35	7	25c6c461-7a39-424c-b97d-8bcf44db0698	[]	0	0	[]	2026-02-28 18:18:54.192655	2026-02-28 18:18:54.192655	\N	0	0
50	22	e1c1bb3c-860e-4d65-8388-abe59fc66861	["t1", "t2", "t3", "t4", "t5", "t6", "t7"]	4	210	[]	2026-03-15 19:02:33.375944	2026-03-15 19:06:30.008056	2026-03-15 19:06:31.534391	238	2
51	23	a4a341da-90d9-4256-9b22-4f76c169a846	["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"]	5	250	[]	2026-03-15 19:09:23.6879	2026-03-15 19:30:32.315197	2026-03-15 19:30:32.964159	1268	3
52	23	d966fab9-085e-4bd2-b6fe-a34accc09a60	[]	0	0	[]	2026-03-20 18:45:40.027937	2026-03-20 18:45:40.027937	\N	0	0
53	7	2c85b13b-8b96-46dc-9b4d-ab61a54cc12a	[]	0	0	[]	2026-03-22 10:36:01.364985	2026-03-22 10:36:01.364985	\N	0	0
49	15	1f5c2c52-21ac-4059-b290-7b7b931b0ca8	["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"]	5	180	[]	2026-03-15 09:06:26.38529	2026-03-15 09:40:14.429633	2026-03-15 09:40:17.870254	2031	3
54	7	5d296cd6-c2b7-4aa4-a82f-1ed52e00b7f3	["task-1772286330485", "task-1772286462484", "task-1772286611710"]	1	55	[]	2026-03-22 10:36:13.610298	2026-03-22 10:40:10.861899	\N	0	0
55	7	e8110426-fbc8-4e61-a7b9-de8c8763be93	["task-1772286330485", "task-1772286462484", "task-1772286611710"]	1	55	[]	2026-03-22 13:30:14.276436	2026-03-22 13:34:52.441327	\N	0	0
\.


--
-- Data for Name: quest_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quest_templates (id, author_id, category_id, title, slug, tagline, description, cover_image, gallery, demo_video_url, difficulty, duration_minutes, location_type, min_locations, max_locations, structure, features, customization_options, views_count, orders_count, rating, reviews_count, base_price, is_free, is_premium, status, published_at, meta_description, meta_keywords, created_at, updated_at, demo_quest_id, quick_view_description) FROM stdin;
15	6	3	Шоколадный детектив	chocolate-detective-home	Сладкие загадки и вкусный финал	Игривый, тёплый квест для уютного вечера. Загадки связаны с едой, вкусами и совместными воспоминаниями о кафе, ужинах и маленьких радостях. Каждый правильный ответ приближает к финальному сюрпризу — чему-то сладкому и особенному.\n\nЛёгкий, смешной, немного романтичный. Хорошо работает с бокалом вина и пледом.	\N	[]	\N	easy	50	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Сигнал тревоги", "points": 10, "description": "«Дорогой детектив! ЧП на кухне. Самый вкусный десерт исчез бесследно. Подозреваемых нет. Только вы можете раскрыть это дело.»"}, {"id": "t2", "hint": "Итальянский десерт", "type": "riddle", "title": "Первая улика", "answer": "ТИРАМИСУ", "points": 20, "description": "«Я сладкий снаружи и внутри. Меня едят в хорошую погоду и в плохую. Лучше всего сочетаюсь с кофе. Что я такое?»"}], "title": "Пропажа десерта", "description": "Срочное сообщение от шеф-повара."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Допрос о вкусах — вопрос 1", "points": 15, "game_type": "quiz", "description": "Детектив выясняет вкусовые предпочтения.", "game_correct": 0, "game_options": ["Торт", "Мороженое", "Пирожное", "Фруктовый салат"], "game_question": "Что партнёр выбирает в кафе на десерт?"}, {"id": "t4", "type": "mini_game", "title": "Допрос о вкусах — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 1, "game_options": ["Тёмный", "Молочный", "Белый", "Не ест шоколад"], "game_question": "Какой шоколад партнёр предпочитает?"}], "title": "Вкусовые показания", "description": "Свидетели дают показания."}, {"id": "b3", "tasks": [{"id": "t5", "hint": "Без этого еда невкусная", "type": "riddle", "title": "Загадка шеф-повара", "answer": "СОЛЬ", "points": 20, "description": "«Я есть в каждом доме. Без меня невозможно приготовить ни одно блюдо. Без меня вкус плоский. Что я такое?»"}, {"id": "t6", "hint": "Противоположность сладкого", "type": "riddle", "title": "Вторая кухонная загадка", "answer": "ГОРЕЧЬ", "points": 20, "description": "«Меня боятся сладкоежки, но без меня не бывает настоящего шоколада. Без меня всё слишком приторно. Что я такое?»"}], "title": "Улики на кухне", "description": "Детектив исследует место преступления."}, {"id": "b4", "tasks": [{"id": "t7", "type": "mini_game", "pairs": [{"left": "Сладкий", "right": "Когда всё хорошо"}, {"left": "Острый", "right": "Когда смеётесь до слёз"}, {"left": "Горький", "right": "Когда скучаете друг по другу"}, {"left": "Кислый", "right": "Когда спорите но остаётесь вместе"}], "title": "Вкусы и моменты", "points": 30, "game_type": "pairs", "description": "Соедините каждый вкус с подходящим совместным моментом."}], "title": "Сладкие воспоминания", "description": "Показания о совместных кулинарных моментах."}, {"id": "b5", "tasks": [{"id": "t8", "type": "text_answer", "title": "Рецепт идеального вечера", "points": 25, "description": "Запишите рецепт. Что нужно чтобы вечер с партнёром стал особенным? Перечислите 3-5 пунктов.", "placeholder": "Нужно взять..."}], "title": "Признание", "description": "Главный свидетель раскрывает тайну."}, {"id": "b6", "tasks": [{"id": "t9", "hint": "Это то что вы чувствуете прямо сейчас", "type": "riddle", "title": "Последняя улика", "answer": "СЧАСТЬЕ", "points": 50, "description": "«Я слаще любого десерта. Меня нельзя приготовить по рецепту. Я появляюсь сама когда рядом нужный человек. Что я такое?»"}], "title": "Дело раскрыто", "description": "Финал расследования."}]	["Кулинарные загадки", "Вопросы о вкусах", "Текстовые задания", "Пары моментов", "Сладкий финал"]	{}	107	1	4.67	3	49900	f	t	published	2026-03-15 08:49:46.952907	Игривый домашний квест с кулинарной темой. Загадки о еде и совместных воспоминаниях, сладкий финал.	\N	2026-03-15 08:49:46.952907	2026-03-23 06:01:27.721991	\N	\N
16	6	7	Предложение дома: Момент навсегда	proposal-home	Квест-сюрприз ведущий к самому важному вопросу	Особый вечер, который запомнится на всю жизнь. Партнёр проходит цепочку нежных заданий, каждое из которых — часть вашей истории. В финале — самый важный вопрос.\n\nКвест полностью проходится дома. Не требует специальной подготовки — только кольцо и желание сделать этот момент незабываемым.	\N	[]	\N	easy	50	indoor	1	1	{"intro": {"theme": "proposal", "title": "Особый вечер"}}	["Нежные загадки", "Вопросы о вашей истории", "Текстовые признания", "Пары воспоминаний", "Финальный вопрос"]	{}	45	0	0.00	0	49900	f	f	published	2026-03-15 18:34:51.881303	Квест для предложения руки и сердца дома. 5 этапов, нежные задания, финальный вопрос. Золотая тема оформления.	\N	2026-03-15 18:34:51.881303	2026-03-23 06:02:17.132687	\N	\N
11	6	3	Детективное расследование	detective-home	Раскройте дело о пропавшем подарке	Вечер превращается в детективную историю. Один из вас — детектив, второй — главный свидетель. Серия улик, зашифрованных записок и логических задач ведёт к финальной разгадке — и к сюрпризу, который ждёт в конце расследования.\n\nКвест полностью проходится дома, не требует заранее спрятанных предметов и специальной подготовки — только телефон и желание поиграть.	\N	[]	\N	medium	60	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Входящее сообщение", "points": 10, "description": "«Добрый вечер, детектив. Нам поступил сигнал о пропаже. Изучите материалы дела и приступайте к работе. Времени мало.»"}, {"id": "t2", "hint": "Замените каждую букву на предыдущую в алфавите", "type": "riddle", "title": "Зашифрованная записка", "answer": "СНОВА ИДИ", "points": 20, "description": "На столе найдена записка. Каждая буква заменена следующей по алфавиту. Расшифруйте: «ТНЖБТ ДПДЙ»"}], "title": "Первая улика", "description": "Детектив получает первое задание."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Алиби — вопрос 1", "points": 15, "game_type": "quiz", "description": "Детектив проверяет алиби.", "game_correct": 1, "game_options": ["Читал", "Смотрел телефон", "Готовил", "Смотрел в окно"], "game_question": "Что партнёр делал последние 30 минут?"}, {"id": "t4", "type": "mini_game", "title": "Алиби — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Чай", "Кофе", "Воду", "Сок"], "game_question": "Какой напиток партнёр выпил сегодня последним?"}], "title": "Допрос свидетеля", "description": "Детектив проверяет алиби."}, {"id": "b3", "tasks": [{"id": "t5", "hint": "Всегда с вами", "type": "riddle", "title": "Загадка номер один", "answer": "ТЕЛЕФОН", "points": 25, "description": "«Меня берут в руки, когда хотят поговорить. Меня кладут в карман, когда разговор окончен. Без меня вы не нашли бы друг друга в первый день. Что я такое?»"}, {"id": "t6", "hint": "Вспомните самое начало", "type": "riddle", "title": "Загадка номер два", "answer": "СООБЩЕНИЕ", "points": 25, "description": "«Я был первым что вы написали друг другу. Я не занимаю места, но занимаю память. Я короткий, но важный. Что я такое?»"}], "title": "Вещественные доказательства", "description": "Важные улики по делу."}, {"id": "b4", "tasks": [{"id": "t7", "type": "mini_game", "pairs": [{"left": "Волнение", "right": "Первое свидание"}, {"left": "Радость", "right": "Когда смеётесь вместе"}, {"left": "Тепло", "right": "Когда обнимаетесь"}, {"left": "Спокойствие", "right": "Когда молчите рядом"}], "title": "Соедините пары", "points": 30, "game_type": "pairs", "description": "Соедините каждое чувство с подходящим моментом."}], "title": "Реконструкция событий", "description": "Детектив восстанавливает хронологию."}, {"id": "b5", "tasks": [{"id": "t8", "type": "text_answer", "title": "Показания", "points": 20, "description": "Вопрос: «Опишите одним предложением что вам больше всего нравится в вашем партнёре»", "placeholder": "Введите показания..."}], "title": "Показания очевидца", "description": "Главный свидетель готов говорить."}, {"id": "b6", "tasks": [{"id": "t9", "hint": "Посоветуйтесь с партнёром", "type": "riddle", "title": "Финальный код", "answer": "ЛЮБОЙ", "points": 50, "description": "Последняя улика. Код — это год когда вы впервые встретились. Введите его чтобы закрыть дело.", "ignore_answer": true}], "title": "Дело закрыто", "description": "Финал расследования."}]	["Загадки и шифры", "Мини-игры", "Текстовые задания", "Подсказки", "Финальный сюрприз"]	{}	36	0	4.75	4	49900	f	f	published	2026-03-15 08:49:46.936304	Домашний детективный квест для двоих — раскройте дело о пропавшем подарке. 6 этапов загадок и улик, финальный сюрприз.	\N	2026-03-15 08:49:46.936304	2026-03-23 06:02:27.556302	\N	\N
14	6	3	Звёздная ночь	starry-night-home	Романтическое путешествие между звёздами	Тёплый, нежный квест для особого вечера. Каждый блок — это «планета» с заданием: написать что-то важное, вспомнить совместный момент, ответить на вопрос о партнёре. Финал — маленькое признание, которое останется с вами.\n\nМягкая сложность, никакого стресса. Просто красивый вечер вдвоём.	\N	[]	\N	easy	40	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Сигнал из космоса", "points": 10, "description": "«Бортовой журнал, дата: сегодня. Мы отправляемся в межзвёздное путешествие. Впереди пять планет. На каждой — своя миссия. Экипаж готов.»"}, {"id": "t2", "hint": "Это то что между вами прямо сейчас", "type": "riddle", "title": "Координаты первой планеты", "answer": "БЛИЗОСТЬ", "points": 20, "description": "«Я нахожусь везде где есть два человека, которым хорошо вместе. Я невидима, но очень ощутима. Меня не передать словами, но вы оба знаете что я есть. Что я такое?»"}], "title": "Планета Начала", "description": "Первая планета в вашей галактике."}, {"id": "b2", "tasks": [{"id": "t3", "type": "mini_game", "title": "Архив галактики — вопрос 1", "points": 20, "game_type": "quiz", "description": "Проверка памяти космонавтов.", "game_correct": 0, "game_options": ["Молчит", "Говорит больше обычного", "Смеётся", "Теребит что-то в руках"], "game_question": "Что партнёр делает когда нервничает?"}, {"id": "t4", "type": "mini_game", "title": "Архив галактики — вопрос 2", "points": 20, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Объятие", "Разговор", "Сам подходит", "Молчанием"], "game_question": "Как партнёр предпочитает мириться после ссоры?"}], "title": "Планета Воспоминаний", "description": "Архив ваших совместных моментов."}, {"id": "b3", "tasks": [{"id": "t5", "type": "text_answer", "title": "Межзвёздное послание", "points": 35, "description": "Напиши партнёру три вещи за которые ты благодарен(а) прямо сейчас. Можно совсем маленькие.", "placeholder": "1. Спасибо за...\\n2. Спасибо за...\\n3. Спасибо за..."}], "title": "Планета Признаний", "description": "На этой планете говорят то что думают."}, {"id": "b4", "tasks": [{"id": "t6", "type": "mini_game", "pairs": [{"left": "Терпение", "right": "Никогда не торопит меня"}, {"left": "Любопытство", "right": "Хочет узнать что-то новое"}, {"left": "Тепло", "right": "Умеет создать уют"}, {"left": "Смелость", "right": "Говорит о чувствах"}], "title": "Карта звёздного характера", "points": 30, "game_type": "pairs", "description": "Соедините каждую черту с тем как она проявляется у партнёра."}], "title": "Планета Открытий", "description": "Открываем что-то новое друг о друге."}, {"id": "b5", "tasks": [{"id": "t7", "type": "text_answer", "title": "Координаты мечты", "points": 40, "description": "Напиши одну вещь которую хочешь сделать с партнёром в этом году.", "placeholder": "Я хочу чтобы мы..."}], "title": "Планета Мечт", "description": "Последняя планета — о будущем."}]	["Романтические загадки", "Вопросы о партнёре", "Текстовые признания", "Пары качеств", "Послание в будущее"]	{}	46	0	4.67	3	49900	f	t	published	2026-03-15 08:49:46.951222	Романтический домашний квест в космической теме. 5 этапов, лёгкие задания, финальное признание.	\N	2026-03-15 08:49:46.951222	2026-03-23 06:02:17.610269	\N	\N
12	6	3	Машина времени	time-machine-home	Путешествие по вашей общей истории	Этот квест — билет в прошлое. Каждый этап переносит вас в определённый момент ваших отношений: первое сообщение, первый совместный вечер, смешная история, важный день. Вопросы, загадки и маленькие открытия о том, как вы оказались там, где вы есть сейчас.\n\nИдеально для годовщины. Не требует ничего, кроме телефона и воспоминаний.	\N	[]	\N	easy	45	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Бортовой журнал", "points": 10, "description": "Вы садитесь в машину времени. Маршрут: назад по вашей общей истории. Первая остановка — самое начало."}], "title": "Отправление", "description": "Машина времени готова к запуску."}, {"id": "b2", "tasks": [{"id": "t2", "type": "mini_game", "title": "Проверка памяти — вопрос 1", "points": 15, "game_type": "quiz", "description": "Насколько хорошо вы помните первые дни?", "game_correct": 0, "game_options": ["Я", "Партнёр", "Оба одновременно", "Уже не помню"], "game_question": "Кто первым написал сообщение?"}, {"id": "t3", "type": "mini_game", "title": "Проверка памяти — вопрос 2", "points": 15, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Интерес", "Волнение", "Симпатию", "Ничего особенного поначалу"], "game_question": "Что вы почувствовали при первой встрече?"}], "title": "Первая остановка: Знакомство", "description": "Проверка памяти о первых днях."}, {"id": "b3", "tasks": [{"id": "t4", "hint": "Спросите у партнёра если не помните", "type": "riddle", "title": "Что было на первом свидании?", "answer": "ЛЮБОЙ", "points": 20, "description": "Вспомните первое свидание. Что вы ели или пили? Введите одно слово.", "ignore_answer": true}, {"id": "t5", "type": "text_answer", "title": "Что вы думали тогда", "points": 25, "description": "Напишите одну мысль которая у вас была в тот вечер. Можно то чего не говорили вслух.", "placeholder": "Я тогда думал(а)..."}], "title": "Вторая остановка: Первое свидание", "description": "Тот вечер когда всё стало понятно."}, {"id": "b4", "tasks": [{"id": "t6", "type": "mini_game", "pairs": [{"left": "Первый раз остались на ночь", "right": "Близость"}, {"left": "Первая поездка вместе", "right": "Приключение"}, {"left": "Первая ссора и примирение", "right": "Понимание"}, {"left": "Сказали «я тебя люблю»", "right": "Смелость"}], "title": "Наши моменты", "points": 30, "game_type": "pairs", "description": "Соедините описание момента с тем что вы почувствовали."}], "title": "Третья остановка: Важный момент", "description": "Когда стало понятно что это серьёзно."}, {"id": "b5", "tasks": [{"id": "t7", "type": "text_answer", "title": "Послание в будущее", "points": 40, "description": "Напишите одно предложение — что бы вы хотели чтобы будущая версия вас знала об этих отношениях.", "placeholder": "Я хочу чтобы ты знал(а)..."}], "title": "Возвращение: Сейчас", "description": "Машина времени доставила вас обратно."}]	["Вопросы о партнёре", "Путешествие по воспоминаниям", "Текстовые признания", "Мини-игры", "Послание в будущее"]	{}	60	1	4.67	3	49900	f	t	published	2026-03-15 08:49:46.947025	Романтический квест-путешествие по истории пары. Вопросы, загадки и воспоминания о важных моментах отношений. Идеально для годовщины.	\N	2026-03-15 08:49:46.947025	2026-03-23 06:02:17.707086	\N	\N
17	6	7	Предложение в Москве: Городской маршрут	proposal-moscow	Маршрут по значимым местам к самому важному вопросу	Городской квест-маршрут для предложения руки и сердца. Партнёр проходит по памятным местам Москвы, получая подсказки и задания на каждой точке. Финал — в заранее выбранном вами месте.\n\nМаршрут и задания адаптируются под ваши места. Подходит для любого сезона.	/uploads/templates/images-1773858000910-809090487.jpg	["/uploads/templates/images-1773858000910-809090487.jpg"]	\N	medium	90	city	3	5	{}	["Маршрут по городу", "Загадки на каждой точке", "История вашей пары", "Шифры и послания", "Финальный вопрос"]	{}	54	0	0.00	0	49900	f	t	published	2026-03-15 18:34:51.89485	Городской квест для предложения руки и сердца в Москве. Маршрут по значимым местам, финальный вопрос в особом месте.	\N	2026-03-15 18:34:51.89485	2026-03-23 06:02:17.131802	\N	\N
13	6	3	Искатель клада	treasure-hunter-home	Найдите сокровище по зашифрованной карте	Зашифрованная карта, пиратские загадки, тайные коды и финальный клад — всё это умещается в один вечер дома. Квест в духе настоящего приключения: шифры, логические задачи, маленькие испытания и сюрприз в финале.\n\nПодходит для тех, кто любит игры и хочет провести вечер активно и весело. Сложнее, чем кажется — но не настолько, чтобы расстроиться.	\N	[]	\N	medium	75	indoor	1	1	[{"id": "b1", "tasks": [{"id": "t1", "type": "simple", "title": "Послание капитана", "points": 10, "description": "«Смелый мореход! Ты получил карту к величайшему сокровищу. Путь непрост, но достоин двоих. Семь испытаний ждут тебя. Готовься.»"}, {"id": "t2", "hint": "А=1, Б=2, В=3, Г=4... Л=12", "type": "riddle", "title": "Первый шифр", "answer": "КЛАД", "points": 25, "description": "Числовой шифр: 3-1-12-1-4. Каждая цифра — номер буквы в алфавите. Расшифруй слово."}], "title": "Карта капитана", "description": "Первая отметка на карте."}, {"id": "b2", "tasks": [{"id": "t3", "hint": "Это нематериально", "type": "riddle", "title": "Загадка острова", "answer": "ЯМА", "points": 20, "description": "«Чем больше берёшь — тем больше становится. Что это?»"}, {"id": "t4", "hint": "Смотрите на это каждый день но не видите", "type": "riddle", "title": "Вторая загадка", "answer": "БУДУЩЕЕ", "points": 20, "description": "«Всегда перед вами, но увидеть невозможно. Что это?»"}], "title": "Остров загадок", "description": "Второй этап пути."}, {"id": "b3", "tasks": [{"id": "t5", "type": "mini_game", "title": "Испытание знанием — вопрос 1", "points": 20, "game_type": "quiz", "description": "Капитан проверяет знаете ли вы своего спутника.", "game_correct": 2, "game_options": ["Утро", "День", "Вечер", "Ночь"], "game_question": "Какое любимое время суток у партнёра?"}, {"id": "t6", "type": "mini_game", "title": "Испытание знанием — вопрос 2", "points": 20, "game_type": "quiz", "description": "", "game_correct": 0, "game_options": ["Дома", "Гулять", "С друзьями", "Путешествовать"], "game_question": "Как партнёр предпочитает проводить выходной?"}], "title": "Пещера испытаний", "description": "Проверка знания партнёра."}, {"id": "b4", "tasks": [{"id": "t7", "hint": "Это то чем делятся", "type": "riddle", "title": "Код от сундука", "answer": "УЛЫБКА", "points": 30, "description": "«Я есть у каждого, но у тебя другой чем у меня. Ты можешь отдать его мне, и у тебя станет больше, не меньше.»"}], "title": "Бухта сокровищ", "description": "Четвёртый этап."}, {"id": "b5", "tasks": [{"id": "t8", "type": "mini_game", "pairs": [{"left": "Забота", "right": "Спрашивает как дела"}, {"left": "Честность", "right": "Говорит правду даже когда трудно"}, {"left": "Юмор", "right": "Умеет рассмешить"}, {"left": "Надёжность", "right": "Всегда рядом когда нужно"}], "title": "Соедините ценности", "points": 30, "game_type": "pairs", "description": "Соедините каждое качество с тем как оно проявляется у партнёра."}], "title": "Карта сердца", "description": "Пятый этап."}, {"id": "b6", "tasks": [{"id": "t9", "type": "text_answer", "title": "Послание пирата", "points": 20, "description": "Капитан требует последнее доказательство. Напиши одно слово — то которым ты бы описал сегодняшний вечер.", "placeholder": "Одно слово..."}], "title": "Последнее испытание", "description": "Шестой этап."}, {"id": "b7", "tasks": [{"id": "t10", "hint": "Посмотри на человека рядом", "type": "riddle", "title": "Главная загадка", "answer": "ЛЮБОВЬ", "points": 50, "description": "«Я не золото и не серебро. Меня нельзя купить. Но именно из-за меня стоило пройти весь этот путь. Что я такое?»"}], "title": "Клад найден", "description": "Финал."}]	["Шифры и коды", "Загадки", "Мини-игры", "Пары слов", "Финальный клад"]	{}	95	0	4.75	4	49900	f	f	published	2026-03-15 08:49:46.949384	Домашний квест в стиле охоты за сокровищами. Шифры, загадки, пиратская тема. 7 этапов, финальный клад-сюрприз.	\N	2026-03-15 08:49:46.949384	2026-03-23 06:02:17.697384	\N	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, template_id, client_name, client_email, rating, title, comment, images, is_verified, is_featured, helpful_count, created_at, updated_at) FROM stdin;
26	11	Антон К.	antkr@mail.ru	5	Лучший вечер за долгое время	Мы с девушкой не могли остановиться! Загадки интересные, атмосфера детектива затягивает. Финал очень трогательный.	[]	t	f	0	2026-01-29 18:01:37.757277	2026-03-15 18:01:37.757277
27	11	Мария Д.	masha.d@gmail.com	5	Провели незабываемый вечер	Заказывали на годовщину. Партнёр был в восторге — особенно от зашифрованных записок. Рекомендую всем!	[]	t	f	0	2026-02-13 18:01:37.757277	2026-03-15 18:01:37.757277
28	11	Серёжа и Таня	st.couple@yandex.ru	4	Очень атмосферно	Классный квест, загадки в меру сложные. Немного запутались с шифром, но подсказка помогла. Провели отлично.	[]	t	f	0	2026-02-25 18:01:37.757277	2026-03-15 18:01:37.757277
29	11	Дмитрий В.	dvv@inbox.ru	5	Подарил жене на день рождения	Жена была в полном восторге. Говорит что это лучший подарок за все годы. Спасибо за такой формат!	[]	t	f	0	2026-03-07 18:01:37.757277	2026-03-15 18:01:37.757277
30	12	Оля и Женя	olya.zhenya@mail.ru	5	Плакали и смеялись одновременно	Квест о наших воспоминаниях — это что-то особенное. Вопросы очень точные, как будто написаны специально для нас.	[]	t	f	0	2026-02-05 18:01:37.769809	2026-03-15 18:01:37.769809
31	12	Константин Л.	kl@gmail.com	5	Идеально для годовщины	Проходили на нашу третью годовщину. Очень тронуло когда вспоминали первые дни. Советую всем парам!	[]	t	f	0	2026-02-21 18:01:37.769809	2026-03-15 18:01:37.769809
32	12	Настя П.	np@yandex.ru	4	Душевный квест	Простые задания но очень глубокие. После прохождения долго обсуждали наши воспоминания. Это ценно.	[]	t	f	0	2026-03-03 18:01:37.769809	2026-03-15 18:01:37.769809
33	13	Игорь С.	igs@mail.ru	5	Семь заданий — семь эмоций	Самый насыщенный квест из всех что мы проходили. Шифры реально заставляли думать. Финальная загадка — просто браво.	[]	t	f	0	2026-01-24 18:01:37.771877	2026-03-15 18:01:37.771877
34	13	Катя и Миша	km.together@gmail.com	5	Пиратская тема — супер	Мы оба любим приключения и этот квест попал прямо в точку. Соревновались кто быстрее разгадает. Было весело!	[]	t	f	0	2026-02-08 18:01:37.771877	2026-03-15 18:01:37.771877
35	13	Алексей Р.	ar@inbox.ru	4	Сложновато но интересно	Числовой шифр поставил нас в тупик минут на десять. Но когда разгадали — было очень приятно. Хороший квест.	[]	t	f	0	2026-02-23 18:01:37.771877	2026-03-15 18:01:37.771877
36	13	Вика Н.	vika.n@yandex.ru	5	Заказывали уже дважды	Первый раз на день рождения, второй раз просто так. Оба раза было отлично. Любимый квест!	[]	t	f	0	2026-03-10 18:01:37.771877	2026-03-15 18:01:37.771877
37	14	Лена и Артём	la.stars@mail.ru	5	Нежно и красиво	Космическая тема очень романтичная. Финальное послание в будущее — это гениально.	[]	t	f	0	2026-02-01 18:01:37.77478	2026-03-15 18:01:37.77478
38	14	Паша К.	pk@gmail.com	5	Подарок девушке на ДР	Девушка была растрогана до слёз. Говорит что никогда не получала такого подарка. Однозначно рекомендую!	[]	t	f	0	2026-02-15 18:01:37.77478	2026-03-15 18:01:37.77478
39	14	Юля С.	ys@yandex.ru	4	Атмосферно и трогательно	Очень мягкий квест, без стресса. Хорошо подходит когда хочется просто провести вечер тепло.	[]	t	f	0	2026-03-01 18:01:37.77478	2026-03-15 18:01:37.77478
40	15	Саша и Лиза	sl.choco@mail.ru	5	Смеялись весь вечер	Кулинарные загадки — это так неожиданно и смешно! Особенно вопросы о вкусах партнёра.	[]	t	f	0	2026-02-03 18:01:37.776601	2026-03-15 18:01:37.776601
41	15	Роман П.	rp@gmail.com	5	Идеально для 14 февраля	Проходили в День влюблённых. Уютно, игриво, с бокалом вина — идеальный вечер.	[]	t	f	0	2026-02-18 18:01:37.776601	2026-03-15 18:01:37.776601
42	15	Ирина В.	iv@inbox.ru	4	Вкусно и романтично	Тема десертов очень оригинальная. Задания простые но с юмором. Хорошо подходит для расслабленного вечера.	[]	t	f	0	2026-03-05 18:01:37.776601	2026-03-15 18:01:37.776601
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
13	годовщина	годовщина	2	2026-02-11 22:43:44.560683
14	первое свидание	первое-свидание	3	2026-02-11 22:43:44.560864
16	головоломки	головоломки	3	2026-02-11 22:43:44.561323
12	предложение руки и сердца	предложение-руки-и-сердца	3	2026-02-11 22:43:44.560496
11	сюрприз	сюрприз	7	2026-02-11 22:43:44.56031
23	предложение	proposal	2	2026-03-22 14:51:48.724295
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
14	13
14	14
14	11
15	12
15	16
15	11
16	12
16	11
17	12
17	11
16	23
17	23
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
-- Name: created_quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.created_quests_id_seq', 23, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 43, true);


--
-- Name: quest_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_sessions_id_seq', 55, true);


--
-- Name: quest_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quest_templates_id_seq', 17, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 42, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tags_id_seq', 23, true);


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
-- Name: idx_reviews_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_template ON public.reviews USING btree (template_id);


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

\unrestrict QP9dKdWPgPBztiXgaDtcC7ITakxmm1ryLb6yQf261Lbff3MKcTOaGYNjQHxegpg

