<script setup lang="ts">
import type { EvaluationCriterion } from '~/types/challenge'
import { weightedScore } from '~/utils/challengeScoring'

const props = withDefaults(defineProps<{ criteria: EvaluationCriterion[]; modelValue: Record<string, number>; readonly?: boolean }>(), { readonly: false })
const emit = defineEmits<{ 'update:modelValue': [scores: Record<string, number>] }>()
const { t } = useI18n()
const { lt, number } = useChallengeFormat()
const uid = useId()
const total = computed(() => weightedScore({ scores: props.modelValue }, props.criteria))
const weights = computed(() => props.criteria.reduce((sum, item) => sum + item.weight, 0))
function update(id: string, event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update:modelValue', { ...props.modelValue, [id]: Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0 })
}
</script>

<template>
  <section class="rubric-matrix" :aria-labelledby="`${uid}-heading`">
    <div class="rubric-heading">
      <h3 :id="`${uid}-heading`" class="text-lg font-bold text-heading">{{ t('challenge.judge.rubric') }}</h3>
      <span class="text-sm text-text">{{ t('challenge.judge.weightTotal', { value: number(weights) }) }}</span>
    </div>
    <p v-if="weights !== 100" role="alert" class="rubric-warning">{{ t('challenge.judge.invalidWeights') }}</p>
    <div v-for="criterion in criteria" :key="criterion.id" class="rubric-row">
      <div class="rubric-label-row">
        <label :for="`${uid}-${criterion.id}-range`" class="font-semibold text-heading">{{ lt(criterion.name) }}</label>
        <span class="rubric-weight">{{ t('challenge.judge.weight', { value: number(criterion.weight) }) }}</span>
      </div>
      <p class="rubric-description">{{ lt(criterion.description) }}</p>
      <div class="rubric-controls">
        <input :id="`${uid}-${criterion.id}-range`" type="range" min="0" max="100" step="1" :value="modelValue[criterion.id] ?? 0" :disabled="readonly" :aria-valuetext="t('challenge.judge.pointsValue', { value: number(modelValue[criterion.id] ?? 0) })" class="rubric-range" @input="update(criterion.id, $event)" />
        <label :for="`${uid}-${criterion.id}-number`" class="sr-only">{{ t('challenge.judge.numericScore', { criterion: lt(criterion.name) }) }}</label>
        <input :id="`${uid}-${criterion.id}-number`" type="number" min="0" max="100" step="1" :value="modelValue[criterion.id] ?? 0" :disabled="readonly" class="challenge-field rubric-number" @input="update(criterion.id, $event)" />
      </div>
    </div>
    <div class="rubric-total">
      <span class="font-semibold text-heading">{{ t('challenge.judge.weightedTotal') }}</span>
      <output aria-live="polite" class="rubric-total-value"><bdi dir="ltr">{{ number(total, { maximumFractionDigits: 2 }) }}<span class="rubric-total-max"> / {{ number(100) }}</span></bdi></output>
    </div>
  </section>
</template>

<style scoped>
.rubric-heading, .rubric-label-row, .rubric-total { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.rubric-heading { flex-wrap: wrap; }
.rubric-row { padding-block: 1.15rem; border-block-end: 1px solid #eeecf9; }
.rubric-weight { flex-shrink: 0; font-size: .75rem; color: #5b3fd9; }
.rubric-description { margin-block-start: .4rem; color: #010028b3; font-size: .8rem; line-height: 1.6; }
.rubric-controls { display: flex; align-items: center; gap: 1rem; margin-block-start: .65rem; }
.rubric-range { flex: 1; min-inline-size: 0; accent-color: #6b4aee; block-size: 44px; cursor: pointer; }
.rubric-number { inline-size: 5rem; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.rubric-total { padding-block-start: 1.25rem; }
.rubric-total-value { color: #5b3fd9; font-size: 1.5rem; font-weight: 800; font-variant-numeric: tabular-nums; }
.rubric-total-max { color: #010028b3; font-size: .85rem; font-weight: 500; }
.rubric-warning { margin-block-start: .8rem; padding: .75rem; border-radius: .65rem; background: #fff5db; color: #785400; font-size: .875rem; }
</style>
