<script setup lang="ts">
import type { GameSubmission, Team } from '~/types/challenge'
import { weightedScore } from '~/utils/challengeScoring'

definePageMeta({ layout: 'challenge' })
const { t } = useI18n()
const { lt, number, date } = useChallengeFormat()
const { state, currentJudge, teamEligible } = useChallenge()
useHead(() => ({ title: `${t('challenge.judge.title')} - Gaming Lab`, meta: [{ name: 'robots', content: 'noindex, nofollow' }] }))
const filter = ref('all')
const selectedTeam = ref<Team | null>(null)
const selectedSubmission = ref<GameSubmission | null>(null)
const modalOpen = ref(false)
const blind = computed(() => state.value?.competition.blindJudging ?? true)
const phaseOpen = computed(() => state.value?.competition.phase === 'judging')
const queue = computed(() => {
  if (!state.value || !currentJudge.value) return []
  return state.value.teams.filter(team => currentJudge.value!.assignedTeamIds.includes(team.id)).flatMap(team => {
    const submission = state.value!.submissions.find(item => item.teamId === team.id && item.status !== 'draft')
    if (!submission) return []
    const evaluation = state.value!.evaluations.find(item => item.teamId === team.id && item.judgeId === currentJudge.value!.id)
    const school = state.value!.schools.find(item => item.id === team.schoolId)
    return [{ team, submission, evaluation, school, status: evaluation?.status ?? 'not_started', eligible: teamEligible(team) && currentJudge.value!.schoolId !== team.schoolId }]
  })
})
const visibleQueue = computed(() => queue.value.filter(item => filter.value === 'all' || item.status === filter.value))
const counts = computed(() => Object.fromEntries(['not_started', 'draft', 'submitted'].map(status => [status, queue.value.filter(item => item.status === status).length])))
const filterItems = computed(() => ['all', 'not_started', 'draft', 'submitted'].map(id => ({ id, label: `${t(`challenge.judge.queueStatus.${id}`)} (${number(id === 'all' ? queue.value.length : counts.value[id] ?? 0)})` })))
watch(() => currentJudge.value?.id, () => { modalOpen.value = false; selectedTeam.value = null; selectedSubmission.value = null; filter.value = 'all' })
function open(team: Team, submission: GameSubmission) { selectedTeam.value = team; selectedSubmission.value = submission; modalOpen.value = true }
</script>

<template>
  <div class="challenge-page judge-page">
    <header class="judge-heading">
      <div>
        <h1 class="challenge-heading">{{ t('challenge.judge.title') }}</h1>
        <p class="challenge-subtitle">{{ t('challenge.judge.subtitle') }}</p>
      </div>
    </header>
    <ChallengeEmptyState v-if="!currentJudge" :title="t('challenge.judge.noJudge')" :description="t('challenge.judge.noJudgeDescription')" icon="scale" />
    <template v-else>
      <p class="judge-blind-help">{{ t(blind ? 'challenge.judge.blindHelp' : 'challenge.judge.openHelp') }}</p>
      <p v-if="!phaseOpen" class="judge-lock-notice"><AppIcon name="lock" class="h-4 w-4 shrink-0" />{{ t('challenge.judge.phaseLocked') }}</p>
      <section class="challenge-panel judge-queue" aria-labelledby="judge-queue-heading">
        <div class="queue-heading">
          <h2 id="judge-queue-heading" class="text-xl font-bold text-heading">{{ t('challenge.judge.assignedProjects') }}</h2>
          <span class="text-sm text-text">{{ t('challenge.judge.assignedCount', { count: number(queue.length) }) }}</span>
        </div>
        <ChallengeTabs v-model="filter" :items="filterItems" :label="t('challenge.judge.filterLabel')">
          <ol v-if="visibleQueue.length" class="judge-projects">
            <li v-for="item in visibleQueue" :key="item.team.id" class="judge-project">
              <div class="project-content">
                <div class="project-title-row">
                  <h3 class="font-bold text-lg text-heading">{{ lt(item.submission.content.title) || t('challenge.judge.untitled') }}</h3>
                  <ChallengeStatusPill :tone="item.status === 'submitted' ? 'success' : item.status === 'draft' ? 'brand' : 'neutral'">{{ t(`challenge.judge.queueStatus.${item.status}`) }}</ChallengeStatusPill>
                </div>
                <p v-if="!blind" class="project-meta">{{ lt(item.team.name) }} · {{ lt(item.school?.name) }}</p>
                <p class="project-meta">{{ t(`challenge.genres.${item.submission.content.genre}`) }} · {{ t(`challenge.platforms.${item.submission.content.platform}`) }} · {{ t('challenge.judge.submittedDate', { date: date(item.submission.submittedAt) }) }}</p>
                <p v-if="!item.eligible" class="project-eligibility"><AppIcon name="alert-triangle" class="h-4 w-4 shrink-0" />{{ t('challenge.judge.ineligibleNotice') }}</p>
                <i18n-t v-if="item.evaluation" keypath="challenge.judge.savedScore" tag="p" class="project-meta"><template #score><bdi dir="ltr">{{ number(weightedScore(item.evaluation, state?.criteria ?? []), { maximumFractionDigits: 2 }) }} / {{ number(100) }}</bdi></template></i18n-t>
              </div>
              <button type="button" :class="item.status === 'submitted' ? 'challenge-button-secondary' : 'challenge-button'" @click="open(item.team, item.submission)"><AppIcon :name="item.status === 'submitted' || !phaseOpen || !item.eligible ? 'eye' : 'scale'" class="h-4 w-4" />{{ t(item.status === 'submitted' || !phaseOpen || !item.eligible ? 'challenge.judge.review' : item.status === 'draft' ? 'challenge.judge.continue' : 'challenge.judge.startEvaluation') }}</button>
            </li>
          </ol>
          <ChallengeEmptyState v-else :title="t(queue.length ? 'challenge.judge.emptyFilter' : 'challenge.judge.emptyQueue')" :description="t(queue.length ? 'challenge.judge.emptyFilterDescription' : 'challenge.judge.emptyQueueDescription')" icon="scale" />
        </ChallengeTabs>
      </section>
    </template>
    <ChallengeEvaluationModal v-model="modalOpen" :team="selectedTeam" :submission="selectedSubmission" />
  </div>
</template>

<style scoped>
.judge-heading { display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1.25rem; }
.judge-blind-help { max-inline-size: 70ch; margin-block-start: 1.5rem; color: #010028b3; font-size: .875rem; line-height: 1.7; }
.judge-lock-notice { display: flex; align-items: center; gap: .65rem; margin-block-start: 1.25rem; padding: 1rem 1.25rem; border-radius: .75rem; background: #fff5db; color: #785400; line-height: 1.7; font-size: .875rem; }
.judge-queue { margin-block-start: 1.5rem; }
.queue-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; margin-block-end: 1rem; }
.judge-project { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding-block: 1.5rem; border-block-end: 1px solid #eeecf9; }
.judge-project:first-child { padding-block-start: .25rem; }
.judge-project:last-child { border-block-end: 0; padding-block-end: .25rem; }
.project-content { min-inline-size: 0; }
.project-title-row { display: flex; align-items: center; flex-wrap: wrap; gap: .75rem; }
.project-title-row h3 { overflow-wrap: anywhere; }
.project-meta { margin-block-start: .5rem; color: #010028b3; font-size: .8rem; line-height: 1.7; }
.project-eligibility { display: flex; gap: .5rem; align-items: start; color: #785400; margin-block-start: .65rem; font-size: .8rem; }
.judge-project > button { flex-shrink: 0; }
@media (max-width: 639px) { .judge-project { align-items: start; flex-direction: column; gap: 1rem; } .judge-project > button { inline-size: 100%; } }
</style>
