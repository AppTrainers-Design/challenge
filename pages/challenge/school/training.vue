<script setup lang="ts">
import type { Team } from '~/types/challenge'

definePageMeta({ layout: 'challenge' })
const { t } = useI18n()
const localePath = useLocalePath()
const { lt, number } = useChallengeFormat()
const { state, currentSchool, studentProgress, teamProgress, teamEligible } = useChallenge()
useHead({ title: () => `${t('challenge.school.trainingTitle')} - Gaming Lab`, meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const teams = computed(() => (state.value?.teams ?? []).filter(team => team.schoolId === currentSchool.value?.id))
const students = computed(() => (state.value?.students ?? []).filter(student => student.schoolId === currentSchool.value?.id))
const unassigned = computed(() => students.value.filter(student => !teams.value.some(team => team.memberIds.includes(student.id))))
const expanded = ref<string[]>([])
const threshold = computed(() => state.value?.competition.trainingThreshold ?? 80)
const sessionIds = computed(() => new Set(state.value?.course.sessions.map(session => session.id) ?? []))
const percent = (value: number) => `${number(value, { maximumFractionDigits: 1 })}%`
const roster = (team: Team) => students.value.filter(student => team.memberIds.includes(student.id))
function count(studentId: string, kind: 'attendedSessionIds' | 'completedAssignmentIds') {
  const progress = state.value?.trainingProgress.find(item => item.studentId === studentId)
  return new Set((progress?.[kind] ?? []).filter(id => sessionIds.value.has(id))).size
}
function quiz(studentId: string) {
  const score = state.value?.trainingProgress.find(item => item.studentId === studentId)?.quizScore
  return score === null || score === undefined ? t('challenge.school.training.notTaken') : percent(score)
}
function toggle(teamId: string) { expanded.value = expanded.value.includes(teamId) ? expanded.value.filter(id => id !== teamId) : [...expanded.value, teamId] }
watch(() => currentSchool.value?.id, () => { expanded.value = [] })
</script>

<template>
  <div class="challenge-page">
    <header class="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div><h1 class="challenge-heading">{{ t('challenge.school.trainingTitle') }}</h1><p class="challenge-subtitle">{{ t('challenge.school.training.subtitle') }}</p></div>
      <NuxtLink :to="localePath('/challenge/school')" class="challenge-button-secondary"><AppIcon name="users" class="h-4 w-4" />{{ t('challenge.school.backToTeams') }}</NuxtLink>
    </header>
    <ChallengeEmptyState v-if="!currentSchool" :title="t('challenge.school.noSchoolTitle')" :description="t('challenge.school.noSchoolHelp')" icon="building" />
    <section v-else class="challenge-panel" aria-labelledby="training-summary-title">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="training-summary-title" class="text-xl font-bold text-heading">{{ lt(currentSchool.name) }}</h2><p class="mt-2 max-w-2xl text-sm leading-relaxed text-text">{{ t('challenge.school.training.weights') }}</p></div>
        <ChallengeStatusPill tone="brand">{{ t('challenge.shell.threshold', { value: number(threshold) }) }}</ChallengeStatusPill>
      </div>

      <div v-if="teams.length" class="mt-6 overflow-x-auto rounded-xl border border-brand/10">
        <table class="w-full min-w-[34rem] text-start text-sm">
          <caption class="sr-only">{{ t('challenge.school.training.teamTable') }}</caption>
          <thead class="bg-brand/5 text-heading"><tr><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.training.team') }}</th><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.students') }}</th><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.teamCompletion') }}</th><th scope="col" class="px-4 py-3 text-start">{{ t('challenge.school.training.eligibility') }}</th></tr></thead>
          <tbody>
            <template v-for="team in teams" :key="team.id">
              <tr class="border-t border-brand/10"><th scope="row" class="px-4 py-4 text-start"><button type="button" class="inline-flex min-h-11 items-center gap-2 font-semibold text-heading" :aria-expanded="expanded.includes(team.id)" :aria-controls="`training-roster-${team.id}`" @click="toggle(team.id)"><AppIcon name="chevron-down" class="h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none" :class="expanded.includes(team.id) ? 'rotate-180' : ''" /><span class="break-words">{{ lt(team.name) }}</span></button></th><td class="px-4 py-4">{{ number(team.memberIds.length) }}</td><td class="px-4 py-4 font-semibold text-heading">{{ percent(teamProgress(team)) }}</td><td class="px-4 py-4"><ChallengeStatusPill :tone="teamEligible(team) ? 'success' : 'warning'">{{ t(teamEligible(team) ? 'challenge.status.eligible' : 'challenge.status.ineligible') }}</ChallengeStatusPill></td></tr>
              <tr v-if="expanded.includes(team.id)" :id="`training-roster-${team.id}`" class="border-t border-brand/10"><td colspan="4" class="bg-[#fbfaff] p-4">
                <p class="mb-3 text-xs leading-relaxed text-text">{{ t('challenge.school.training.eligibilityHelp', { minimum: number(state?.competition.minTeamMembers ?? 3), maximum: number(state?.competition.maxTeamMembers ?? 5), threshold: number(threshold) }) }}</p>
                <table v-if="roster(team).length" class="w-full text-xs"><caption class="sr-only">{{ t('challenge.school.training.studentTable', { team: lt(team.name) }) }}</caption><thead class="text-text"><tr><th scope="col" class="py-2 pe-3 text-start">{{ t('challenge.school.training.student') }}</th><th scope="col" class="px-3 py-2 text-start">{{ t('challenge.school.training.attendance') }}</th><th scope="col" class="px-3 py-2 text-start">{{ t('challenge.school.training.assignments') }}</th><th scope="col" class="px-3 py-2 text-start">{{ t('challenge.school.training.quiz') }}</th><th scope="col" class="ps-3 py-2 text-start">{{ t('challenge.school.teamCompletion') }}</th></tr></thead><tbody><tr v-for="student in roster(team)" :key="student.id" class="border-t border-brand/10"><th scope="row" class="py-3 pe-3 text-start font-semibold text-heading">{{ lt(student.name) }}</th><td class="px-3 py-3">{{ t('challenge.school.training.sessionCount', { count: number(count(student.id, 'attendedSessionIds')), total: number(sessionIds.size) }) }}</td><td class="px-3 py-3">{{ t('challenge.school.training.sessionCount', { count: number(count(student.id, 'completedAssignmentIds')), total: number(sessionIds.size) }) }}</td><td class="px-3 py-3">{{ quiz(student.id) }}</td><td class="ps-3 py-3 font-semibold" :class="studentProgress(student.id) >= threshold ? 'text-accent-deep' : 'text-brand-deep'">{{ percent(studentProgress(student.id)) }}</td></tr></tbody></table>
                <p v-else class="py-3 text-sm text-text">{{ t('challenge.school.roster.noMembersTitle') }}</p>
              </td></tr>
            </template>
          </tbody>
        </table>
      </div>
      <p v-if="teams.length" class="mt-3 text-xs leading-relaxed text-text">{{ t('challenge.school.training.expandHelp') }}</p>
      <ChallengeEmptyState v-else :title="t('challenge.school.noTeamsTitle')" :description="t('challenge.school.noTeamsHelp')" icon="users" />

      <section v-if="unassigned.length" class="mt-8 border-t border-brand/10 pt-6" aria-labelledby="unassigned-training-title">
        <h3 id="unassigned-training-title" class="text-base font-bold text-heading">{{ t('challenge.school.training.unassigned') }}</h3><p class="mt-2 text-sm leading-relaxed text-text">{{ t('challenge.school.training.unassignedHelp') }}</p>
        <ul class="mt-4 divide-y divide-brand/10"><li v-for="student in unassigned" :key="student.id" class="flex flex-wrap items-center justify-between gap-3 py-3"><span class="text-sm font-semibold text-heading">{{ lt(student.name) }}</span><span class="text-sm text-text">{{ percent(studentProgress(student.id)) }}</span></li></ul>
      </section>
    </section>
  </div>
</template>
