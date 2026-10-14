<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { t } = useI18n()
const { lt, number } = useChallengeFormat()
const toast = useChallengeToast()
const { state, currentStudent, submitQuiz } = useChallenge()

const open = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) })
const currentIndex = ref(0)
const answers = ref<Record<string, string>>({})
const submitted = ref(false)
const error = ref('')
const questionPanel = ref<HTMLElement | null>(null)
const questions = computed(() => state.value?.course.quizQuestions ?? [])
const currentQuestion = computed(() => questions.value[currentIndex.value])
const answeredCount = computed(() => questions.value.filter(question => !!answers.value[question.id]).length)
const canSubmit = computed(() => questions.value.length > 0 && answeredCount.value === questions.value.length)
const score = computed(() => state.value?.trainingProgress.find(item => item.studentId === currentStudent.value?.id)?.quizScore ?? 0)
const correctCount = computed(() => questions.value.filter(question => answers.value[question.id] === question.correctOptionId).length)

// ExamQuestion is unchanged: numeric presentation IDs bridge its API to the mock
// curriculum's stable string IDs, which remain the only IDs stored in state.
const examQuestion = computed(() => currentQuestion.value ? {
  id: currentIndex.value + 1,
  question_text: lt(currentQuestion.value.text),
  points: 1,
  options: currentQuestion.value.options.map((option, index) => ({ id: index + 1, text: lt(option.text) })),
} : null)
const selectedId = computed(() => {
  const question = currentQuestion.value
  if (!question || !answers.value[question.id]) return null
  const optionIndex = question.options.findIndex(option => option.id === answers.value[question.id])
  return optionIndex < 0 ? null : optionIndex + 1
})

watch(() => props.modelValue, value => { if (value) reset() })

function reset() {
  currentIndex.value = 0
  answers.value = {}
  submitted.value = false
  error.value = ''
}

function selectOption(optionId: number) {
  const question = currentQuestion.value
  const option = question?.options[optionId - 1]
  if (question && option) answers.value[question.id] = option.id
  error.value = ''
}

async function navigate(index: number) {
  currentIndex.value = Math.min(Math.max(0, index), questions.value.length - 1)
  await nextTick()
  questionPanel.value?.focus()
}

function finishQuiz() {
  if (!canSubmit.value) {
    error.value = t('challenge.student.quiz.answerAll')
    return
  }
  const result = submitQuiz({ ...answers.value })
  toast.result(result, 'challenge.student.toasts.quizSaved')
  if (result.ok) submitted.value = true
  else error.value = t(result.errorKey ?? 'challenge.student.validation.quizFailed')
}

</script>

<template>
  <ChallengeModal v-model="open" :title="t('challenge.student.quiz.title')">
    <div class="challenge-quiz">
      <div v-if="submitted" class="quiz-result" role="status">
        <AppIcon name="check-circle" class="quiz-result-icon w-12 h-12" />
        <h2 class="quiz-result-title">{{ t('challenge.student.quiz.resultTitle') }}</h2>
        <p class="quiz-result-score">{{ t('challenge.student.quiz.score', { score: number(score, { maximumFractionDigits: 0 }) }) }}</p>
        <p class="quiz-result-detail">{{ t('challenge.student.quiz.correctAnswers', { count: number(correctCount), total: number(questions.length) }) }}</p>
        <p class="quiz-result-help">{{ t('challenge.student.quiz.resultHelp') }}</p>
        <button type="button" class="challenge-button" @click="open = false">{{ t('challenge.student.quiz.backToTraining') }}</button>
      </div>

      <template v-else-if="examQuestion">
        <p class="quiz-intro">{{ t('challenge.student.quiz.intro', { count: number(questions.length) }) }}</p>
        <nav class="quiz-question-navigation" :aria-label="t('challenge.student.quiz.navigation')">
          <button
            v-for="(question, index) in questions"
            :key="question.id"
            type="button"
            class="quiz-question-button"
            :class="{ 'is-current': index === currentIndex, 'is-answered': !!answers[question.id] }"
            :aria-current="index === currentIndex ? 'step' : undefined"
            :aria-label="t(answers[question.id] ? 'challenge.student.quiz.questionAnswered' : 'challenge.student.quiz.questionUnanswered', { number: number(index + 1) })"
            @click="navigate(index)"
          >
            {{ number(index + 1) }}
            <AppIcon v-if="answers[question.id]" name="check" class="w-3 h-3" />
          </button>
        </nav>
        <div ref="questionPanel" class="challenge-quiz-question" role="group" tabindex="-1" :aria-label="examQuestion.question_text">
          <ExamQuestion :question="examQuestion" :selected-id="selectedId" :index="currentIndex" :total="questions.length" @select="selectOption" />
        </div>
        <p v-if="error" class="quiz-error" role="alert">{{ error }}</p>
        <p class="quiz-answer-count" aria-live="polite">{{ t('challenge.student.quiz.answeredCount', { count: number(answeredCount), total: number(questions.length) }) }}</p>
        <div class="quiz-footer">
          <button type="button" class="challenge-button-secondary" :disabled="currentIndex === 0" @click="navigate(currentIndex - 1)">
            <AppIcon name="arrow-left" class="w-4 h-4 rtl:-scale-x-100" />
            {{ t('challenge.student.quiz.previous') }}
          </button>
          <button v-if="currentIndex < questions.length - 1" type="button" class="challenge-button" @click="navigate(currentIndex + 1)">
            {{ t('challenge.student.quiz.next') }}
            <AppIcon name="arrow-right" class="w-4 h-4 rtl:-scale-x-100" />
          </button>
          <button v-else type="button" class="challenge-button" :disabled="!canSubmit" @click="finishQuiz">{{ t('challenge.student.quiz.submit') }}</button>
        </div>
      </template>
      <ChallengeEmptyState v-else :title="t('challenge.student.quiz.emptyTitle')" :description="t('challenge.student.quiz.emptyDescription')" icon="clipboard" />
    </div>
  </ChallengeModal>
</template>

<style scoped>
.challenge-quiz { min-inline-size: 0; }
.quiz-intro { color: #010028b3; font-size: .8125rem; line-height: 1.8; max-inline-size: 65ch; }
.quiz-question-navigation { display: flex; flex-wrap: wrap; gap: .5rem; margin-block: 1.25rem 1.75rem; }
.quiz-question-button { display: inline-flex; align-items: center; justify-content: center; gap: .25rem; min-inline-size: 2.5rem; min-block-size: 2.5rem; padding: .5rem; border: 1px solid #0100281a; border-radius: .6rem; color: #010028b3; background: white; font-size: .8125rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.quiz-question-button:hover { border-color: #8062FD; }
.quiz-question-button.is-answered { color: #027231; background: #5fcc7b0d; border-color: #5fcc7b80; }
.quiz-question-button.is-current { background: #6B4AEE; border-color: #6B4AEE; color: white; }
.quiz-question-button:focus-visible { outline: 2px solid #8062FD; outline-offset: 3px; }
.quiz-answer-count { color: #010028b3; margin-block-start: 1.25rem; font-size: .8125rem; font-variant-numeric: tabular-nums; }
.quiz-footer { display: flex; justify-content: space-between; gap: .75rem; padding-block-start: 1.25rem; margin-block-start: 1.25rem; border-block-start: 1px solid #01002812; }
.quiz-error { margin-block-start: 1rem; color: #b91c1c; font-size: .8125rem; line-height: 1.8; }
.quiz-result { text-align: center; padding-block: 1.5rem; }
.quiz-result-icon { color: #027231; margin-inline: auto; }
.quiz-result-title { color: #010028; font-size: 1.375rem; font-weight: 800; line-height: 1.5; margin-block-start: 1rem; }
.quiz-result-score { color: #5B3FD9; font-size: 1.75rem; font-weight: 800; margin-block-start: .5rem; font-variant-numeric: tabular-nums; }
.quiz-result-detail { color: #010028cc; font-size: .875rem; margin-block-start: .5rem; }
.quiz-result-help { color: #010028b3; font-size: .8125rem; line-height: 1.8; margin-block: 1rem 1.5rem; max-inline-size: 50ch; margin-inline: auto; }
.quiz-result .challenge-button { margin-inline: auto; }
@media (max-width: 640px) { .quiz-footer .challenge-button, .quiz-footer .challenge-button-secondary { padding-inline: .85rem; } }
</style>
