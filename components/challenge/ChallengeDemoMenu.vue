<script setup lang="ts">
import { CHALLENGE_PHASES, type ChallengePhase } from '~/types/challenge'
const { state, jumpToPhase, resetDemo } = useChallenge()
const { result } = useChallengeToast()
const open = ref(false)
const confirm = ref(false)
const resetPhase = ref<ChallengePhase>('team_formation')
const selectPhase = (phase: ChallengePhase) => { result(jumpToPhase(phase), 'challenge.toasts.phaseChanged') }
</script>
<template>
  <div>
    <button type="button" class="challenge-button-secondary !min-h-9 !px-3 !py-1.5 !text-xs" @click="open = true"><AppIcon name="flask" class="h-4 w-4" />{{ $t('challenge.shell.demoMenu') }}</button>
    <ChallengeModal v-model="open" :title="$t('challenge.shell.demoMenu')">
      <p class="mb-5 leading-relaxed">{{ $t('challenge.shell.demoExplanation') }}</p>
      <label class="challenge-label" for="challenge-demo-phase">{{ $t('challenge.shell.jumpPhase') }}</label>
      <select id="challenge-demo-phase" class="challenge-field" :value="state?.competition.phase" @change="selectPhase(($event.target as HTMLSelectElement).value as ChallengePhase)"><option v-for="phase in CHALLENGE_PHASES" :key="phase" :value="phase">{{ $t(`challenge.phases.${phase}`) }}</option></select>
      <div class="mt-7 border-t border-gray-200 pt-5"><label for="challenge-reset-phase" class="challenge-label">{{ $t('challenge.shell.resetPhase') }}</label><select id="challenge-reset-phase" v-model="resetPhase" class="challenge-field"><option v-for="phase in CHALLENGE_PHASES" :key="phase" :value="phase">{{ $t(`challenge.phases.${phase}`) }}</option></select><button type="button" class="challenge-button-secondary mt-4" @click="confirm = true"><AppIcon name="refresh" class="h-4 w-4" />{{ $t('challenge.shell.reset') }}</button></div>
    </ChallengeModal>
    <ChallengeConfirm v-model="confirm" :title="$t('challenge.shell.reset')" :message="$t('challenge.shell.resetWarning')" @confirm="result(resetDemo(resetPhase), 'challenge.toasts.reset'); open = false" />
  </div>
</template>
