<script setup lang="ts">
import type { ChallengePhase } from '~/types/challenge'

const props = defineProps<{ phase: ChallengePhase }>()
const { t, tm, rt } = useI18n()
const { number } = useChallengeFormat()
const activeStep = computed(() => {
  const steps: Record<ChallengePhase, number> = {
    registration: 0,
    team_formation: 0,
    training: 1,
    submission: 3,
    judging: 4,
    results: 5,
    archived: 5,
  }
  return steps[props.phase]
})
const journey = computed(() => {
  const labels = tm('challenge.visitor.journey')
  return Array.isArray(labels) ? labels.map(label => rt(label)) : []
})
const status = (index: number) => index < activeStep.value
  ? t('challenge.status.completed')
  : index === activeStep.value
    ? t('challenge.visitor.activePhase')
    : t('challenge.visitor.upcomingPhase')
</script>

<template>
  <section class="public-journey" aria-labelledby="public-journey-title">
    <h2 id="public-journey-title" class="public-journey__heading">{{ t('challenge.visitor.journeyTitle') }}</h2>
    <p class="public-journey__description">{{ t('challenge.visitor.journeyDescription') }}</p>
    <ol class="public-journey__steps">
      <li
        v-for="(label, index) in journey"
        :key="index"
        class="public-journey__step"
        :class="{ 'is-complete': index < activeStep, 'is-active': index === activeStep }"
        :aria-current="index === activeStep ? 'step' : undefined"
      >
        <span class="public-journey__node" aria-hidden="true">
          <AppIcon v-if="index < activeStep" name="check" class="h-4 w-4" />
          <AppIcon v-else-if="index === activeStep" name="clock" class="h-[18px] w-[18px]" />
          <template v-else>{{ number(index + 1) }}</template>
        </span>
        <div class="public-journey__copy">
          <span class="sr-only">{{ number(index + 1) }}. </span>
          <span class="public-journey__label">{{ label }}</span>
          <span v-if="index === activeStep" class="public-journey__badge">{{ t('challenge.visitor.activePhase') }}</span>
          <span v-else class="sr-only"> — {{ status(index) }}</span>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.public-journey {
  padding: 24px;
  border: 1px solid #e4dff7;
  border-radius: 12px;
  background: #fff;
  color: #010028;
}
.public-journey__heading {
  margin: 0;
  color: #5d5876;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: .035em;
  text-transform: uppercase;
}
.public-journey__description {
  margin: 3px 0 0;
  color: #6d6588;
  font-size: 11px;
  line-height: 1.6;
}
.public-journey__steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}
.public-journey__steps::before {
  position: absolute;
  inset-inline: calc(100% / 12);
  top: 16px;
  height: 1px;
  background: #e4dff7;
  content: '';
}
.public-journey__step {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}
.public-journey__node {
  position: relative;
  display: flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #d2cae8;
  border-radius: 50%;
  background: #fff;
  color: #6d6588;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.public-journey__copy {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-direction: column;
  gap: 4px;
}
.public-journey__label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.public-journey__step.is-complete .public-journey__node {
  border: 2px solid #5fcc7b;
  background: #0b8940;
  color: #fff;
}
.public-journey__step.is-active .public-journey__node {
  border: 2px solid #fff;
  outline: 3px solid #dcd3fc;
  background: #8062fd;
  color: #fff;
}
.public-journey__step.is-active .public-journey__label {
  color: #5132bc;
  font-weight: 700;
}
.public-journey__badge {
  border-radius: 3px;
  padding: 2px 5px;
  background: #f2f0fe;
  color: #5132bc;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.5;
}
@media (max-width: 719px) {
  .public-journey { padding: 20px; }
  .public-journey__steps { grid-template-columns: 1fr; gap: 20px; }
  .public-journey__steps::before {
    inset-inline-start: 16px;
    inset-inline-end: auto;
    top: 17px;
    bottom: 17px;
    width: 1px;
    height: auto;
  }
  .public-journey__step { flex-direction: row; gap: 14px; text-align: start; }
  .public-journey__copy { align-items: flex-start; }
  .public-journey__label { font-size: 12px; }
}
</style>
