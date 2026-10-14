<script setup lang="ts">
import type { GameSubmission, Team } from '~/types/challenge'

const props = defineProps<{ modelValue: boolean; team: Team | null; submission: GameSubmission | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { t } = useI18n()
const { lt, date } = useChallengeFormat()
const { state, currentJudge, saveJudgeEvaluation, teamEligible } = useChallenge()
const toast = useChallengeToast()
const tab = ref('gdd')
const scores = ref<Record<string, number>>({})
const strengths = ref('')
const improvements = ref('')
const recommendation = ref('')
const confirmOpen = ref(false)
const uid = useId()
const evaluation = computed(() => state.value?.evaluations.find(item => item.judgeId === currentJudge.value?.id && item.teamId === props.team?.id) ?? null)
const blind = computed(() => state.value?.competition.blindJudging ?? true)
const school = computed(() => state.value?.schools.find(item => item.id === props.team?.schoolId))
const members = computed(() => state.value?.students.filter(item => props.team?.memberIds.includes(item.id)) ?? [])
const criteria = computed(() => state.value?.criteria ?? [])
const locked = computed(() => evaluation.value?.status === 'submitted' || !!evaluation.value?.lockedAt)
const canEdit = computed(() => state.value?.competition.phase === 'judging' && !locked.value && !!currentJudge.value && !!props.team && currentJudge.value.assignedTeamIds.includes(props.team.id) && teamEligible(props.team) && currentJudge.value.schoolId !== props.team.schoolId && props.submission?.status !== 'draft')
const tabs = computed(() => [
  { id: 'gdd', label: t('challenge.judge.tabs.gdd') },
  { id: 'presentation', label: t('challenge.judge.tabs.presentation') },
  { id: 'trailer', label: t('challenge.judge.tabs.trailer') },
])
const documentUrl = computed(() => safeUrl(tab.value === 'gdd' ? props.submission?.content.gddUrl : props.submission?.content.presentationUrl))
const trailer = computed(() => safeUrl(props.submission?.content.trailerUrl))
const allNotesPresent = computed(() => [strengths.value, improvements.value, recommendation.value].every(value => value.trim().length >= 3))
function loadEvaluation() {
  scores.value = Object.fromEntries(criteria.value.map(item => [item.id, evaluation.value?.scores[item.id] ?? 0]))
  strengths.value = evaluation.value?.strengths ?? ''
  improvements.value = evaluation.value?.improvements ?? ''
  recommendation.value = evaluation.value?.recommendation ?? ''
  tab.value = 'gdd'
  confirmOpen.value = false
}
watch(() => [props.modelValue, props.team?.id, currentJudge.value?.id], () => { if (props.modelValue) loadEvaluation() }, { immediate: true })
watch(() => props.modelValue, open => { if (!open) confirmOpen.value = false })
function save(submit = false) {
  if (!props.team) return
  const action = saveJudgeEvaluation(props.team.id, { scores: { ...scores.value }, strengths: strengths.value, improvements: improvements.value, recommendation: recommendation.value }, submit)
  if (toast.result(action, submit ? 'challenge.judge.toasts.submitted' : 'challenge.judge.toasts.draftSaved')) emit('update:modelValue', false)
}
function requestSubmit() {
  if (!allNotesPresent.value) { toast.push('challenge.judge.notesRequired', 'danger'); return }
  confirmOpen.value = true
}
</script>

<template>
  <ChallengeModal :model-value="modelValue" :title="t('challenge.judge.evaluateProject')" wide @update:model-value="emit('update:modelValue', $event)">
    <template v-if="team && submission">
      <div class="evaluation-heading">
        <div>
          <h3 class="text-lg font-bold text-heading">{{ lt(submission.content.title) || t('challenge.judge.untitled') }}</h3>
          <p v-if="!blind" class="evaluation-meta">{{ lt(team.name) }} · {{ lt(school?.name) }}<template v-if="school?.governorate"> · {{ t(`challenge.governorates.${school.governorate}`) }}</template></p>
          <p v-if="!blind && members.length" class="evaluation-meta">{{ members.map(item => lt(item.name)).join('، ') }}</p>
          <p class="evaluation-meta">{{ t(`challenge.genres.${submission.content.genre}`) }} · {{ t(`challenge.platforms.${submission.content.platform}`) }}</p>
        </div>
      </div>
      <p v-if="locked" class="evaluation-notice"><AppIcon name="lock" class="h-4 w-4 shrink-0" />{{ t('challenge.judge.lockedNotice', { date: date(evaluation?.submittedAt) }) }}</p>
      <p v-else-if="!canEdit" class="evaluation-notice"><AppIcon name="lock" class="h-4 w-4 shrink-0" />{{ t(state?.competition.phase !== 'judging' ? 'challenge.judge.phaseLocked' : 'challenge.judge.ineligibleNotice') }}</p>
      <div class="evaluation-workspace">
        <div class="evaluation-content">
          <ChallengeTabs v-model="tab" :items="tabs" :label="t('challenge.judge.contentTabs')">
            <div v-if="tab === 'gdd' || tab === 'presentation'" class="evaluation-document">
              <AppIcon name="document-text" class="h-10 w-10 text-brand" />
              <h4 class="mt-4 font-bold text-heading">{{ t(tab === 'gdd' ? 'challenge.judge.tabs.gdd' : 'challenge.judge.tabs.presentation') }}</h4>
              <p class="evaluation-meta mt-3">{{ t('challenge.judge.documentNotice') }}</p>
              <a v-if="documentUrl" :href="documentUrl" target="_blank" rel="noopener noreferrer" class="challenge-button-secondary mt-5"><AppIcon name="external-link" class="h-4 w-4" />{{ t('challenge.judge.openDocument') }}</a>
              <p v-else class="evaluation-meta mt-4">{{ t('challenge.judge.noDocument') }}</p>
            </div>
            <VideoPlayer v-else-if="modelValue && tab === 'trailer' && trailer" :src="trailer" :is-uploaded="false" :title="lt(submission.content.title)" />
            <ChallengeEmptyState v-else-if="tab === 'trailer'" :title="t('challenge.judge.noTrailer')" :description="t('challenge.judge.noTrailerDescription')" icon="film" />
          </ChallengeTabs>
          <p class="evaluation-description">{{ lt(submission.content.description) }}</p>
        </div>
        <div class="evaluation-form">
          <ChallengeRubricMatrix v-model="scores" :criteria="criteria" :readonly="!canEdit" />
          <div class="evaluation-notes">
            <div>
              <label :for="`${uid}-strengths`" class="challenge-label">{{ t('challenge.judge.strengths') }}</label>
              <textarea :id="`${uid}-strengths`" v-model="strengths" rows="3" maxlength="2000" :readonly="!canEdit" class="challenge-field" />
            </div>
            <div>
              <label :for="`${uid}-improvements`" class="challenge-label">{{ t('challenge.judge.improvements') }}</label>
              <textarea :id="`${uid}-improvements`" v-model="improvements" rows="3" maxlength="2000" :readonly="!canEdit" class="challenge-field" />
            </div>
            <div>
              <label :for="`${uid}-recommendation`" class="challenge-label">{{ t('challenge.judge.recommendation') }}</label>
              <textarea :id="`${uid}-recommendation`" v-model="recommendation" rows="3" maxlength="2000" :readonly="!canEdit" class="challenge-field" />
            </div>
            <p v-if="canEdit" class="evaluation-meta">{{ t('challenge.judge.notesHelp') }}</p>
          </div>
        </div>
      </div>
      <div class="evaluation-actions">
        <button type="button" class="challenge-button-secondary" @click="emit('update:modelValue', false)">{{ t('challenge.shell.close') }}</button>
        <button type="button" class="challenge-button-secondary" :disabled="!canEdit" @click="save(false)">{{ t('challenge.judge.saveDraft') }}</button>
        <button type="button" class="challenge-button" :disabled="!canEdit || criteria.reduce((sum, item) => sum + item.weight, 0) !== 100" @click="requestSubmit"><AppIcon name="lock" class="h-4 w-4" />{{ t('challenge.judge.submitLock') }}</button>
      </div>
    </template>
    <ChallengeEmptyState v-else :title="t('challenge.judge.projectUnavailable')" :description="t('challenge.judge.projectUnavailableDescription')" />
    <ChallengeConfirm v-model="confirmOpen" :title="t('challenge.judge.confirmTitle')" :message="t('challenge.judge.confirmMessage')" :confirm-label="t('challenge.judge.submitLock')" @confirm="save(true)" />
  </ChallengeModal>
</template>

<style scoped>
.evaluation-heading { display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-block-end: 1.5rem; }
.evaluation-meta { color: #010028b3; font-size: .8rem; line-height: 1.7; margin-block-start: .35rem; overflow-wrap: anywhere; }
.evaluation-workspace { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2rem; }
.evaluation-content, .evaluation-form { min-inline-size: 0; }
.evaluation-form { border-inline-start: 1px solid #eeecf9; padding-inline-start: 1.5rem; }
.evaluation-document { display: flex; align-items: center; flex-direction: column; text-align: center; padding: 2rem 1rem; background: #f8f7fc; border-radius: .8rem; }
.evaluation-description { margin-block-start: 1.5rem; color: #010028cc; font-size: .875rem; line-height: 1.8; overflow-wrap: anywhere; }
.evaluation-notice { display: flex; gap: .65rem; align-items: center; padding: 1rem; margin-block-end: 1.5rem; background: #f2f0fe; color: #5b3fd9; border-radius: .75rem; font-size: .875rem; line-height: 1.6; }
.evaluation-notes { display: grid; gap: 1.25rem; margin-block-start: 1.75rem; }
.evaluation-notes textarea { resize: vertical; }
.evaluation-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: .75rem; border-block-start: 1px solid #eeecf9; margin-block-start: 2rem; padding-block-start: 1.5rem; }
@media (max-width: 767px) { .evaluation-workspace { grid-template-columns: minmax(0, 1fr); gap: 1.75rem; } .evaluation-form { border-inline-start: 0; padding-inline-start: 0; border-block-start: 1px solid #eeecf9; padding-block-start: 1.5rem; } .evaluation-actions button { flex: 1; } }
</style>
