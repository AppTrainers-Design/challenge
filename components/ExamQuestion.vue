<script setup lang="ts">
// One exam question with single-select options. Presentational: it renders the
// current question + selection state and emits `select`; the parent owns navigation,
// the answer map, and submission.
interface ExamOption {
  id: number
  text: string
}
interface ExamQuestionItem {
  id: number
  question_text: string
  options: ExamOption[]
  points: number
}
interface Props {
  question: ExamQuestionItem
  selectedId: number | null
  index: number // 0-based position
  total: number
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'select', optionId: number): void }>()
const { t } = useI18n()

// Neutral A–F markers read cleanly in both LTR and RTL and don't clash with the
// "Question N" counter the way numbers would.
const markers = ['A', 'B', 'C', 'D', 'E', 'F']
</script>

<template>
  <div class="q">
    <p class="q__counter">{{ t('exam.active.counter', { current: index + 1, total }) }}</p>
    <h1 class="q__text">{{ question.question_text }}</h1>
    <p class="q__hint">
      <AppIcon name="target" class="w-4 h-4 shrink-0" />
      {{ t('exam.active.chooseAnswer') }}
    </p>

    <fieldset class="q__options" role="radiogroup">
      <label
        v-for="(opt, i) in question.options"
        :key="opt.id"
        class="opt"
        :class="{ 'opt--selected': selectedId === opt.id }"
      >
        <input
          class="opt__input"
          type="radio"
          :name="`q-${question.id}`"
          :value="opt.id"
          :checked="selectedId === opt.id"
          @change="emit('select', opt.id)"
        >
        <span class="opt__marker" aria-hidden="true">{{ markers[i] ?? i + 1 }}</span>
        <span class="opt__text">{{ opt.text }}</span>
        <AppIcon name="check-circle" class="opt__check w-5 h-5 shrink-0" />
      </label>
    </fieldset>
  </div>
</template>

<style scoped>
.q__counter {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #6B4AEE;
  text-transform: uppercase;
}

.q__text {
  margin-top: 0.5rem;
  font-size: clamp(1.35rem, 1rem + 1.6vw, 1.9rem);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: #010028;
  text-wrap: balance;
}

.q__hint {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.85rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
}

.q__options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.75rem;
  border: 0;
  padding: 0;
  min-inline-size: 0;
}

.opt {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-height: 3.5rem;
  padding: 0.85rem 1.1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.9rem;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease,
    box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.opt:hover {
  border-color: rgba(128, 98, 253, 0.5);
  background: rgba(128, 98, 253, 0.03);
}

/* Focus ring follows the visually-hidden radio for full keyboard a11y. */
.opt:focus-within {
  border-color: #8062FD;
  box-shadow: 0 0 0 3px rgba(128, 98, 253, 0.2);
}

.opt--selected {
  border-color: #8062FD;
  background: rgba(128, 98, 253, 0.07);
  box-shadow: 0 4px 16px rgba(128, 98, 253, 0.1);
}

.opt__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.opt__marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 0.6rem;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.875rem;
  font-weight: 700;
  color: #6b7280;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease,
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.opt--selected .opt__marker {
  background: #8062FD;
  border-color: #8062FD;
  color: #ffffff;
  transform: scale(1.06);
}

.opt__text {
  flex: 1 1 auto;
  min-inline-size: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #010028;
  text-align: start;
}

.opt__check {
  margin-inline-start: auto;
  color: #8062FD;
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.opt--selected .opt__check {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .opt,
  .opt__marker,
  .opt__check { transition: none; }
  .opt--selected .opt__marker { transform: none; }
}
</style>
