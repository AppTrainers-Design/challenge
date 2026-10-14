<script setup lang="ts">
import type { AgeCategory, Team } from '~/types/challenge'

definePageMeta({ layout: 'challenge' })
const { t } = useI18n()
const localePath = useLocalePath()
const { lt, number, date } = useChallengeFormat()
const toast = useChallengeToast()
const { state, currentSchool, createSchoolTeam, teamProgress, teamEligible } = useChallenge()
useHead({ title: () => `${t('challenge.school.title')} - Gaming Lab`, meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const teams = computed(() => (state.value?.teams ?? []).filter(team => team.schoolId === currentSchool.value?.id))
const studentCount = computed(() => (state.value?.students ?? []).filter(student => student.schoolId === currentSchool.value?.id).length)
const canManage = computed(() => state.value?.competition.phase === 'team_formation' && currentSchool.value?.approvalStatus === 'approved')
const createOpen = ref(false)
const rosterOpen = ref(false)
const selectedTeamId = ref<string | null>(null)
const selectedTeam = computed(() => teams.value.find(team => team.id === selectedTeamId.value) ?? null)
const name = ref('')
const ageCategory = ref<AgeCategory>('12-14')
const error = ref('')
const maxMembers = computed(() => state.value?.competition.maxTeamMembers ?? 5)
const threshold = computed(() => state.value?.competition.trainingThreshold ?? 80)
const tone = (status: string) => status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'
const ageRange = (range: string) => `\u2066${range.replace('-', '–')}\u2069`

watch(() => currentSchool.value?.id, () => { createOpen.value = false; rosterOpen.value = false; selectedTeamId.value = null; error.value = '' })
watch(createOpen, open => { if (open) { name.value = ''; ageCategory.value = '12-14'; error.value = '' } })
function create() {
  error.value = ''
  const result = createSchoolTeam(name.value.trim(), ageCategory.value)
  if (toast.result(result, 'challenge.school.toasts.teamCreated')) createOpen.value = false
  else error.value = t(result.errorKey ?? 'challenge.toasts.failed')
}
function openRoster(team: Team) { selectedTeamId.value = team.id; rosterOpen.value = true }
async function copyCode(code: string) {
  try { await navigator.clipboard.writeText(code); toast.push('challenge.school.toasts.codeCopied') }
  catch { toast.push('challenge.school.toasts.copyFailed', 'danger') }
}
</script>

<template>
  <div class="challenge-page">
    <header class="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div><h1 class="challenge-heading">{{ t('challenge.school.title') }}</h1><p class="challenge-subtitle">{{ t('challenge.school.subtitle') }}</p></div>
      <NuxtLink :to="localePath('/challenge/school/training')" class="challenge-button-secondary"><AppIcon name="book-open" class="h-4 w-4" />{{ t('challenge.school.openTraining') }}</NuxtLink>
    </header>

    <ChallengeEmptyState v-if="!currentSchool" :title="t('challenge.school.noSchoolTitle')" :description="t('challenge.school.noSchoolHelp')" icon="building" />
    <template v-else>
      <section class="challenge-panel" aria-labelledby="school-profile-title">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div><h2 id="school-profile-title" class="text-xl font-bold text-heading break-words">{{ lt(currentSchool.name) }}</h2><p class="mt-2 text-sm text-text">{{ t(`challenge.governorates.${currentSchool.governorate}`) }} · {{ t(`challenge.schoolTypes.${currentSchool.type}`) }}</p></div>
          <ChallengeStatusPill :tone="tone(currentSchool.approvalStatus)">{{ t(`challenge.status.${currentSchool.approvalStatus}`) }}</ChallengeStatusPill>
        </div>
        <dl class="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-brand/10 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <div><dt class="text-xs text-text">{{ t('challenge.school.coordinator') }}</dt><dd class="mt-1 font-semibold text-heading break-words">{{ lt(currentSchool.contactName) }}</dd></div>
          <div><dt class="text-xs text-text">{{ t('challenge.school.contact') }}</dt><dd class="mt-1 break-all text-sm text-heading"><bdi>{{ currentSchool.email }}</bdi><br><bdi>{{ currentSchool.phone }}</bdi></dd></div>
          <div><dt class="text-xs text-text">{{ t('challenge.school.registered') }}</dt><dd class="mt-1 text-sm text-heading">{{ date(currentSchool.registeredAt) }}</dd></div>
          <div><dt class="text-xs text-text">{{ t('challenge.school.teams') }}</dt><dd class="mt-1 font-semibold text-heading">{{ number(teams.length) }}</dd></div>
          <div><dt class="text-xs text-text">{{ t('challenge.school.students') }}</dt><dd class="mt-1 font-semibold text-heading">{{ number(studentCount) }}</dd></div>
          <div><dt class="text-xs text-text">{{ t('challenge.school.expectedStudents') }}</dt><dd class="mt-1 font-semibold text-heading">{{ number(currentSchool.expectedStudents) }}</dd></div>
        </dl>
        <div v-if="currentSchool.reviewNote" class="mt-6 rounded-xl bg-brand/5 p-4 text-sm leading-relaxed"><p class="font-semibold text-heading">{{ t('challenge.school.reviewNote') }}</p><p class="mt-1 whitespace-pre-wrap break-words text-text">{{ currentSchool.reviewNote }}</p></div>
      </section>

      <section class="challenge-panel mt-7" aria-labelledby="school-teams-title">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div><h2 id="school-teams-title" class="text-xl font-bold text-heading">{{ t('challenge.school.teams') }}</h2><p class="mt-2 max-w-2xl text-sm leading-relaxed text-text">{{ t('challenge.school.teamsHelp', { minimum: number(state?.competition.minTeamMembers ?? 3), maximum: number(maxMembers) }) }}</p></div>
          <button type="button" class="challenge-button" :disabled="!canManage" @click="createOpen = true"><AppIcon name="plus" class="h-4 w-4" />{{ t('challenge.school.newTeam') }}</button>
        </div>
        <div v-if="!canManage" class="mt-4 flex gap-2 rounded-xl bg-brand/5 p-3 text-sm leading-relaxed text-text" role="status"><AppIcon name="lock" class="mt-0.5 h-4 w-4 shrink-0" /><p>{{ currentSchool.approvalStatus !== 'approved' ? t('challenge.school.approvalRequired') : t('challenge.shell.lockedPhase', { phase: t('challenge.phases.team_formation') }) }}</p></div>

        <ul v-if="teams.length" class="mt-6 divide-y divide-brand/10">
          <li v-for="team in teams" :key="team.id" class="py-6 first:pt-0 last:pb-0">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0"><h3 class="text-lg font-bold text-heading break-words">{{ lt(team.name) }}</h3><p class="mt-1 text-sm text-text">{{ t('challenge.school.ageCategory', { range: ageRange(team.ageCategory) }) }} · <i18n-t keypath="challenge.school.memberCount" tag="span"><template #ratio><bdi dir="ltr">{{ number(team.memberIds.length) }} / {{ number(maxMembers) }}</bdi></template></i18n-t></p></div>
              <ChallengeStatusPill :tone="tone(team.approvalStatus)">{{ t(`challenge.status.${team.approvalStatus}`) }}</ChallengeStatusPill>
            </div>
            <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
              <div><p class="mb-2 text-xs font-semibold text-text">{{ t('challenge.school.inviteCode') }}</p><div class="flex items-center gap-2"><input :id="`invite-${team.id}`" :value="team.inviteCode" :aria-label="t('challenge.school.inviteCode')" class="challenge-field max-w-[10rem] font-semibold tracking-widest" dir="ltr" readonly @focus="($event.target as HTMLInputElement).select()"><button type="button" class="challenge-icon-button" :aria-label="t('challenge.school.copyCode', { team: lt(team.name) })" @click="copyCode(team.inviteCode)"><AppIcon name="copy" class="h-5 w-5" /></button></div></div>
              <div><ChallengeProgress :value="teamProgress(team)" :threshold="threshold" :label="t('challenge.school.teamCompletion')" /><p class="mt-2 text-xs font-semibold" :class="teamEligible(team) ? 'text-accent-deep' : 'text-brand-deep'">{{ t(teamEligible(team) ? 'challenge.status.eligible' : 'challenge.status.ineligible') }}</p></div>
              <button type="button" class="challenge-button-secondary self-start lg:self-center" @click="openRoster(team)"><AppIcon name="users" class="h-4 w-4" />{{ t('challenge.school.manageRoster') }}</button>
            </div>
            <div v-if="team.reviewNote" class="mt-4 text-sm leading-relaxed text-text"><p class="font-semibold text-heading">{{ t('challenge.school.reviewNote') }}</p><p class="mt-1 whitespace-pre-wrap break-words">{{ team.reviewNote }}</p></div>
          </li>
        </ul>
        <ChallengeEmptyState v-else :title="t('challenge.school.noTeamsTitle')" :description="t('challenge.school.noTeamsHelp')" icon="users" />
      </section>
    </template>

    <ChallengeModal v-model="createOpen" :title="t('challenge.school.newTeam')">
      <form class="space-y-5" @submit.prevent="create">
        <p class="text-sm leading-relaxed text-text">{{ t('challenge.school.newTeamHelp') }}</p>
        <div><label for="school-team-name" class="challenge-label">{{ t('challenge.school.teamName') }}</label><input id="school-team-name" v-model="name" class="challenge-field" maxlength="80" minlength="2" required :disabled="!canManage" :aria-invalid="!!error" @input="error = ''"></div>
        <div><label for="school-team-age" class="challenge-label">{{ t('challenge.school.ageLabel') }}</label><select id="school-team-age" v-model="ageCategory" class="challenge-field" :disabled="!canManage"><option v-for="age in state?.competition.ageCategories ?? ['12-14', '15-18']" :key="age" :value="age">{{ t('challenge.school.ageCategory', { range: ageRange(age) }) }}</option></select></div>
        <p v-if="error" class="text-sm text-red-700" role="alert">{{ error }}</p>
        <p v-if="!canManage" class="text-sm text-text">{{ t('challenge.shell.lockedPhase', { phase: t('challenge.phases.team_formation') }) }}</p>
        <div class="flex flex-wrap justify-end gap-3"><button type="button" class="challenge-button-secondary" @click="createOpen = false">{{ t('challenge.shell.cancel') }}</button><button type="submit" class="challenge-button" :disabled="!canManage || name.trim().length < 2">{{ t('challenge.school.createTeam') }}</button></div>
      </form>
    </ChallengeModal>
    <ChallengeTeamRosterModal v-model="rosterOpen" :team="selectedTeam" />
  </div>
</template>
