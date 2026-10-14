<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t, tm, rt } = useI18n()
const { state, ready, init, demoInvite } = useChallenge()
const { lt, number, date } = useChallengeFormat()
const localePath = useLocalePath()
const register = ref(false)
const join = ref(false)
const studentPath = computed(() => localePath('/challenge/student'))
const rubricTotal = computed(() => state.value?.criteria.reduce((total, criterion) => total + criterion.weight, 0) ?? 100)
const demoTeam = computed(() => demoInvite.value?.team ?? null)
const schoolFeatures = computed(() => (tm('challenge.visitor.schoolFeatures') as string[]).map(item => rt(item)))
const studentFeatures = computed(() => (tm('challenge.visitor.studentFeatures') as string[]).map(item => rt(item)))
const rules = computed(() => (tm('challenge.visitor.rules') as string[]).map(item => rt(item)))
const faqs = computed(() => (tm('challenge.visitor.faq') as { question: string; answer: string }[])
  .map(item => ({ question: rt(item.question), answer: rt(item.answer) })))
const timeline = computed(() => {
  if (!state.value) return []
  const competition = state.value.competition
  const deadlines = [state.value.schools[0]?.registeredAt, state.value.course.sessions[0]?.startsAt, competition.submissionDeadline, competition.resultsDate]
  return (tm('challenge.visitor.timeline') as { title: string; description: string }[]).map((item, index) => ({
    title: rt(item.title), description: rt(item.description), deadline: deadlines[index],
  }))
})

onMounted(init)
useHead(() => ({
  title: t('challenge.visitor.heroTitle') + ' - Gaming Lab',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}))
</script>

<template>
  <ChallengeSurface class="challenge-visitor">
    <div v-if="ready && state" class="visitor-container">
      <div class="visitor-utility">
        <nav class="visitor-tabs" :aria-label="t('challenge.visitor.portalLabel')">
          <a href="#challenge-overview" class="visitor-tab is-selected" aria-current="page">{{ t('challenge.visitor.portal') }}</a>
          <NuxtLink :to="localePath('/challenge/results')" class="visitor-tab"><AppIcon name="trophy" />{{ t('challenge.visitor.podium') }}</NuxtLink>
        </nav>
        <p class="visitor-identity"><AppIcon name="shield-check" />{{ t('challenge.visitor.portalLabel') }}</p>
      </div>

      <section id="challenge-overview" class="visitor-hero" aria-labelledby="challenge-title">
        <div class="visitor-hero-badges">
          <span class="visitor-edition"><AppIcon name="code" />{{ t('challenge.visitor.edition', { year: number(2026, { useGrouping: false }) }) }}</span>
          <span class="visitor-phase"><span aria-hidden="true" />{{ t('challenge.phases.' + state.competition.phase) }}</span>
        </div>
        <h1 id="challenge-title">{{ t('challenge.visitor.heroTitle') }}</h1>
        <p class="visitor-hero-description">{{ t('challenge.visitor.heroDescription') }}</p>
        <div class="visitor-hero-actions">
          <div class="visitor-primary-actions">
            <button type="button" class="visitor-button visitor-button--green" @click="join = true"><AppIcon name="graduation-cap" />{{ t('challenge.visitor.studentCta') }}<AppIcon name="arrow-right" class="rtl:-scale-x-100" /></button>
            <button type="button" class="visitor-button visitor-button--purple" @click="register = true"><AppIcon name="building" />{{ t('challenge.visitor.schoolCta') }}</button>
          </div>
          <NuxtLink :to="localePath('/challenge/results')" class="visitor-button visitor-button--ghost"><AppIcon name="award" />{{ t('challenge.visitor.resultsCta') }}</NuxtLink>
        </div>
        <dl class="visitor-hero-facts">
          <div><dt>{{ t('challenge.visitor.eligibilityLabel') }}</dt><dd>{{ t('challenge.visitor.eligibilityValue') }}</dd></div>
          <div><dt>{{ t('challenge.visitor.trainingLabel') }}</dt><dd>{{ t('challenge.visitor.trainingValue', { sessions: number(state.course.sessions.length) }) }}</dd></div>
          <div><dt>{{ t('challenge.visitor.teamLabel') }}</dt><dd>{{ t('challenge.visitor.teamValue', { min: number(state.competition.minTeamMembers), max: number(state.competition.maxTeamMembers) }) }}</dd></div>
          <div><dt>{{ t('challenge.visitor.rubricLabel') }}</dt><dd class="visitor-fact-accent">{{ t('challenge.visitor.rubricValue', { points: number(rubricTotal) }) }}</dd></div>
        </dl>
      </section>

      <ChallengePublicJourney :phase="state.competition.phase" />

      <section class="visitor-pathways" aria-labelledby="pathways-title">
        <header class="visitor-section-intro">
          <span class="visitor-section-tag">{{ t('challenge.visitor.pathwaysEyebrow') }}</span>
          <h2 id="pathways-title">{{ t('challenge.visitor.pathwaysTitle') }}</h2>
          <p>{{ t('challenge.visitor.pathwaysDescription') }}</p>
        </header>
        <div class="visitor-pathway-grid">
          <article class="visitor-pathway visitor-pathway--school" aria-labelledby="school-path-title">
            <h3 id="school-path-title">{{ t('challenge.visitor.schoolTitle') }}</h3>
            <p class="visitor-pathway-intro">{{ t('challenge.visitor.schoolIntro') }}</p>
            <p class="visitor-pathway-description">{{ t('challenge.visitor.schoolDescription') }}</p>
            <ul class="visitor-feature-list"><li v-for="feature in schoolFeatures" :key="feature"><AppIcon name="check-circle" />{{ feature }}</li></ul>
            <button type="button" class="visitor-button visitor-button--navy visitor-pathway-cta" @click="register = true"><AppIcon name="building" />{{ t('challenge.visitor.schoolCta') }}<AppIcon name="arrow-right" class="rtl:-scale-x-100" /></button>
          </article>

          <article class="visitor-pathway visitor-pathway--student" aria-labelledby="student-path-title">
            <span class="visitor-student-ribbon">{{ t('challenge.visitor.studentRibbon') }}</span>
            <h3 id="student-path-title">{{ t('challenge.visitor.studentTitle') }}</h3>
            <p class="visitor-pathway-intro">{{ t('challenge.visitor.studentIntro') }}</p>
            <p class="visitor-pathway-description">{{ t('challenge.visitor.studentDescription') }}</p>
            <ul class="visitor-feature-list"><li v-for="(feature, index) in studentFeatures" :key="feature"><AppIcon :name="index === 0 ? 'key' : 'check-circle'" />{{ feature }}</li></ul>
            <div v-if="demoTeam" class="visitor-demo-code"><span>{{ t('challenge.visitor.demoCode') }} <strong dir="ltr">{{ demoTeam.inviteCode }}</strong></span><NuxtLink :to="studentPath">{{ t('challenge.visitor.tryDemo') }}</NuxtLink></div>
            <p v-else class="visitor-demo-code">{{ t(state.teams.length ? 'challenge.visitor.join.noSample' : 'challenge.visitor.demoUnavailable') }}</p>
            <button type="button" class="visitor-button visitor-button--green visitor-pathway-cta" @click="join = true"><AppIcon name="graduation-cap" />{{ t('challenge.visitor.studentCta') }}<AppIcon name="arrow-right" class="rtl:-scale-x-100" /></button>
          </article>
        </div>
      </section>

      <section class="visitor-panel" aria-labelledby="timeline-title">
        <header class="visitor-panel-heading"><h2 id="timeline-title"><AppIcon name="calendar" />{{ t('challenge.visitor.timelineTitle') }}</h2><p>{{ t('challenge.visitor.timelineDescription') }}</p></header>
        <ol class="visitor-timeline">
          <li v-for="(item, index) in timeline" :key="index">
            <h3>{{ number(index + 1) }}. {{ item.title }}</h3>
            <p v-if="item.deadline" class="visitor-timeline-date">{{ date(item.deadline, { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
            <p>{{ item.description }}</p>
          </li>
        </ol>
      </section>

      <div class="visitor-information-grid">
        <section class="visitor-panel" aria-labelledby="rules-title">
          <header class="visitor-panel-heading"><h2 id="rules-title"><AppIcon name="shield-check" />{{ t('challenge.visitor.rulesTitle') }}</h2><p>{{ t('challenge.visitor.rulesDescription') }}</p></header>
          <ul class="visitor-rules"><li v-for="rule in rules" :key="rule"><AppIcon name="check-circle" /><span>{{ rule }}</span></li></ul>
        </section>
        <section class="visitor-panel" aria-labelledby="judging-title">
          <header class="visitor-panel-heading"><h2 id="judging-title"><AppIcon name="scale" />{{ t('challenge.visitor.judgingTitle') }}</h2><p>{{ t('challenge.visitor.judgingDescription') }}</p></header>
          <dl class="visitor-rubric"><div v-for="criterion in state.criteria" :key="criterion.id"><dt>{{ lt(criterion.name) }}</dt><dd>{{ number(criterion.weight) }}<span class="sr-only"> {{ t('challenge.visitor.rubricValue', { points: '' }) }}</span></dd></div></dl>
          <p class="visitor-rubric-total">{{ t('challenge.visitor.scoringTotal', { points: number(rubricTotal) }) }}</p>
        </section>
      </div>

      <section class="visitor-panel visitor-faq" aria-labelledby="faq-title">
        <h2 id="faq-title" class="visitor-faq-title"><AppIcon name="help-circle" />{{ t('challenge.visitor.faqTitle') }}</h2>
        <div class="visitor-faq-list">
          <details v-for="(item, index) in faqs" :key="index" :open="index === 0">
            <summary><span>{{ item.question }}</span><span class="visitor-faq-indicator" aria-hidden="true" /></summary>
            <p>{{ item.answer }}</p>
          </details>
        </div>
      </section>

      <div class="visitor-demo-footer"><p>{{ t('challenge.visitor.statusNote') }}</p><ChallengeDemoMenu /></div>
      <ChallengeRegisterSchoolModal v-model="register" />
      <ChallengeJoinTeamModal v-model="join" />
    </div>
    <ChallengePageSkeleton v-else />
    <ChallengeToaster />
  </ChallengeSurface>
</template>

<style scoped>
.challenge-visitor { background: #f8f9fb; color: #010028cc; }
.visitor-container { max-inline-size: 1024px; margin-inline: auto; padding: 24px 24px 56px; }
.visitor-utility { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-block-end: 14px; margin-block-end: 20px; border-block-end: 1px solid #e4dff7; }
.visitor-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
.visitor-tab { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-block-size: 30px; border: 1px solid #e4dff7; border-radius: 6px; padding: 5px 10px; background: white; color: #010028cc; font-size: 10px; font-weight: 600; transition: background-color .15s ease-out; }
.visitor-tab:hover { background: #f2f0fe; }
.visitor-tab.is-selected { border-color: #010028; background: #010028; color: white; }
.visitor-tab svg, .visitor-identity svg { inline-size: 13px; block-size: 13px; flex-shrink: 0; }
.visitor-identity { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #665d85; }
.visitor-identity svg { color: #6b4aee; }
.visitor-hero { padding: 52px; border-radius: 20px; background: linear-gradient(120deg, #29204d, #171236 65%, #010028); color: white; box-shadow: 0 20px 35px #01002820; scroll-margin-block-start: 90px; }
.visitor-hero-badges { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.visitor-edition, .visitor-phase { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; line-height: 1.4; }
.visitor-edition { border: 1px solid #9a82fe50; border-radius: 999px; background: #8062fd25; color: #ddd4ff; }
.visitor-edition svg { inline-size: 13px; block-size: 13px; }
.visitor-phase { background: #f2f0fe; color: #5b3fd9; }
.visitor-phase > span { inline-size: 5px; block-size: 5px; border-radius: 50%; background: #6b4aee; }
.visitor-hero h1 { margin-block: 22px 16px; font-size: 40px; font-weight: 800; line-height: 1.2; letter-spacing: -.025em; text-wrap: balance; }
.visitor-hero-description { max-inline-size: 670px; color: #d8d1ee; font-size: 13px; line-height: 1.7; }
.visitor-hero-actions { display: flex; align-items: flex-start; flex-direction: column; gap: 10px; margin-block-start: 32px; }
.visitor-primary-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.visitor-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 44px; border: 1px solid transparent; border-radius: 10px; padding: 10px 18px; color: white; font-size: 11px; font-weight: 600; line-height: 1.6; text-align: center; text-decoration: none; transition: background-color .18s ease-out, box-shadow .18s ease-out; }
.visitor-button svg { inline-size: 15px; block-size: 15px; flex-shrink: 0; }
.visitor-button--green { background: #027231; box-shadow: 0 5px 10px #02723124; }
.visitor-button--green:hover { background: #015b28; box-shadow: 0 6px 12px #02723130; }
.visitor-button--purple { background: #6b4aee; box-shadow: 0 5px 12px #01002820; }
.visitor-button--purple:hover { background: #5b3fd9; }
.visitor-button--navy { background: #010028; box-shadow: 0 3px 6px #01002815; }
.visitor-button--navy:hover { background: #29204d; }
.visitor-button--ghost { border-color: #d8d1ee50; background: #ffffff12; }
.visitor-button--ghost:hover { background: #ffffff20; }
.visitor-button--ghost svg { color: #5fcc7b; }
.visitor-hero-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; max-inline-size: 650px; margin-block-start: 20px; padding-block-start: 20px; border-block-start: 1px solid #d8d1ee20; }
.visitor-hero-facts dt { margin-block-end: 3px; color: #c5bada; font-size: 10px; }
.visitor-hero-facts dd { font-size: 11px; font-weight: 700; }
.visitor-hero-facts dd.visitor-fact-accent { color: #5fcc7b; }
.public-journey { margin-block-start: 38px; }
.visitor-pathways { margin-block-start: 38px; padding: 26px; border: 1px solid #e0d9fc; border-radius: 20px; background: linear-gradient(#f8f7ff, white); }
.visitor-section-intro { margin-block-end: 26px; text-align: center; }
.visitor-section-tag { display: inline-block; padding: 3px 10px; border: 1px solid #d8ceff; border-radius: 999px; color: #5b3fd9; font-size: 10px; font-weight: 600; }
.visitor-section-intro h2 { margin-block: 4px 8px; color: #010028; font-size: 26px; font-weight: 700; line-height: 1.3; letter-spacing: -.02em; text-wrap: balance; }
.visitor-section-intro p { max-inline-size: 680px; margin-inline: auto; color: #665d85; font-size: 12px; line-height: 1.6; }
.visitor-pathway-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.visitor-pathway { position: relative; display: flex; flex-direction: column; min-inline-size: 0; padding: 24px 20px 20px; border: 1px solid #e4dff7; border-radius: 14px; background: white; }
.visitor-pathway--student { border-color: #5fcc7b; background: linear-gradient(140deg, #f5fdf7, white 65%); }
.visitor-student-ribbon { position: absolute; inset-block-start: 0; inset-inline-end: 0; padding: 3px 10px; border-start-end-radius: 13px; border-end-start-radius: 8px; background: #027231; color: white; font-size: 9px; font-weight: 600; line-height: 1.6; }
.visitor-pathway h3 { color: #010028; font-size: 17px; font-weight: 700; line-height: 1.4; }
.visitor-pathway-intro { margin-block-start: 4px; color: #665d85; font-size: 10px; line-height: 1.7; }
.visitor-pathway--student .visitor-pathway-intro { color: #027231; font-weight: 600; }
.visitor-pathway-description { margin-block: 16px 12px; color: #665d85; font-size: 12px; line-height: 1.8; }
.visitor-feature-list { display: grid; gap: 5px; padding: 10px; border: 1px solid #d8d1eb; border-radius: 9px; background: #f8f9fb; list-style: none; }
.visitor-feature-list li { display: flex; gap: 7px; align-items: flex-start; color: #665d85; font-size: 10px; line-height: 1.5; }
.visitor-feature-list svg { margin-block-start: 1px; inline-size: 12px; block-size: 12px; color: #6b4aee; flex-shrink: 0; }
.visitor-pathway--student .visitor-feature-list { border-color: #5fcc7b70; background: #5fcc7b0b; }
.visitor-pathway--student .visitor-feature-list li { color: #02572a; }
.visitor-pathway--student .visitor-feature-list svg { color: #027231; }
.visitor-demo-code { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px; margin-block: 12px 18px; padding: 8px; border: 1px solid #5fcc7b70; border-radius: 7px; font-size: 9px; color: #665d85; }
.visitor-demo-code strong { display: inline-block; color: #027231; font-weight: 700; }
.visitor-demo-code a { color: #027231; font-weight: 600; text-decoration: underline; }
.visitor-pathway-cta { inline-size: 100%; margin-block-start: auto; }
.visitor-pathway--school .visitor-pathway-cta { margin-block-start: auto; }
.visitor-pathway--school .visitor-feature-list { margin-block-end: 60px; }
.visitor-panel { padding: 26px; border: 1px solid #e4dff7; border-radius: 14px; background: white; }
.visitor-pathways + .visitor-panel, .visitor-information-grid, .visitor-faq { margin-block-start: 38px; }
.visitor-panel-heading h2, .visitor-faq-title { display: flex; align-items: center; gap: 8px; color: #010028; font-size: 16px; font-weight: 700; line-height: 1.5; }
.visitor-panel-heading h2 svg, .visitor-faq-title svg { inline-size: 18px; block-size: 18px; flex-shrink: 0; color: #6b4aee; }
.visitor-panel-heading > p { margin-block-start: 4px; color: #665d85; font-size: 10px; line-height: 1.7; }
.visitor-timeline { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-block-start: 22px; list-style: none; }
.visitor-timeline li { padding: 16px 14px; border: 1px solid #e4dff7; border-radius: 10px; background: #f8f9fb; }
.visitor-timeline h3 { color: #5b3fd9; font-size: 10px; font-weight: 700; line-height: 1.7; text-transform: uppercase; }
.visitor-timeline li:nth-child(2) h3 { color: #027231; }
.visitor-timeline li:nth-child(4) h3 { color: #010028; }
.visitor-timeline-date { margin-block: 10px 8px; color: #010028; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.visitor-timeline li > p:not(.visitor-timeline-date) { color: #665d85; font-size: 11px; line-height: 1.8; }
.visitor-information-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.visitor-rules { display: grid; gap: 13px; margin-block-start: 20px; list-style: none; }
.visitor-rules li { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; line-height: 1.8; }
.visitor-rules svg { inline-size: 15px; block-size: 15px; flex-shrink: 0; margin-block-start: 3px; color: #6b4aee; }
.visitor-rubric { margin-block-start: 15px; }
.visitor-rubric > div { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-block: 9px; border-block-end: 1px solid #eeecf9; font-size: 11px; }
.visitor-rubric dd { color: #5b3fd9; font-weight: 700; font-variant-numeric: tabular-nums; }
.visitor-rubric-total { margin-block-start: 12px; color: #027231; font-size: 11px; font-weight: 700; text-align: end; }
.visitor-faq-list { display: grid; gap: 10px; margin-block-start: 20px; }
.visitor-faq details { overflow: hidden; border: 1px solid #e4dff7; border-radius: 10px; background: #f8f9fb; }
.visitor-faq summary { display: flex; justify-content: space-between; align-items: center; gap: 16px; min-block-size: 44px; padding: 13px 14px; cursor: pointer; list-style: none; color: #010028; font-size: 11px; font-weight: 600; line-height: 1.6; }
.visitor-faq summary::-webkit-details-marker { display: none; }
.visitor-faq summary::marker { content: ''; }
.visitor-faq summary:hover { background: #f2f0fe; }
.visitor-faq summary:focus-visible { outline: 2px solid #6b4aee; outline-offset: -3px; }
.visitor-faq-indicator { position: relative; inline-size: 10px; block-size: 10px; flex-shrink: 0; color: #6b4aee; }
.visitor-faq-indicator::before, .visitor-faq-indicator::after { content: ''; position: absolute; top: 50%; left: 50%; background: currentColor; transform: translate(-50%, -50%); }
.visitor-faq-indicator::before { inline-size: 8px; block-size: 1px; }
.visitor-faq-indicator::after { inline-size: 1px; block-size: 8px; }
.visitor-faq details[open] .visitor-faq-indicator::after { display: none; }
.visitor-faq details[open] summary { border-block-end: 1px solid #e4dff7; }
.visitor-faq details > p { padding: 16px 14px; background: white; color: #665d85; font-size: 11px; line-height: 1.9; }
.visitor-demo-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-block-start: 26px; font-size: 10px; color: #665d85; }
@media (max-width: 800px) {
  .visitor-hero { padding: 36px; }
  .visitor-identity { font-size: 9px; }
  .visitor-timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 639px) {
  .visitor-container { padding: 20px 16px 40px; }
  .visitor-utility { gap: 10px; }
  .visitor-identity { flex-basis: 100%; font-size: 10px; }
  .visitor-tab { min-block-size: 36px; font-size: 11px; }
  .visitor-hero { padding: 28px 22px; border-radius: 16px; }
  .visitor-hero h1 { font-size: 30px; line-height: 1.25; }
  .visitor-hero-description { font-size: 13px; }
  .visitor-hero-actions, .visitor-primary-actions { inline-size: 100%; }
  .visitor-primary-actions { flex-direction: column; }
  .visitor-hero-actions > .visitor-button, .visitor-primary-actions > .visitor-button { inline-size: 100%; }
  .visitor-button { font-size: 12px; }
  .visitor-hero-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 16px; }
  .visitor-hero-facts dt { font-size: 11px; }
  .visitor-hero-facts dd { font-size: 12px; }
  .public-journey, .visitor-pathways, .visitor-pathways + .visitor-panel, .visitor-information-grid, .visitor-faq { margin-block-start: 24px; }
  .visitor-pathways { padding: 22px 16px 16px; border-radius: 16px; }
  .visitor-section-intro h2 { font-size: 24px; }
  .visitor-section-intro p { font-size: 12px; }
  .visitor-pathway-grid, .visitor-information-grid { grid-template-columns: minmax(0, 1fr); }
  .visitor-pathway { padding: 28px 18px 18px; }
  .visitor-pathway--school .visitor-feature-list { margin-block-end: 20px; }
  .visitor-pathway-intro { font-size: 11px; }
  .visitor-pathway-description { font-size: 13px; }
  .visitor-feature-list li { font-size: 11px; }
  .visitor-demo-code { font-size: 10px; }
  .visitor-panel { padding: 20px; }
  .visitor-timeline { grid-template-columns: minmax(0, 1fr); }
  .visitor-timeline h3 { font-size: 11px; }
  .visitor-timeline li > p:not(.visitor-timeline-date), .visitor-rules li, .visitor-rubric > div, .visitor-faq summary, .visitor-faq details > p { font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .visitor-tab, .visitor-button { transition: none; }
}
</style>
