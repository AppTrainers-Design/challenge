<script setup lang="ts">
import type { GameSubmission, Team } from '~/types/challenge'
definePageMeta({ layout: 'default' })
const { t } = useI18n()
const { state, ready, init, rankings } = useChallenge()
const { lt, number, date } = useChallengeFormat()
const localePath = useLocalePath()
const search = ref('')
const genre = ref('')
const platform = ref('')
const award = ref('')
const projectOpen = ref(false)
const selectedSubmission = ref<GameSubmission | null>(null)
const selectedTeam = ref<Team | null>(null)
const published = computed(() => state.value?.competition.resultsVisibility === 'published' && ['results', 'archived'].includes(state.value.competition.phase))
const projects = computed(() => rankings.value.map(row => ({ row, team: state.value?.teams.find(team => team.id === row.teamId), submission: state.value?.submissions.find(submission => submission.teamId === row.teamId), school: state.value?.schools.find(school => school.id === state.value?.teams.find(team => team.id === row.teamId)?.schoolId), awards: state.value?.awards.filter(item => item.teamId === row.teamId) ?? [] })))
const filtered = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return projects.value.filter(project => project.submission && (!query || [lt(project.team?.name), lt(project.school?.name), lt(project.submission.content.title)].some(value => value.toLocaleLowerCase().includes(query))) && (!genre.value || project.submission.content.genre === genre.value) && (!platform.value || project.submission.content.platform === platform.value) && (!award.value || project.awards.some(item => item.id === award.value)))
})
function openProject(submission?: GameSubmission, team?: Team) { if (!submission || !team) return; selectedSubmission.value = submission; selectedTeam.value = team; projectOpen.value = true }
onMounted(init)
useHead(() => ({ title: t('challenge.results.title') + ' - Gaming Lab', meta: [{ name: 'robots', content: 'noindex, nofollow' }] }))
</script>
<template>
  <ChallengeSurface class="bg-[#f8f9fb] text-text">
    <div v-if="ready && state" class="challenge-page space-y-8">
      <NuxtLink :to="localePath('/challenge')" class="inline-flex items-center gap-2 text-sm font-semibold text-brand-deep"><AppIcon name="arrow-left" class="h-4 w-4 rtl:-scale-x-100" />{{ t('challenge.results.back') }}</NuxtLink>
      <section v-if="!published" class="challenge-panel mx-auto max-w-3xl !py-12 text-center">
        <AppIcon name="trophy" class="mx-auto mb-6 h-12 w-12 text-brand-deep" /><h1 class="challenge-heading">{{ t('challenge.results.pendingTitle') }}</h1><p class="challenge-subtitle mx-auto">{{ t('challenge.visitor.resultsPending') }}</p><p class="mt-5 text-sm font-semibold text-brand-deep">{{ t('challenge.visitor.resultsDate', { date: date(state.competition.resultsDate, { dateStyle: 'long' }) }) }}</p><ChallengeStatusPill class="mt-6" tone="brand">{{ t('challenge.phases.' + state.competition.phase) }}</ChallengeStatusPill>
      </section>
      <template v-else>
        <header class="text-center"><ChallengeStatusPill tone="success">{{ t('challenge.results.published') }}</ChallengeStatusPill><h1 class="challenge-heading mt-4">{{ t('challenge.results.title') }}</h1><p class="challenge-subtitle mx-auto">{{ t('challenge.results.subtitle') }}</p></header>
        <ChallengePodium :rankings="rankings" />
        <section class="challenge-panel" aria-labelledby="gallery-title">
          <h2 id="gallery-title" class="text-xl font-bold text-heading">{{ t('challenge.results.gallery') }}</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label><span class="challenge-label">{{ t('challenge.results.search') }}</span><input v-model="search" type="search" class="challenge-field" /></label>
            <label><span class="challenge-label">{{ t('challenge.results.genre') }}</span><select v-model="genre" class="challenge-field"><option value="">{{ t('challenge.results.all') }}</option><option v-for="item in ['educational','adventure','puzzle','platformer']" :key="item" :value="item">{{ t('challenge.genres.' + item) }}</option></select></label>
            <label><span class="challenge-label">{{ t('challenge.results.platform') }}</span><select v-model="platform" class="challenge-field"><option value="">{{ t('challenge.results.all') }}</option><option v-for="item in ['web','windows','android']" :key="item" :value="item">{{ t('challenge.platforms.' + item) }}</option></select></label>
            <label><span class="challenge-label">{{ t('challenge.results.award') }}</span><select v-model="award" class="challenge-field"><option value="">{{ t('challenge.results.all') }}</option><option v-for="item in state.awards" :key="item.id" :value="item.id">{{ lt(item.name) }}</option></select></label>
          </div>
          <p class="mt-4 text-xs" role="status">{{ t('challenge.results.count', { count: number(filtered.length) }) }}</p>
          <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article v-for="project in filtered" :key="project.row.teamId" class="overflow-hidden rounded-xl border border-brand/15">
              <div class="relative flex h-40 items-center justify-center bg-[#f2f0fe]"><img v-if="safeUrl(project.submission?.content.coverUrl)" :src="safeUrl(project.submission?.content.coverUrl)" :alt="lt(project.submission?.content.title)" class="h-full w-full object-cover" loading="lazy" /><AppIcon v-else name="gamepad" class="h-12 w-12 text-brand-deep" /><span class="absolute start-3 top-3 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-brand-deep">{{ t('challenge.results.place', { rank: number(project.row.rank) }) }}</span></div>
              <div class="space-y-3 p-5"><h3 class="text-lg font-bold text-heading">{{ lt(project.submission?.content.title) }}</h3><p class="text-xs">{{ lt(project.team?.name) }} · {{ lt(project.school?.name) }}</p><div class="flex flex-wrap gap-2"><ChallengeStatusPill v-for="item in project.awards" :key="item.id" tone="success">{{ lt(item.name) }}</ChallengeStatusPill></div><div class="flex flex-wrap items-center justify-between gap-3"><span class="text-lg font-bold text-brand-deep"><bdi dir="ltr">{{ number(project.row.score, { maximumFractionDigits: 2 }) }} / {{ number(100) }}</bdi></span><button type="button" class="challenge-button-secondary" @click="openProject(project.submission,project.team)">{{ t('challenge.results.viewProject') }}</button></div></div>
            </article>
          </div>
          <ChallengeEmptyState v-if="!filtered.length" class="mt-6" :title="t('challenge.results.noProjects')" :description="t('challenge.results.noProjectsHint')" icon="gamepad" />
        </section>
        <section class="challenge-panel" aria-labelledby="leaderboard-title"><h2 id="leaderboard-title" class="text-xl font-bold text-heading">{{ t('challenge.results.leaderboard') }}</h2><div class="mt-5 overflow-x-auto"><table class="w-full min-w-[600px] text-start text-sm"><thead class="bg-[#f2f0fe] text-heading"><tr><th scope="col" class="p-3 text-start">{{ t('challenge.results.rank') }}</th><th scope="col" class="p-3 text-start">{{ t('challenge.results.team') }}</th><th scope="col" class="p-3 text-start">{{ t('challenge.results.school') }}</th><th scope="col" class="p-3 text-start">{{ t('challenge.results.score') }}</th><th scope="col" class="p-3 text-start">{{ t('challenge.results.evaluations') }}</th></tr></thead><tbody><tr v-for="project in filtered" :key="project.row.teamId" class="border-b border-gray-100"><td class="p-3 font-bold text-brand-deep">{{ number(project.row.rank) }}</td><td class="p-3">{{ lt(project.team?.name) }}</td><td class="p-3">{{ lt(project.school?.name) }}</td><td class="p-3 font-bold">{{ number(project.row.score, { maximumFractionDigits: 2 }) }}</td><td class="p-3">{{ number(project.row.evaluationCount) }}</td></tr></tbody></table></div></section>
      </template>
      <p class="text-xs">{{ t('challenge.shell.demoNotice') }}</p>
      <ChallengeProjectModal v-model="projectOpen" :submission="selectedSubmission" :team="selectedTeam" />
    </div>
    <ChallengePageSkeleton v-else /><ChallengeToaster />
  </ChallengeSurface>
</template>
