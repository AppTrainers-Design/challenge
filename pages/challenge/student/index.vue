<script setup lang="ts">
import type { AgeCategory } from '~/types/challenge'

definePageMeta({ layout: 'challenge' })

const { t } = useI18n()
const { lt, number, date } = useChallengeFormat()
const toast = useChallengeToast()
const {
  state, currentStudent, currentTeam, joinTeam, createTeam, addDevlog,
  studentProgress, teamProgress, teamEligible,
} = useChallenge()

useHead({
  title: () => `${t('challenge.student.team.title')} - Gaming Lab`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const inviteCode = ref('')
const teamName = ref('')
const ageCategory = ref<AgeCategory>('12-14')
const ageRange = (range: string) => `\u2066${range}\u2069`
const devlogText = ref('')
const joinError = ref('')
const createError = ref('')
const devlogError = ref('')

const phase = computed(() => state.value?.competition.phase)
const canChangeTeam = computed(() => phase.value === 'team_formation')
const canWriteDevlog = computed(() => ['team_formation', 'training', 'submission'].includes(phase.value ?? ''))
const minMembers = computed(() => state.value?.competition.minTeamMembers ?? 3)
const maxMembers = computed(() => state.value?.competition.maxTeamMembers ?? 5)
const roster = computed(() => currentTeam.value
  ? (state.value?.students ?? []).filter(student => currentTeam.value!.memberIds.includes(student.id))
  : [])
const school = computed(() => (state.value?.schools ?? []).find(item => item.id === currentStudent.value?.schoolId))
const teamTraining = computed(() => currentTeam.value ? teamProgress(currentTeam.value) : 0)
const eligible = computed(() => currentTeam.value ? teamEligible(currentTeam.value) : false)
const devlog = computed(() => [...(currentTeam.value?.devlog ?? [])].reverse())
const isLeader = computed(() => !!currentStudent.value && currentTeam.value?.leaderId === currentStudent.value.id)

watch(() => currentStudent.value?.id, () => {
  inviteCode.value = ''
  teamName.value = ''
  devlogText.value = ''
  joinError.value = ''
  createError.value = ''
  devlogError.value = ''
  const birth = new Date(currentStudent.value?.dateOfBirth ?? '')
  const today = new Date()
  const age = today.getUTCFullYear() - birth.getUTCFullYear()
    - (today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate()) ? 1 : 0)
  ageCategory.value = age >= 15 ? '15-18' : '12-14'
}, { immediate: true })

function normalizeCode(event: Event) {
  const input = event.target as HTMLInputElement
  inviteCode.value = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)
  input.value = inviteCode.value
  joinError.value = ''
}

function submitJoin() {
  joinError.value = ''
  if (!/^[A-Z]{6}$/.test(inviteCode.value)) {
    joinError.value = t('challenge.student.validation.inviteCode')
    return
  }
  const result = joinTeam(inviteCode.value)
  toast.result(result, 'challenge.student.toasts.joined')
  if (!result.ok) joinError.value = t(result.errorKey ?? 'challenge.student.validation.joinFailed')
}

function submitCreate() {
  createError.value = ''
  if (teamName.value.trim().length < 2) {
    createError.value = t('challenge.student.validation.teamName')
    return
  }
  const result = createTeam(teamName.value.trim(), ageCategory.value)
  toast.result(result, 'challenge.student.toasts.created')
  if (!result.ok) createError.value = t(result.errorKey ?? 'challenge.student.validation.createFailed')
}

function submitDevlog() {
  devlogError.value = ''
  if (!devlogText.value.trim()) {
    devlogError.value = t('challenge.student.validation.devlog')
    return
  }
  const result = addDevlog(devlogText.value.trim())
  toast.result(result, 'challenge.student.toasts.devlogSaved')
  if (result.ok) devlogText.value = ''
  else devlogError.value = t(result.errorKey ?? 'challenge.student.validation.devlog')
}

async function copyCode() {
  if (!currentTeam.value) return
  try {
    await navigator.clipboard.writeText(currentTeam.value.inviteCode)
    toast.push('challenge.student.toasts.codeCopied')
  } catch {
    toast.push('challenge.student.toasts.copyFailed', 'danger')
  }
}

function authorName(studentId: string) {
  const student = state.value?.students.find(item => item.id === studentId)
  return student ? lt(student.name) : t('challenge.student.team.formerMember')
}
</script>

<template>
  <div class="challenge-page student-team">
    <header class="team-page-header">
      <div>
        <h1 class="challenge-heading">{{ t('challenge.student.team.title') }}</h1>
        <p class="challenge-subtitle">{{ t('challenge.student.team.subtitle') }}</p>
      </div>
    </header>

    <ChallengeEmptyState
      v-if="!currentStudent"
      :title="t('challenge.student.team.noStudentTitle')"
      :description="t('challenge.student.team.noStudentDescription')"
      icon="users"
    />

    <template v-else-if="currentTeam">
      <section class="challenge-panel team-overview" aria-labelledby="my-team-title">
        <div class="team-overview-heading">
          <div>
            <h2 id="my-team-title" class="section-title">{{ lt(currentTeam.name) }}</h2>
            <p class="team-meta">
              <span v-if="school">{{ lt(school.name) }}</span>
              <span>{{ t('challenge.student.team.ageCategory', { range: ageRange(currentTeam.ageCategory) }) }}</span>
            </p>
          </div>
          <div class="team-statuses">
            <ChallengeStatusPill v-if="isLeader" tone="brand">{{ t('challenge.student.team.youLead') }}</ChallengeStatusPill>
            <ChallengeStatusPill :tone="currentTeam.approvalStatus === 'approved' ? 'success' : 'warning'">
              {{ t(`challenge.status.${currentTeam.approvalStatus}`) }}
            </ChallengeStatusPill>
          </div>
        </div>

        <div class="team-invite">
          <div>
            <label for="team-share-code" class="challenge-label">{{ t('challenge.student.team.inviteCode') }}</label>
            <p class="field-help">{{ t('challenge.student.team.inviteHelp') }}</p>
          </div>
          <div class="team-code-controls">
            <input id="team-share-code" :value="currentTeam.inviteCode" class="challenge-field code-input" dir="ltr" readonly @focus="($event.target as HTMLInputElement).select()">
            <button type="button" class="challenge-button-secondary team-code-copy" @click="copyCode">
              <AppIcon name="copy" class="w-4 h-4 shrink-0" />
              <span class="team-code-copy-label">{{ t('challenge.student.team.copy') }}</span>
            </button>
          </div>
        </div>

        <div v-if="roster.length < minMembers" class="team-notice" role="status">
          <AppIcon name="alert-triangle" class="w-5 h-5 shrink-0" />
          <div>
            <p class="notice-title">{{ t('challenge.student.team.shortfallTitle') }}</p>
            <p>{{ t('challenge.student.team.shortfall', { count: number(minMembers - roster.length), minimum: number(minMembers) }) }}</p>
          </div>
        </div>
        <p v-if="currentTeam.reviewNote" class="team-review-note">{{ currentTeam.reviewNote }}</p>

        <div class="roster-heading">
          <h3 class="subsection-title">{{ t('challenge.student.team.members') }}</h3>
          <span class="member-count">{{ t('challenge.student.team.memberCount', { count: number(roster.length), max: number(maxMembers) }) }}</span>
        </div>
        <ul class="team-roster">
          <li v-for="member in roster" :key="member.id" class="roster-row">
            <div class="member-identity">
              <span class="member-avatar" aria-hidden="true">{{ lt(member.name).trim().slice(0, 1) }}</span>
              <div>
                <p class="member-name">{{ lt(member.name) }} <span v-if="member.id === currentStudent.id" class="member-you">{{ t('challenge.student.team.you') }}</span></p>
                <p class="member-grade">{{ t('challenge.student.team.grade', { grade: number(member.grade) }) }}</p>
              </div>
            </div>
            <div class="member-detail">
              <ChallengeStatusPill v-if="member.id === currentTeam.leaderId" tone="brand">{{ t('challenge.student.team.leader') }}</ChallengeStatusPill>
              <span class="member-training">{{ t('challenge.student.team.trainingPercent', { percent: number(studentProgress(member.id), { maximumFractionDigits: 0 }) }) }}</span>
            </div>
          </li>
        </ul>

        <div class="team-readiness">
          <div class="readiness-heading">
            <h3 class="subsection-title">{{ t('challenge.student.team.readiness') }}</h3>
            <ChallengeStatusPill :tone="eligible ? 'success' : 'warning'">
              {{ t(eligible ? 'challenge.student.training.eligible' : 'challenge.student.training.ineligible') }}
            </ChallengeStatusPill>
          </div>
          <ChallengeProgress :value="teamTraining" :threshold="80" :label="t('challenge.student.team.teamAverage')" />
          <p class="field-help">{{ t('challenge.student.training.eligibilityHelp', { threshold: number(80), minimum: number(minMembers), maximum: number(maxMembers) }) }}</p>
        </div>
      </section>

      <section class="challenge-panel devlog-panel" aria-labelledby="devlog-title">
        <div class="devlog-heading">
          <h2 id="devlog-title" class="section-title">{{ t('challenge.student.team.devlog') }}</h2>
          <p class="field-help">{{ t('challenge.student.team.devlogHelp') }}</p>
        </div>
        <form class="devlog-form" @submit.prevent="submitDevlog">
          <label for="devlog-text" class="challenge-label">{{ t('challenge.student.team.devlogLabel') }}</label>
          <textarea id="devlog-text" v-model="devlogText" rows="3" maxlength="2000" class="challenge-field" :disabled="!canWriteDevlog" :aria-invalid="!!devlogError" :aria-describedby="devlogError ? 'devlog-error' : 'devlog-count'" @input="devlogError = ''" />
          <p v-if="devlogError" id="devlog-error" class="form-error" role="alert">{{ devlogError }}</p>
          <div class="devlog-form-footer">
            <span id="devlog-count" class="field-help">{{ t('challenge.student.team.characterCount', { count: number(devlogText.length), max: number(2000) }) }}</span>
            <button type="submit" class="challenge-button" :disabled="!canWriteDevlog || !devlogText.trim()">
              <AppIcon name="plus" class="w-4 h-4" />
              {{ t('challenge.student.team.addEntry') }}
            </button>
          </div>
          <p v-if="!canWriteDevlog" class="locked-action"><AppIcon name="lock" class="w-4 h-4" />{{ t('challenge.student.team.locked', { phase: t('challenge.phases.team_formation') }) }}</p>
        </form>

        <ol v-if="devlog.length" class="devlog-list">
          <li v-for="entry in devlog" :key="entry.id" class="devlog-entry">
            <div class="devlog-entry-meta">
              <span class="devlog-author">{{ authorName(entry.studentId) }}</span>
              <time :datetime="entry.createdAt">{{ date(entry.createdAt) }}</time>
            </div>
            <p class="devlog-body">{{ lt(entry.text) }}</p>
          </li>
        </ol>
        <ChallengeEmptyState v-else :title="t('challenge.student.team.emptyDevlogTitle')" :description="t('challenge.student.team.emptyDevlogDescription')" icon="pencil" />
      </section>
    </template>

    <section v-else class="challenge-panel team-onboarding" aria-labelledby="join-team-title">
      <div class="onboarding-intro">
        <h2 id="join-team-title" class="section-title">{{ t('challenge.student.team.noTeamTitle') }}</h2>
        <p class="field-help">{{ t('challenge.student.team.noTeamDescription', { minimum: number(minMembers), maximum: number(maxMembers) }) }}</p>
        <p v-if="school" class="onboarding-school">{{ lt(school.name) }}</p>
        <p v-if="!canChangeTeam" class="locked-action"><AppIcon name="lock" class="w-4 h-4" />{{ t('challenge.student.team.locked', { phase: t('challenge.phases.team_formation') }) }}</p>
      </div>

      <form class="join-form" @submit.prevent="submitJoin">
        <h3 class="subsection-title">{{ t('challenge.student.team.joinTitle') }}</h3>
        <label for="team-invite-code" class="challenge-label">{{ t('challenge.student.team.codeLabel') }}</label>
        <div class="join-controls">
          <input id="team-invite-code" :value="inviteCode" dir="ltr" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" maxlength="6" pattern="[A-Z]{6}" class="challenge-field code-input" :disabled="!canChangeTeam" :aria-invalid="!!joinError" :aria-describedby="joinError ? 'join-error' : 'join-code-help'" @input="normalizeCode">
          <button type="submit" class="challenge-button" :disabled="!canChangeTeam || inviteCode.length !== 6">{{ t('challenge.student.team.join') }}</button>
        </div>
        <p id="join-code-help" class="field-help">{{ t('challenge.student.team.codeHelp') }}</p>
        <p v-if="joinError" id="join-error" class="form-error" role="alert">{{ joinError }}</p>
      </form>

      <form class="create-form" @submit.prevent="submitCreate">
        <h3 class="subsection-title">{{ t('challenge.student.team.createTitle') }}</h3>
        <p class="field-help">{{ t('challenge.student.team.createHelp') }}</p>
        <div class="create-fields">
          <div>
            <label for="new-team-name" class="challenge-label">{{ t('challenge.student.team.nameLabel') }}</label>
            <input id="new-team-name" v-model="teamName" type="text" maxlength="80" minlength="2" class="challenge-field" :disabled="!canChangeTeam" :aria-invalid="!!createError" :aria-describedby="createError ? 'create-error' : undefined" @input="createError = ''">
          </div>
          <div>
            <label for="new-team-age" class="challenge-label">{{ t('challenge.student.team.ageLabel') }}</label>
            <select id="new-team-age" v-model="ageCategory" class="challenge-field" :disabled="!canChangeTeam">
              <option value="12-14">{{ t('challenge.student.team.ageCategory', { range: ageRange('12–14') }) }}</option>
              <option value="15-18">{{ t('challenge.student.team.ageCategory', { range: ageRange('15–18') }) }}</option>
            </select>
          </div>
        </div>
        <p v-if="createError" id="create-error" class="form-error" role="alert">{{ createError }}</p>
        <button type="submit" class="challenge-button-secondary" :disabled="!canChangeTeam || teamName.trim().length < 2"><AppIcon name="plus" class="w-4 h-4" />{{ t('challenge.student.team.create') }}</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.team-page-header, .team-overview-heading, .roster-heading, .readiness-heading, .devlog-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.team-page-header { flex-wrap: wrap; margin-block-end: 1.75rem; }
.section-title { color: #010028; font-size: 1.35rem; line-height: 1.4; font-weight: 800; overflow-wrap: anywhere; }
.subsection-title { color: #010028; font-size: 1rem; font-weight: 700; line-height: 1.5; }
.field-help { color: #010028b3; font-size: .8125rem; line-height: 1.7; }
.team-overview, .devlog-panel, .team-onboarding { padding: clamp(1.25rem, 3vw, 2rem); }
.team-overview-heading { align-items: flex-start; flex-wrap: wrap; }
.team-meta { display: flex; flex-wrap: wrap; gap: .25rem 1rem; color: #010028b3; margin-block-start: .4rem; font-size: .875rem; }
.team-statuses { display: flex; flex-wrap: wrap; gap: .5rem; }
.team-invite { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-block: 1.5rem; margin-block-start: .5rem; }
.team-code-controls, .join-controls { display: flex; align-items: stretch; gap: .6rem; }
.team-code-controls .team-code-copy { flex-shrink: 0; min-inline-size: 7rem; font-size: 1rem; }
.team-code-copy-label { white-space: nowrap; line-height: 1.4; text-align: center; }
.code-input { inline-size: 10rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: .12em; }
.team-notice { display: flex; gap: .75rem; color: #5B3FD9; background: #8062fd0d; border-radius: .75rem; padding: 1rem; font-size: .875rem; line-height: 1.7; }
.notice-title { font-weight: 700; }
.team-review-note { color: #010028cc; font-size: .875rem; padding-block: .75rem; white-space: pre-wrap; }
.roster-heading { margin-block: 1.5rem .6rem; }
.member-count { color: #010028b3; font-size: .8125rem; font-variant-numeric: tabular-nums; }
.team-roster { list-style: none; padding: 0; }
.roster-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-block: .9rem; border-block-end: 1px solid #0100280d; }
.member-identity { display: flex; align-items: center; gap: .75rem; min-inline-size: 0; }
.member-avatar { display: inline-flex; align-items: center; justify-content: center; inline-size: 2.5rem; block-size: 2.5rem; flex-shrink: 0; border-radius: .75rem; background: #8062fd12; color: #5B3FD9; font-size: 1rem; font-weight: 700; }
.member-name { color: #010028; font-size: .9375rem; font-weight: 600; overflow-wrap: anywhere; }
.member-you, .member-grade { color: #010028b3; font-size: .75rem; font-weight: 500; }
.member-grade { margin-block-start: .2rem; }
.member-detail { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: .5rem .75rem; }
.member-training { color: #010028b3; font-size: .75rem; font-variant-numeric: tabular-nums; }
.team-readiness { margin-block-start: 1.5rem; }
.readiness-heading { margin-block-end: .85rem; flex-wrap: wrap; }
.team-readiness > .field-help { margin-block-start: .75rem; }
.devlog-panel { margin-block-start: 1.75rem; }
.devlog-heading { margin-block-end: 1rem; }
.devlog-heading .field-help { margin-block-start: .3rem; }
.devlog-form textarea { resize: vertical; min-block-size: 6.5rem; }
.devlog-form-footer { margin-block-start: .75rem; }
.devlog-list { padding: 0; margin-block-start: 1.75rem; list-style: none; }
.devlog-entry { padding-block: 1rem; border-block-start: 1px solid #0100280d; }
.devlog-entry-meta { display: flex; justify-content: space-between; gap: .75rem; flex-wrap: wrap; color: #010028b3; font-size: .75rem; }
.devlog-author { color: #010028; font-weight: 700; }
.devlog-body { color: #010028cc; font-size: .875rem; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; max-inline-size: 75ch; margin-block-start: .6rem; }
.locked-action { display: flex; align-items: center; gap: .5rem; color: #010028b3; font-size: .8125rem; line-height: 1.7; margin-block-start: .7rem; }
.form-error { color: #b91c1c; font-size: .8125rem; line-height: 1.6; margin-block-start: .5rem; }
.team-onboarding { max-inline-size: 58rem; }
.onboarding-intro .field-help { margin-block-start: .5rem; max-inline-size: 65ch; }
.onboarding-school { color: #5B3FD9; font-size: .875rem; font-weight: 600; margin-block-start: .75rem; }
.join-form { margin-block-start: 1.75rem; }
.join-form .challenge-label { margin-block-start: 1rem; }
.join-form .field-help { margin-block-start: .5rem; }
.create-form { margin-block-start: 2rem; padding-block-start: 1.75rem; border-block-start: 1px solid #01002812; }
.create-form > .field-help { margin-block-start: .4rem; }
.create-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(10rem, .5fr); gap: 1rem; margin-block: 1rem; }
@media (max-width: 640px) {
  .team-invite { align-items: flex-start; flex-direction: column; }
  .team-code-controls { inline-size: 100%; }
  .team-code-controls .code-input { flex: 1; min-inline-size: 0; }
  .roster-row { align-items: flex-start; gap: .75rem; }
  .member-detail { flex-direction: column; align-items: flex-end; }
  .member-training { text-align: end; max-inline-size: 8rem; }
  .create-fields { grid-template-columns: minmax(0, 1fr); }
  .join-controls .code-input { flex: 1; min-inline-size: 0; }
  .devlog-form-footer { align-items: flex-start; flex-direction: column; }
}
</style>
