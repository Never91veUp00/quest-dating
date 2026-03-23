<template>
  <div class="about">

    <!-- ── HERO ── -->
    <section class="about__hero">
      <div class="about__hero-bg">
        <div class="about__hero-orb"></div>
        <div class="about__hero-grain"></div>
      </div>
      <div class="about__container">
        <div class="about__hero-inner">
          <div class="about__photo-wrap">
            <img :src="`/uploads/avatars/liza.jpg`" alt="Лиза Петри" class="about__photo" />
          </div>
          <div class="about__hero-text">
            <p class="about__hero-label">Создатель квестов</p>
            <h1 class="about__hero-name">Лиза Петри</h1>
            <p class="about__hero-sub">Делаю обычные вечера незабываемыми с 2024 года</p>
            <div class="about__hero-stats">
              <div class="about__stat">
                <span class="about__stat-num">{{ stats?.total_templates ?? '7' }}+</span>
                <span class="about__stat-lbl">квестов</span>
              </div>
              <div class="about__stat-div"></div>
              <div class="about__stat">
                <span class="about__stat-num">24ч</span>
                <span class="about__stat-lbl">готовность</span>
              </div>
              <div class="about__stat-div"></div>
              <div class="about__stat">
                <span class="about__stat-num">100%</span>
                <span class="about__stat-lbl">персонально</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── ИСТОРИЯ ── -->
    <section class="about__section">
      <div class="about__container">
        <h2 class="about__section-title">Моя история</h2>
        <div class="about__story">
          <p>Всё началось когда мой партнёр хотел устроить мне особенный вечер — и не знал как. Рестораны, цветы, кино — всё это мило, но не запоминается.</p>
          <p>Тогда он придумал квест. Прямо дома, из записок и загадок. Это был самый необычный вечер в моей жизни.</p>
          <p>После этого я поняла: такое должно быть доступно каждой паре. Не нужно быть сценаристом — достаточно обратиться ко мне. Я возьму вашу историю и превращу её в приключение.</p>
        </div>
      </div>
    </section>

    <!-- ── ПРИНЦИПЫ ── -->
    <section class="about__section about__section--alt">
      <div class="about__container">
        <h2 class="about__section-title">Как я работаю</h2>
        <div class="about__principles">
          <div class="about__principle">
            <span class="about__principle-icon">✍️</span>
            <div>
              <strong>Каждый сценарий — с нуля</strong>
              <p>Никаких шаблонов «заполни поле». Я пишу историю именно под вас — с вашими местами, шутками и воспоминаниями.</p>
            </div>
          </div>
          <div class="about__principle">
            <span class="about__principle-icon">⚡</span>
            <div>
              <strong>Готово за 24 часа</strong>
              <p>Заказ сегодня — квест завтра. Работаю быстро без потери качества.</p>
            </div>
          </div>
          <div class="about__principle">
            <span class="about__principle-icon">💬</span>
            <div>
              <strong>На связи до финала</strong>
              <p>Отвечаю на вопросы, вношу правки, помогаю подготовиться к особому моменту.</p>
            </div>
          </div>
          <div class="about__principle">
            <span class="about__principle-icon">💍</span>
            <div>
              <strong>Специализация на особых моментах</strong>
              <p>Предложения руки и сердца, годовщины, дни рождения — моменты которые запоминаются навсегда.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── КАК РАБОТАЕМ ── -->
    <section class="about__section">
      <div class="about__container">
        <h2 class="about__section-title">Как это происходит</h2>
        <div class="about__timeline">
          <div class="about__tl-item" v-for="(step, i) in STEPS" :key="i">
            <div class="about__tl-aside">
              <div class="about__tl-num">{{ i + 1 }}</div>
              <div v-if="i < STEPS.length - 1" class="about__tl-line"></div>
            </div>
            <div class="about__tl-body">
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── КОНТАКТЫ ── -->
    <section class="about__section about__section--alt">
      <div class="about__container">
        <h2 class="about__section-title">Написать Лизе</h2>
        <p class="about__contact-sub">Расскажите о вашей паре — и я предложу идею для квеста</p>
        <div class="about__contacts">
          <a href="https://t.me/vinatian00" target="_blank" rel="noopener" class="about__contact-btn about__contact-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
            Написать в Telegram
          </a>
          <a href="mailto:vp.vlad00@mail.ru" class="about__contact-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            vp.vlad00@mail.ru
          </a>
        </div>
      </div>
    </section>

    <!-- ── CTA ── -->
    <section class="about__cta">
      <div class="about__container">
        <h2 class="about__cta-title">Готовы удивить?</h2>
        <p class="about__cta-sub">Выберите квест — я адаптирую его под вас</p>
        <NuxtLink to="/catalog" class="about__cta-btn">Выбрать квест →</NuxtLink>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const { getStats } = useDatesApi()

useSeoMeta({
  title:       'О Лизе Петри — Quest Dating',
  description: 'Лиза Петри создаёт персональные свидания-квесты для пар. Каждый сценарий — с нуля, готов за 24 часа.',
  ogTitle:     'О Лизе Петри — Quest Dating',
  ogImage:     'https://questdating.ru/uploads/avatars/liza.jpg',
})

const { data: statsRaw } = await useAsyncData('about-stats', () => getStats())
const stats = computed(() => statsRaw.value?.data ?? statsRaw.value ?? {})

const STEPS = [
  { title: 'Выбираете квест или пишете мне', desc: 'Просматриваете каталог или рассказываете о паре в Telegram — я подберу формат.' },
  { title: 'Я задаю вопросы', desc: 'Узнаю ваши места, шутки, воспоминания — всё что сделает квест живым.' },
  { title: 'Готово за 24 часа', desc: 'Вы получаете ссылку на персональный квест. Можно делиться сразу.' },
  { title: 'Партнёр проходит — вы наблюдаете', desc: 'Смотрите на реакцию и наслаждаетесь моментом.' },
]
</script>

<style scoped>
.about { background: #0a0a0f; color: #f0ede8; min-height: 100vh; }
.about__container { max-width: 600px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 768px) { .about__container { max-width: 900px; padding: 0 24px; } }

/* Hero */
.about__hero {
  position: relative; overflow: hidden;
  padding: calc(80px + env(safe-area-inset-top)) 0 48px;
}
.about__hero-bg { position: absolute; inset: 0; }
.about__hero-orb {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: rgba(212,175,55,0.08); filter: blur(80px);
  top: -50px; right: -50px;
}
.about__hero-grain {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

.about__hero-inner {
  position: relative; z-index: 2;
  display: flex; gap: 24px; align-items: flex-start;
}

.about__photo-wrap { flex-shrink: 0; }
.about__photo {
  width: 90px; height: 90px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(212,175,55,0.4);
}
@media (min-width: 768px) { .about__photo { width: 120px; height: 120px; } }

.about__hero-text { flex: 1; }
.about__hero-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #d4af37; margin: 0 0 4px; }
.about__hero-name { font-size: clamp(1.8rem, 6vw, 2.6rem); font-weight: 900; margin: 0 0 6px; letter-spacing: -0.02em; }
.about__hero-sub { font-size: 0.9rem; color: rgba(240,237,232,0.55); margin: 0 0 16px; line-height: 1.5; }

.about__hero-stats { display: flex; align-items: center; gap: 14px; }
.about__stat { display: flex; flex-direction: column; gap: 1px; }
.about__stat-num { font-size: 1rem; font-weight: 900; color: #d4af37; }
.about__stat-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(240,237,232,0.35); }
.about__stat-div { width: 1px; height: 28px; background: rgba(255,255,255,0.08); }

/* Sections */
.about__section { padding: 32px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.about__section--alt { background: rgba(255,255,255,0.02); }
.about__section-title { font-size: 1.2rem; font-weight: 900; color: #f0ede8; margin: 0 0 16px; letter-spacing: -0.01em; }

/* Story */
.about__story { display: flex; flex-direction: column; gap: 12px; }
.about__story p { font-size: 0.95rem; color: rgba(240,237,232,0.7); line-height: 1.7; margin: 0; }

/* Principles */
.about__principles { display: flex; flex-direction: column; gap: 16px; }
.about__principle {
  display: flex; gap: 14px; align-items: flex-start;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 14px;
}
.about__principle-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
.about__principle strong { display: block; font-size: 0.95rem; font-weight: 800; color: #f0ede8; margin-bottom: 4px; }
.about__principle p { font-size: 0.82rem; color: rgba(240,237,232,0.55); margin: 0; line-height: 1.5; }

/* Timeline */
.about__timeline { display: flex; flex-direction: column; }
.about__tl-item { display: flex; gap: 14px; padding-bottom: 20px; }
.about__tl-aside { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 32px; }
.about__tl-num {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4);
  color: #d4af37; font-size: 0.8rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.about__tl-line {
  width: 1px; flex: 1; margin-top: 6px; min-height: 20px;
  background: linear-gradient(to bottom, rgba(212,175,55,0.3), rgba(212,175,55,0.05));
}
.about__tl-body { flex: 1; padding-top: 6px; }
.about__tl-body strong { display: block; font-size: 0.95rem; font-weight: 800; color: #f0ede8; margin-bottom: 4px; }
.about__tl-body p { font-size: 0.82rem; color: rgba(240,237,232,0.55); margin: 0; line-height: 1.5; }

/* Contacts */
.about__contact-sub { font-size: 0.9rem; color: rgba(240,237,232,0.45); margin: 0 0 16px; }
.about__contacts { display: flex; flex-direction: column; gap: 10px; }
@media (min-width: 480px) { .about__contacts { flex-direction: row; } }
.about__contact-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 20px; border-radius: 100px;
  font-size: 0.9rem; font-weight: 700; text-decoration: none;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  color: rgba(240,237,232,0.7); transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.about__contact-btn:hover { border-color: rgba(255,255,255,0.25); color: #f0ede8; }
.about__contact-btn--primary { background: #d4af37; color: #0a0a0f; border-color: transparent; }
.about__contact-btn--primary:hover { opacity: 0.9; }

/* CTA */
.about__cta {
  padding: 64px 0;
  text-align: center;
  background: radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 70%);
}
.about__cta-title { font-size: clamp(1.8rem, 6vw, 2.4rem); font-weight: 900; margin: 0 0 10px; letter-spacing: -0.02em; }
.about__cta-sub { font-size: 1rem; color: rgba(240,237,232,0.5); margin: 0 0 28px; }
.about__cta-btn {
  display: inline-block; background: #d4af37; color: #0a0a0f;
  padding: 16px 40px; border-radius: 100px; font-weight: 800; font-size: 1rem;
  text-decoration: none; transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.about__cta-btn:hover { opacity: 0.9; }
</style>