<script setup lang="ts">
import type { SubmissionContent } from '~/types/challenge'

definePageMeta({ layout: 'challenge' })
const { t } = useI18n()
const localePath = useLocalePath()
const { lt, number, date } = useChallengeFormat()
const toast = useChallengeToast()
const {
  state, currentStudent, currentTeam, currentSubmission, submissionGate,
  teamProgress, teamEligible, saveSubmissionVersion, submitSubmission, lockSubmission,
} = useChallenge()
useHead(() => ({
  title: `${t('challenge.student.submission.title')} - Gaming Lab`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}))

const blankContent = (): SubmissionContent => ({
  title: { en: '', ar: '' }, description: { en: '', ar: '' },
  genre: 'puzzle', platform: 'web', buildUrl: '', packageUrl: '', repositoryUrl: '',
  gddUrl: '', presentationUrl: '', coverUrl: '', trailerUrl: '', screenshotUrls: [],
})
const cloneContent = (content: SubmissionContent): SubmissionContent => JSON.parse(JSON.stringify(content))
const draft = ref<SubmissionContent>(blankContent())
const compareOpen = ref(false)
const lockOpen = ref(false)
const now = ref(Date.now())
let deadlineTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => { deadlineTimer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (deadlineTimer) clearInterval(deadlineTimer) })

function refreshDraft() {
  draft.value = cloneContent(currentSubmission.value?.content || blankContent())
  compareOpen.value = false
  lockOpen.value = false
}
// Refresh for a new persona, a team change, or a reset. Ordinary state mutations
// and every keystroke keep the student's unfinished form intact.
watch([() => state.value, () => currentStudent.value?.id, () => currentTeam.value?.id], refreshDraft, { immediate: true })
const versions = computed(() => currentSubmission.value?.versions || [])
const newestVersion = computed(() => versions.value.at(-1))
const progress = computed(() => currentTeam.value ? teamProgress(currentTeam.value) : 0)
const eligible = computed(() => Boolean(currentTeam.value && teamEligible(currentTeam.value)))
const isLeader = computed(() => currentTeam.value?.leaderId === currentStudent.value?.id)
const isLocked = computed(() => currentSubmission.value?.status === 'locked')
const isSubmitted = computed(() => currentSubmission.value?.status === 'submitted')
const deadlineExpired = computed(() => {
  const deadline = state.value?.competition.submissionDeadline
  return Boolean(deadline && now.value >= new Date(deadline).getTime())
})
const canEdit = computed(() => submissionGate.value.allowed && !isLocked.value && !deadlineExpired.value)
const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(currentSubmission.value?.content || blankContent()))
const canLock = computed(() => canEdit.value && isSubmitted.value && !dirty.value)
const blockedReason = computed(() => {
  if (isLocked.value) return t('challenge.student.submission.lockedHint')
  if (deadlineExpired.value) return t('challenge.student.submission.deadlineClosed')
  return submissionGate.value.allowed ? '' : t(submissionGate.value.errorKey || 'challenge.student.submission.unavailable')
})
const statusLabel = computed(() => t(`challenge.student.submission.status.${currentSubmission.value?.status || 'draft'}`))
const nextVersion = computed(() => `1.${versions.value.length}`)
const requiredComplete = computed(() => Boolean(
  draft.value.title.en.trim() && draft.value.title.ar.trim()
  && draft.value.description.en.trim() && draft.value.description.ar.trim()
  && draft.value.buildUrl.trim() && draft.value.gddUrl.trim() && draft.value.presentationUrl.trim(),
))

function saveVersion() {
  const action = saveSubmissionVersion(cloneContent(draft.value))
  if (toast.result(action, 'challenge.student.submission.toasts.versionSaved')) {
    draft.value = cloneContent(currentSubmission.value?.content || draft.value)
  }
}
function submit() {
  if (dirty.value || !currentSubmission.value) {
    const saved = saveSubmissionVersion(cloneContent(draft.value))
    if (!saved.ok) { toast.result(saved); return }
    draft.value = cloneContent(currentSubmission.value?.content || draft.value)
  }
  toast.result(submitSubmission(), 'challenge.student.submission.toasts.submitted')
}
function finalLock() {
  toast.result(lockSubmission(), 'challenge.student.submission.toasts.locked')
}
</script>

<template>
  <div class="challenge-page submission-page">
    <header class="submission-heading-row">
      <div>
        <h1 class="challenge-heading">{{ t('challenge.student.submission.title') }}</h1>
        <p class="challenge-subtitle">{{ t('challenge.student.submission.subtitle') }}</p>
      </div>
      <ChallengeStatusPill v-if="currentTeam" :tone="isLocked ? 'success' : isSubmitted ? 'brand' : 'neutral'">{{ statusLabel }}</ChallengeStatusPill>
    </header>

    <template v-if="currentTeam && state">
      <section class="challenge-panel submission-readiness" :aria-label="t('challenge.student.submission.readiness')">
        <div class="submission-team-readiness">
          <div class="submission-team-title">
            <h2>{{ lt(currentTeam.name) }}</h2>
            <ChallengeStatusPill :tone="isLeader ? 'brand' : 'neutral'">{{ t(isLeader ? 'challenge.student.submission.teamLeader' : 'challenge.student.submission.teamMember') }}</ChallengeStatusPill>
          </div>
          <ChallengeProgress :value="progress" :threshold="state.competition.trainingThreshold" :label="t('challenge.student.submission.teamTraining')" />
          <div class="submission-readiness-detail">
            <span :class="eligible ? 'text-accent-deep' : 'text-heading'">{{ t(eligible ? 'challenge.student.submission.eligible' : 'challenge.student.submission.ineligible', { threshold: number(state.competition.trainingThreshold) }) }}</span>
            <NuxtLink :to="localePath('/challenge/student/training')">{{ t('challenge.student.submission.viewTraining') }}<AppIcon name="arrow-right" class="w-4 h-4 rtl:-scale-x-100" /></NuxtLink>
          </div>
        </div>
        <div class="submission-deadline">
          <p>{{ t('challenge.student.submission.deadline') }}</p>
          <strong>{{ date(state.competition.submissionDeadline, { dateStyle: 'medium', timeStyle: 'short' }) }}</strong>
          <ChallengeCountdown :deadline="state.competition.submissionDeadline" />
        </div>
      </section>

      <div v-if="blockedReason" id="submission-blocked-reason" class="submission-notice" role="status">
        <AppIcon :name="isLocked ? 'lock' : 'info'" class="w-5 h-5 shrink-0" />
        <p>{{ blockedReason }}</p>
      </div>
      <div v-else-if="isSubmitted" class="submission-notice submission-notice-success" role="status">
        <AppIcon name="check-circle" class="w-5 h-5 shrink-0" />
        <p>{{ t('challenge.student.submission.submittedHint') }}</p>
      </div>

      <section class="challenge-panel submission-editor" :aria-label="t('challenge.student.submission.editor')">
        <div class="submission-editor-heading">
          <h2>{{ t('challenge.student.submission.projectDetails') }}</h2>
          <span v-if="dirty" class="submission-unsaved">{{ t('challenge.student.submission.unsaved') }}</span>
          <span v-else-if="newestVersion" class="submission-saved-version">{{ t('challenge.student.submission.savedVersion', { version: newestVersion.label }) }}</span>
        </div>
        <ChallengeSubmissionForm v-model="draft" :disabled="!canEdit" />
        <div class="submission-actions">
          <div class="submission-action-description">
            <p>{{ t('challenge.student.submission.requiredHint') }}</p>
            <span v-if="!requiredComplete && canEdit">{{ t('challenge.student.submission.draftHint') }}</span>
            <span v-else-if="dirty && isSubmitted">{{ t('challenge.student.submission.resubmitHint') }}</span>
          </div>
          <div class="submission-action-buttons">
            <button type="button" class="challenge-button-secondary" :disabled="!canEdit" :aria-describedby="blockedReason ? 'submission-blocked-reason' : undefined" @click="saveVersion">
              <AppIcon name="archive" class="w-4 h-4" />{{ t('challenge.student.submission.saveVersion', { version: nextVersion }) }}
            </button>
            <button type="button" class="challenge-button" :disabled="!canEdit || (isSubmitted && !dirty)" :aria-describedby="blockedReason ? 'submission-blocked-reason' : undefined" @click="submit">
              <AppIcon name="paper-plane" class="w-4 h-4" />{{ t('challenge.student.submission.submit') }}
            </button>
          </div>
        </div>
      </section>

      <section class="challenge-panel submission-versions" :aria-labelledby="'submission-versions-heading'">
        <div class="submission-section-heading">
          <div>
            <h2 id="submission-versions-heading">{{ t('challenge.student.submission.versions') }}</h2>
            <p>{{ t('challenge.student.submission.versionsHint') }}</p>
          </div>
          <button type="button" class="challenge-button-secondary" :disabled="versions.length < 2" :title="versions.length < 2 ? t('challenge.student.submission.compareNeedsVersionsHint') : undefined" @click="compareOpen = true">
            <AppIcon name="history" class="w-4 h-4" />{{ t('challenge.student.submission.compare') }}
          </button>
        </div>
        <ol v-if="versions.length" class="submission-version-list">
          <li v-for="version in [...versions].reverse()" :key="version.id">
            <div class="submission-version-identity">
              <strong>{{ t('challenge.student.submission.versionLabel', { version: version.label }) }}</strong>
              <span>{{ lt(version.content.title) || t('challenge.student.submission.untitled') }}</span>
            </div>
            <div class="submission-version-meta">
              <ChallengeStatusPill v-if="version.id === newestVersion?.id" tone="brand">{{ t('challenge.student.submission.latest') }}</ChallengeStatusPill>
              <time :datetime="version.savedAt">{{ date(version.savedAt, { dateStyle: 'medium', timeStyle: 'short' }) }}</time>
            </div>
          </li>
        </ol>
        <ChallengeEmptyState v-else :title="t('challenge.student.submission.noVersions')" :description="t('challenge.student.submission.noVersionsHint')" icon="archive" />
      </section>

      <section class="submission-final-lock" :aria-labelledby="'submission-lock-heading'">
        <div>
          <h2 id="submission-lock-heading">{{ t('challenge.student.submission.finalLock') }}</h2>
          <p>{{ isLocked ? t('challenge.student.submission.lockedAt', { date: date(currentSubmission?.lockedAt, { dateStyle: 'medium', timeStyle: 'short' }) }) : t('challenge.student.submission.finalLockHint') }}</p>
          <p v-if="!isLocked && !isSubmitted" id="submission-lock-reason" class="submission-lock-reason">{{ t('challenge.student.submission.submitBeforeLock') }}</p>
          <p v-else-if="!isLocked && dirty" id="submission-lock-reason" class="submission-lock-reason">{{ t('challenge.student.submission.resubmitBeforeLock') }}</p>
        </div>
        <button type="button" class="challenge-button-secondary" :disabled="!canLock" :aria-describedby="blockedReason ? 'submission-blocked-reason' : !canLock && !isLocked ? 'submission-lock-reason' : undefined" @click="lockOpen = true">
          <AppIcon name="lock" class="w-4 h-4" />{{ t(isLocked ? 'challenge.student.submission.lockedButton' : 'challenge.student.submission.lockButton') }}
        </button>
      </section>
      <ChallengeVersionCompare v-model="compareOpen" :versions="versions" />
      <ChallengeConfirm v-model="lockOpen" :title="t('challenge.student.submission.lockConfirmTitle')" :message="t('challenge.student.submission.lockConfirmMessage')" :confirm-label="t('challenge.student.submission.lockButton')" @confirm="finalLock" />
    </template>

    <section v-else class="challenge-panel">
      <ChallengeEmptyState :title="t('challenge.student.submission.noTeam')" :description="t('challenge.student.submission.noTeamHint')" icon="users" />
      <NuxtLink :to="localePath('/challenge/student')" class="challenge-button submission-empty-action">{{ t('challenge.student.submission.joinTeam') }}<AppIcon name="arrow-right" class="w-4 h-4 rtl:-scale-x-100" /></NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.submission-page { display: grid; gap: 1.5rem; }
.submission-heading-row, .submission-team-title, .submission-editor-heading, .submission-section-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem 1.25rem; }
.submission-readiness { display: grid; gap: 1.5rem; }
.submission-team-readiness { min-width: 0; }
.submission-team-title { margin-block-end: 1rem; justify-content: flex-start; }
.submission-team-title h2, .submission-editor-heading h2, .submission-section-heading h2, .submission-final-lock h2 { color: #010028; font-weight: 600; font-size: 1.125rem; line-height: 1.5; }
.submission-readiness-detail { display: flex; justify-content: space-between; flex-wrap: wrap; gap: .75rem; margin-block-start: .75rem; font-size: .8125rem; }
.submission-readiness-detail a { display: inline-flex; align-items: center; gap: .375rem; color: #5B3FD9; font-weight: 600; text-underline-offset: 3px; }
.submission-readiness-detail a:hover { text-decoration: underline; }
.submission-readiness-detail a:focus-visible { outline: 2px solid #8062FD; outline-offset: 4px; border-radius: .25rem; }
.submission-deadline { display: grid; gap: .5rem; padding-block-start: 1.25rem; border-block-start: 1px solid #01002814; }
.submission-deadline > p { color: #010028b3; font-size: .8125rem; }
.submission-deadline > strong { color: #010028; font-size: .875rem; font-weight: 600; }
.submission-notice { display: flex; align-items: flex-start; gap: .75rem; padding: 1rem 1.25rem; border-radius: .75rem; background: #8062FD10; color: #5B3FD9; font-size: .875rem; line-height: 1.75; }
.submission-notice-success { background: #5FCC7B18; color: #027231; }
.submission-editor-heading { margin-block-end: 1.5rem; }
.submission-unsaved { color: #5B3FD9; font-size: .8125rem; font-weight: 600; }
.submission-saved-version { color: #010028b3; font-size: .8125rem; }
.submission-actions { display: flex; justify-content: space-between; gap: 1.25rem; flex-wrap: wrap; align-items: center; padding-block-start: 1.5rem; margin-block-start: 1.75rem; border-block-start: 1px solid #01002814; }
.submission-action-description { max-width: 48ch; font-size: .75rem; line-height: 1.75; color: #010028b3; }
.submission-action-description span { display: block; margin-block-start: .25rem; color: #5B3FD9; }
.submission-action-buttons { display: flex; flex-wrap: wrap; gap: .75rem; }
.submission-section-heading > div > p { color: #010028b3; font-size: .8125rem; line-height: 1.75; margin-block-start: .375rem; max-width: 65ch; }
.submission-version-list { margin-block-start: 1.5rem; }
.submission-version-list li { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; padding-block: 1rem; border-block-start: 1px solid #01002814; }
.submission-version-identity { display: grid; gap: .25rem; min-width: 0; }
.submission-version-identity strong { color: #010028; font-size: .875rem; font-weight: 600; }
.submission-version-identity span { color: #010028b3; font-size: .8125rem; overflow-wrap: anywhere; }
.submission-version-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; }
.submission-version-meta time { color: #010028b3; font-size: .75rem; font-variant-numeric: tabular-nums; }
.submission-final-lock { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem; padding: .5rem .25rem; }
.submission-final-lock p { color: #010028b3; font-size: .8125rem; line-height: 1.75; margin-block-start: .5rem; max-width: 68ch; }
.submission-final-lock .submission-lock-reason { color: #5B3FD9; }
.submission-empty-action { display: flex; width: fit-content; margin-inline: auto; margin-block: .75rem 0; }
@media (min-width: 1024px) {
  .submission-readiness { grid-template-columns: minmax(0, 1fr) minmax(260px, .7fr); gap: 2rem; align-items: center; }
  .submission-deadline { border-block-start: 0; border-inline-start: 1px solid #01002814; padding-block-start: 0; padding-inline-start: 2rem; }
}
@media (max-width: 480px) {
  .submission-action-buttons { width: 100%; }
  .submission-action-buttons button, .submission-final-lock button { width: 100%; justify-content: center; }
}
</style>
