<script setup lang="ts">
definePageMeta({ layout: 'challenge' })

const { t } = useI18n()
const localePath = useLocalePath()
const { lt, number, date } = useChallengeFormat()
const toast = useChallengeToast()
const {
  state, currentStudent, currentTeam, studentProgress, teamProgress,
  teamEligible, markAttendance, markAssignment,
} = useChallenge()

useHead({
  title: () => `${t('challenge.student.training.title')} - Gaming Lab`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const quizOpen = ref(false)
const course = computed(() => state.value?.course)
const phase = computed(() => state.value?.competition.phase)
const canTrain = computed(() => ['training', 'submission'].includes(phase.value ?? '') && !!currentStudent.value && !!currentTeam.value)
const trainingLockMessage = computed(() => !currentTeam.value
  ? t('challenge.student.training.teamRequired')
  : t('challenge.student.training.locked', { phase: t('challenge.phases.training') }))
const progress = computed(() => state.value?.trainingProgress.find(item => item.studentId === currentStudent.value?.id))
const completion = computed(() => currentStudent.value ? studentProgress(currentStudent.value.id) : 0)
const totalSessions = computed(() => course.value?.sessions.length ?? 0)
const attendanceCount = computed(() => course.value?.sessions.filter(session => progress.value?.attendedSessionIds.includes(session.id)).length ?? 0)
const assignmentCount = computed(() => course.value?.sessions.filter(session => progress.value?.completedAssignmentIds.includes(session.id)).length ?? 0)
const attendanceContribution = computed(() => totalSessions.value ? attendanceCount.value / totalSessions.value * 40 : 0)
const assignmentContribution = computed(() => totalSessions.value ? assignmentCount.value / totalSessions.value * 30 : 0)
const quizContribution = computed(() => (progress.value?.quizScore ?? 0) * .3)
const teamCompletion = computed(() => currentTeam.value ? teamProgress(currentTeam.value) : 0)
const eligible = computed(() => currentTeam.value ? teamEligible(currentTeam.value) : false)
const members = computed(() => currentTeam.value
  ? (state.value?.students ?? []).filter(student => currentTeam.value!.memberIds.includes(student.id))
  : [])
const minMembers = computed(() => state.value?.competition.minTeamMembers ?? 3)
const maxMembers = computed(() => state.value?.competition.maxTeamMembers ?? 5)

watch(() => currentStudent.value?.id, () => { quizOpen.value = false })

function attended(id: string) { return progress.value?.attendedSessionIds.includes(id) ?? false }
function assignmentDone(id: string) { return progress.value?.completedAssignmentIds.includes(id) ?? false }
function recordAttendance(id: string) { toast.result(markAttendance(id), 'challenge.student.toasts.attendanceSaved') }
function completeAssignment(id: string) { toast.result(markAssignment(id), 'challenge.student.toasts.assignmentSaved') }
function percentage(value: number) { return number(value, { maximumFractionDigits: 1 }) }
</script>

<template>
  <div class="challenge-page student-training">
    <header class="training-page-header">
      <div>
        <h1 class="challenge-heading">{{ t('challenge.student.training.title') }}</h1>
        <p class="challenge-subtitle">{{ t('challenge.student.training.subtitle') }}</p>
      </div>
    </header>

    <ChallengeEmptyState
      v-if="!currentStudent"
      :title="t('challenge.student.team.noStudentTitle')"
      :description="t('challenge.student.team.noStudentDescription')"
      icon="users"
    />

    <template v-else>
      <section class="challenge-panel training-progress" aria-labelledby="personal-progress-title">
        <div class="progress-heading">
          <div>
            <h2 id="personal-progress-title" class="section-title">{{ t('challenge.student.training.personalProgress') }}</h2>
            <p class="field-help">{{ lt(currentStudent.name) }}</p>
          </div>
          <ChallengeStatusPill :tone="completion >= 80 ? 'success' : 'brand'">
            {{ t(completion >= 80 ? 'challenge.student.training.thresholdMet' : 'challenge.student.training.inProgress') }}
          </ChallengeStatusPill>
        </div>
        <ChallengeProgress :value="completion" :threshold="80" :label="t('challenge.student.training.completion')" />
        <p class="progress-explanation">{{ t('challenge.student.training.weightExplanation') }}</p>

        <dl class="progress-breakdown">
          <div class="breakdown-item">
            <dt>{{ t('challenge.student.training.attendanceWeight') }}</dt>
            <dd>{{ t('challenge.student.training.sessionCount', { count: number(attendanceCount), total: number(totalSessions) }) }}</dd>
            <dd class="breakdown-contribution">{{ t('challenge.student.training.contribution', { value: percentage(attendanceContribution), max: number(40) }) }}</dd>
          </div>
          <div class="breakdown-item">
            <dt>{{ t('challenge.student.training.assignmentWeight') }}</dt>
            <dd>{{ t('challenge.student.training.assignmentCount', { count: number(assignmentCount), total: number(totalSessions) }) }}</dd>
            <dd class="breakdown-contribution">{{ t('challenge.student.training.contribution', { value: percentage(assignmentContribution), max: number(30) }) }}</dd>
          </div>
          <div class="breakdown-item">
            <dt>{{ t('challenge.student.training.quizWeight') }}</dt>
            <dd>{{ progress?.quizScore == null ? t('challenge.student.training.quizNotTaken') : t('challenge.student.training.quizScore', { score: percentage(progress.quizScore) }) }}</dd>
            <dd class="breakdown-contribution">{{ t('challenge.student.training.contribution', { value: percentage(quizContribution), max: number(30) }) }}</dd>
          </div>
        </dl>
        <p v-if="phase === 'submission'" class="training-catchup"><AppIcon name="info" class="w-4 h-4 shrink-0" />{{ t('challenge.student.training.catchUp') }}</p>
        <p v-if="!canTrain" class="locked-action"><AppIcon name="lock" class="w-4 h-4" />{{ trainingLockMessage }}</p>
      </section>

      <div class="training-workspace">
        <section class="challenge-panel session-panel" aria-labelledby="sessions-title">
          <div class="course-intro">
            <h2 id="sessions-title" class="section-title">{{ course ? lt(course.title) : t('challenge.student.training.sessions') }}</h2>
            <p v-if="course" class="field-help">{{ lt(course.description) }}</p>
            <p class="field-help">{{ t('challenge.student.training.attendanceFirst') }}</p>
            <p class="session-total">{{ t('challenge.student.training.sevenSessions', { count: number(totalSessions) }) }}</p>
          </div>

          <ol v-if="course?.sessions.length" class="session-list">
            <li v-for="(session, index) in course.sessions" :key="session.id" class="session-row">
              <span class="session-number" aria-hidden="true">{{ number(index + 1) }}</span>
              <div class="session-content">
                <div class="session-heading">
                  <h3 class="subsection-title">{{ lt(session.title) }}</h3>
                  <ChallengeStatusPill :tone="session.mode === 'live' ? 'brand' : 'neutral'">{{ t(`challenge.sessionModes.${session.mode}`) }}</ChallengeStatusPill>
                </div>
                <p class="session-time">
                  <time :datetime="session.startsAt">{{ date(session.startsAt, { dateStyle: 'medium', timeStyle: 'short' }) }}</time>
                  <span>{{ t('challenge.student.training.duration', { minutes: number(session.durationMinutes) }) }}</span>
                </p>
                <p class="session-description">{{ lt(session.description) }}</p>
                <p class="session-assignment"><strong>{{ t('challenge.student.training.assignment') }}</strong> {{ lt(session.assignment) }}</p>
                <div class="session-actions">
                  <button type="button" class="challenge-button-secondary" :class="{ 'action-complete': attended(session.id) }" :disabled="!canTrain || attended(session.id)" :aria-label="t(attended(session.id) ? 'challenge.student.training.attendanceCompleteLabel' : 'challenge.student.training.attendanceActionLabel', { session: lt(session.title) })" @click="recordAttendance(session.id)">
                    <AppIcon :name="attended(session.id) ? 'check-circle' : 'calendar'" class="w-4 h-4" />
                    {{ t(attended(session.id) ? 'challenge.student.training.attended' : 'challenge.student.training.markAttendance') }}
                  </button>
                  <button type="button" class="challenge-button-secondary" :class="{ 'action-complete': assignmentDone(session.id) }" :disabled="!canTrain || !attended(session.id) || assignmentDone(session.id)" :aria-label="t(assignmentDone(session.id) ? 'challenge.student.training.assignmentCompleteLabel' : 'challenge.student.training.assignmentActionLabel', { session: lt(session.title) })" @click="completeAssignment(session.id)">
                    <AppIcon :name="assignmentDone(session.id) ? 'check-circle' : 'document-text'" class="w-4 h-4" />
                    {{ t(assignmentDone(session.id) ? 'challenge.student.training.assignmentDone' : 'challenge.student.training.markAssignment') }}
                  </button>
                  <a v-if="safeUrl(session.resourceUrl)" :href="safeUrl(session.resourceUrl)" target="_blank" rel="noopener noreferrer" class="session-resource">
                    {{ t('challenge.student.training.resource') }}<AppIcon name="external-link" class="w-4 h-4" />
                  </a>
                </div>
              </div>
            </li>
          </ol>
          <ChallengeEmptyState v-else :title="t('challenge.student.training.noSessionsTitle')" :description="t('challenge.student.training.noSessionsDescription')" icon="book-open" />
        </section>

        <aside class="training-sidebar">
          <section class="challenge-panel quiz-panel" aria-labelledby="quiz-title">
            <AppIcon name="clipboard" class="quiz-panel-icon w-7 h-7" />
            <h2 id="quiz-title" class="section-title">{{ t('challenge.student.training.quizTitle') }}</h2>
            <p class="field-help">{{ t('challenge.student.training.quizDescription', { count: number(course?.quizQuestions.length ?? 0) }) }}</p>
            <p v-if="progress?.quizScore != null" class="quiz-existing-score">{{ t('challenge.student.training.quizScore', { score: percentage(progress.quizScore) }) }}</p>
            <p v-if="progress?.quizSubmittedAt" class="quiz-existing-date">{{ t('challenge.student.training.lastAttempt', { date: date(progress.quizSubmittedAt) }) }}</p>
            <button type="button" class="challenge-button quiz-start" :disabled="!canTrain || !course?.quizQuestions.length" @click="quizOpen = true">
              {{ t(progress?.quizScore == null ? 'challenge.student.training.startQuiz' : 'challenge.student.training.retakeQuiz') }}
              <AppIcon name="arrow-right" class="w-4 h-4 rtl:-scale-x-100" />
            </button>
            <p v-if="!canTrain" class="locked-action"><AppIcon name="lock" class="w-4 h-4" />{{ trainingLockMessage }}</p>
          </section>

          <section class="challenge-panel team-progress-panel" aria-labelledby="team-progress-title">
            <h2 id="team-progress-title" class="section-title">{{ t('challenge.student.training.teamProgress') }}</h2>
            <template v-if="currentTeam">
              <p class="field-help team-name">{{ lt(currentTeam.name) }}</p>
              <ChallengeProgress :value="teamCompletion" :threshold="80" :label="t('challenge.student.team.teamAverage')" />
              <div class="team-eligibility">
                <ChallengeStatusPill :tone="eligible ? 'success' : 'warning'">{{ t(eligible ? 'challenge.student.training.eligible' : 'challenge.student.training.ineligible') }}</ChallengeStatusPill>
                <p class="field-help">{{ t('challenge.student.training.eligibilityHelp', { threshold: number(80), minimum: number(minMembers), maximum: number(maxMembers) }) }}</p>
              </div>
              <ul class="team-progress-members">
                <li v-for="member in members" :key="member.id">
                  <span>{{ lt(member.name) }}</span>
                  <strong :class="{ 'member-ready': studentProgress(member.id) >= 80 }">{{ t('challenge.student.training.percent', { value: percentage(studentProgress(member.id)) }) }}</strong>
                </li>
              </ul>
              <NuxtLink :to="localePath('/challenge/student/submission')" class="submission-link">{{ t('challenge.student.training.openSubmission') }}<AppIcon name="arrow-right" class="w-4 h-4 rtl:-scale-x-100" /></NuxtLink>
            </template>
            <template v-else>
              <p class="field-help no-team-help">{{ t('challenge.student.training.noTeam') }}</p>
              <NuxtLink :to="localePath('/challenge/student')" class="submission-link">{{ t('challenge.student.training.joinTeam') }}<AppIcon name="arrow-right" class="w-4 h-4 rtl:-scale-x-100" /></NuxtLink>
            </template>
          </section>
        </aside>
      </div>
      <ChallengeQuizModal v-model="quizOpen" />
    </template>
  </div>
</template>

<style scoped>
.training-page-header, .progress-heading, .session-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.training-page-header { margin-block-end: 1.75rem; }
.section-title { color: #010028; font-size: 1.25rem; line-height: 1.45; font-weight: 800; text-wrap: balance; }
.subsection-title { color: #010028; font-size: .9375rem; font-weight: 700; line-height: 1.6; }
.field-help { color: #010028b3; font-size: .8125rem; line-height: 1.8; }
.training-progress { padding: clamp(1.25rem, 3vw, 2rem); }
.progress-heading { margin-block-end: 1.25rem; }
.progress-heading .field-help { margin-block-start: .25rem; }
.progress-explanation { color: #010028b3; font-size: .8125rem; line-height: 1.8; margin-block-start: .85rem; }
.progress-breakdown { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; margin-block-start: 1.25rem; padding-block-start: 1.25rem; border-block-start: 1px solid #01002812; }
.breakdown-item dt { color: #010028; font-size: .8125rem; font-weight: 700; }
.breakdown-item dd { color: #010028cc; margin-block-start: .5rem; font-size: .875rem; font-weight: 500; }
.breakdown-item .breakdown-contribution { color: #010028b3; margin-block-start: .3rem; font-size: .75rem; }
.breakdown-item dd { font-variant-numeric: tabular-nums; }
.training-catchup { display: flex; align-items: flex-start; gap: .5rem; color: #5B3FD9; font-size: .8125rem; line-height: 1.8; margin-block-start: 1.25rem; }
.training-catchup svg { margin-block-start: .2rem; }
.locked-action { display: flex; align-items: center; gap: .5rem; color: #010028b3; font-size: .8125rem; line-height: 1.7; margin-block-start: 1rem; }
.training-workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(15rem, .4fr); align-items: start; gap: 1.5rem; margin-block-start: 1.75rem; }
.session-panel { padding: clamp(1.25rem, 2.5vw, 1.75rem); }
.course-intro .field-help { margin-block-start: .5rem; max-inline-size: 65ch; }
.session-total { color: #5B3FD9; font-size: .75rem; font-weight: 700; margin-block-start: .75rem; }
.session-list { list-style: none; padding: 0; margin-block-start: 1rem; }
.session-row { display: flex; align-items: flex-start; gap: .85rem; border-block-start: 1px solid #0100280d; padding-block: 1.5rem; }
.session-row:last-child { padding-block-end: .25rem; }
.session-number { display: inline-flex; align-items: center; justify-content: center; inline-size: 2rem; block-size: 2rem; flex-shrink: 0; border-radius: .5rem; color: #5B3FD9; background: #8062fd12; font-size: .8125rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.session-content { min-inline-size: 0; flex: 1; }
.session-heading { gap: .5rem; align-items: flex-start; }
.session-time { display: flex; flex-wrap: wrap; gap: .25rem .75rem; color: #010028b3; font-size: .75rem; line-height: 1.7; margin-block-start: .4rem; }
.session-description { color: #010028cc; font-size: .8125rem; line-height: 1.8; margin-block-start: .8rem; max-inline-size: 70ch; }
.session-assignment { color: #010028cc; font-size: .8125rem; line-height: 1.8; margin-block-start: .65rem; max-inline-size: 70ch; }
.session-assignment strong { color: #010028; font-weight: 700; }
.session-actions { display: flex; align-items: center; flex-wrap: wrap; gap: .6rem; margin-block-start: 1rem; }
.session-actions button { font-size: .75rem; min-block-size: 2.5rem; padding: .6rem .75rem; }
.session-actions .action-complete { color: #027231; border-color: #5fcc7b66; background: #5fcc7b0d; opacity: 1; }
.session-resource, .submission-link { display: inline-flex; align-items: center; gap: .4rem; color: #5B3FD9; font-size: .75rem; font-weight: 700; text-decoration: underline; text-underline-offset: .2em; }
.session-resource { padding: .6rem .25rem; }
.session-resource:hover, .submission-link:hover { color: #6B4AEE; }
.session-resource:focus-visible, .submission-link:focus-visible { outline: 2px solid #8062FD; outline-offset: 4px; border-radius: .15rem; }
.training-sidebar { display: flex; flex-direction: column; gap: 1.5rem; min-inline-size: 0; }
.quiz-panel, .team-progress-panel { padding: 1.5rem; }
.quiz-panel-icon { color: #5B3FD9; margin-block-end: .75rem; }
.quiz-panel .field-help { margin-block-start: .6rem; }
.quiz-existing-score { color: #010028; font-size: .9375rem; font-weight: 700; margin-block-start: 1rem; font-variant-numeric: tabular-nums; }
.quiz-existing-date { color: #010028b3; font-size: .75rem; line-height: 1.7; margin-block-start: .3rem; }
.quiz-start { margin-block-start: 1.25rem; inline-size: 100%; justify-content: center; }
.team-name { margin-block: .3rem 1rem; }
.team-eligibility { margin-block-start: 1rem; }
.team-eligibility .field-help { margin-block-start: .6rem; }
.team-progress-members { list-style: none; padding: 0; margin-block-start: 1.25rem; }
.team-progress-members li { display: flex; justify-content: space-between; align-items: baseline; gap: .75rem; padding-block: .65rem; border-block-start: 1px solid #0100280d; color: #010028cc; font-size: .75rem; line-height: 1.6; }
.team-progress-members strong { color: #5B3FD9; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.team-progress-members .member-ready { color: #027231; }
.submission-link { margin-block-start: 1rem; min-block-size: 2.5rem; font-size: .8125rem; }
.no-team-help { margin-block-start: .65rem; }
@media (max-width: 1100px) { .training-workspace { grid-template-columns: minmax(0, 1fr); } .training-sidebar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .progress-breakdown { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .breakdown-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: .25rem .75rem; }
  .breakdown-item dd { margin-block-start: 0; text-align: end; }
  .breakdown-item .breakdown-contribution { grid-column: 1 / -1; margin-block-start: 0; text-align: start; }
  .training-sidebar { display: flex; }
  .session-row { gap: .65rem; }
  .session-actions { align-items: stretch; }
  .session-actions button { justify-content: center; flex: 1 1 100%; }
}
</style>
