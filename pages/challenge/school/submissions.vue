<script setup lang="ts">
import type { GameSubmission, Team } from '~/types/challenge'

definePageMeta({ layout: 'challenge' })
const { t } = useI18n()
const localePath = useLocalePath()
const { lt, number, date } = useChallengeFormat()
const { state, currentSchool } = useChallenge()
useHead({ title: () => `${t('challenge.school.submissionsTitle')} - Gaming Lab`, meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const teams = computed(() => (state.value?.teams ?? []).filter(team => team.schoolId === currentSchool.value?.id))
const submissions = computed(() => teams.value.map(team => ({ team, submission: state.value?.submissions.find(item => item.teamId === team.id) ?? null })))
const submitted = computed(() => submissions.value.filter(row => row.submission && row.submission.status !== 'draft').length)
const projectOpen = ref(false)
const selectedTeamId = ref<string | null>(null)
const selected = computed(() => submissions.value.find(row => row.team.id === selectedTeamId.value) ?? null)
const version = (submission: GameSubmission | null) => submission?.versions.at(-1)?.version || '—'
const tone = (status: string | undefined) => status === 'submitted' ? 'success' : status === 'locked' ? 'brand' : 'neutral'
function preview(team: Team) { selectedTeamId.value = team.id; projectOpen.value = true }
watch(() => currentSchool.value?.id, () => { projectOpen.value = false; selectedTeamId.value = null })
</script>

<template>
  <div class="challenge-page">
    <header class="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div><h1 class="challenge-heading">{{ t('challenge.school.submissionsTitle') }}</h1><p class="challenge-subtitle">{{ t('challenge.school.submissions.subtitle') }}</p></div>
      <NuxtLink :to="localePath('/challenge/school')" class="challenge-button-secondary"><AppIcon name="users" class="h-4 w-4" />{{ t('challenge.school.backToTeams') }}</NuxtLink>
    </header>
    <ChallengeEmptyState v-if="!currentSchool" :title="t('challenge.school.noSchoolTitle')" :description="t('challenge.school.noSchoolHelp')" icon="building" />
    <template v-else>
      <section class="challenge-panel" aria-labelledby="school-submission-deadline">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div><h2 id="school-submission-deadline" class="text-xl font-bold text-heading">{{ lt(currentSchool.name) }}</h2><p class="mt-3 text-sm text-text">{{ t('challenge.school.submissions.received', { count: number(submitted), total: number(teams.length) }) }}</p><p class="mt-2 text-sm text-text">{{ t('challenge.school.submissions.deadline') }}: <strong class="font-semibold text-heading">{{ date(state?.competition.submissionDeadline, { dateStyle: 'medium', timeStyle: 'short' }) }}</strong></p></div>
          <ChallengeCountdown v-if="state" :deadline="state.competition.submissionDeadline" class="text-heading" />
        </div>
        <p class="mt-5 flex gap-2 rounded-xl bg-brand/5 p-3 text-sm leading-relaxed text-text"><AppIcon name="info" class="mt-0.5 h-4 w-4 shrink-0" /><span>{{ t('challenge.school.submissions.readOnly') }}</span></p>
      </section>

      <section class="challenge-panel mt-7" aria-labelledby="school-submissions-list">
        <h2 id="school-submissions-list" class="text-xl font-bold text-heading">{{ t('challenge.school.submissions.teamProjects') }}</h2>
        <div v-if="teams.length" class="mt-5 overflow-x-auto rounded-xl border border-brand/10">
          <table class="w-full min-w-[41rem] text-sm"><caption class="sr-only">{{ t('challenge.school.submissions.tableCaption') }}</caption><thead class="bg-brand/5 text-heading"><tr><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.submissions.teamGame') }}</th><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.submissions.status') }}</th><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.submissions.version') }}</th><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.submissions.updated') }}</th><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.submissions.preview') }}</th></tr></thead><tbody><tr v-for="row in submissions" :key="row.team.id" class="border-t border-brand/10"><th scope="row" class="px-4 py-5 text-start"><span class="block font-semibold text-heading">{{ lt(row.team.name) }}</span><span class="mt-1 block text-xs font-normal text-text">{{ row.submission ? lt(row.submission.content.title) || t('challenge.school.submissions.untitled') : t('challenge.school.submissions.noProject') }}</span></th><td class="px-4 py-5"><ChallengeStatusPill :tone="tone(row.submission?.status)">{{ row.submission ? t(`challenge.status.${row.submission.status}`) : t('challenge.school.submissions.notStarted') }}</ChallengeStatusPill></td><td class="px-4 py-5"><bdi>{{ version(row.submission) }}</bdi></td><td class="px-4 py-5 text-xs">{{ date(row.submission?.updatedAt) }}</td><td class="px-4 py-5"><button type="button" class="challenge-button-secondary" :disabled="!row.submission" :aria-label="t('challenge.school.submissions.previewTeam', { team: lt(row.team.name) })" @click="preview(row.team)"><AppIcon name="eye" class="h-4 w-4" />{{ t('challenge.school.submissions.preview') }}</button></td></tr></tbody></table>
        </div>
        <ChallengeEmptyState v-else :title="t('challenge.school.noTeamsTitle')" :description="t('challenge.school.noTeamsHelp')" icon="gamepad" />
      </section>
    </template>
    <ChallengeProjectModal v-model="projectOpen" :submission="selected?.submission ?? null" :team="selected?.team ?? null" :blind="false" />
  </div>
</template>
