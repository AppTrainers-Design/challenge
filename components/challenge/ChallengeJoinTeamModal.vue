<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>()
const { tm, rt } = useI18n()
const { lt, number } = useChallengeFormat()
const { state, demoInvite, joinTeamWithCode } = useChallenge()
const { result } = useChallengeToast()
const localePath = useLocalePath()
const inputId = useId()
const code = ref('')
const error = ref('')
const permitted = computed(() => state.value?.competition.phase === 'team_formation')
const steps = computed(() => (tm('challenge.visitor.join.steps') as string[]).map(step => rt(step)))
// Looked up while typing, so the visitor sees which team a code opens before joining.
const match = computed(() => code.value.length === 6 ? state.value?.teams.find(team => team.inviteCode === code.value) ?? null : null)
const schoolName = (schoolId: string) => lt(state.value?.schools.find(school => school.id === schoolId)?.name)

function normalize(event: Event) {
  const input = event.target as HTMLInputElement
  code.value = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)
  input.value = code.value
  error.value = ''
}

async function submit() {
  if (!/^[A-Z]{6}$/.test(code.value)) {
    error.value = 'challenge.student.validation.inviteCode'
    return
  }
  if (!match.value) return
  const action = joinTeamWithCode(code.value)
  error.value = action.errorKey || ''
  if (result(action, 'challenge.student.toasts.joined')) {
    emit('update:modelValue', false)
    await navigateTo(localePath('/challenge/student'))
  }
}

watch(() => props.modelValue, () => {
  code.value = ''
  error.value = ''
})
</script>

<template>
  <ChallengeModal :model-value="modelValue" :title="$t('challenge.visitor.studentCta')" @update:model-value="emit('update:modelValue', $event)">
    <ol class="space-y-3">
      <li v-for="(step, index) in steps" :key="index" class="flex items-start gap-3 text-sm leading-7">
        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand-deep" aria-hidden="true">{{ number(index + 1) }}</span>
        <span>{{ step }}</span>
      </li>
    </ol>

    <div v-if="demoInvite" class="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4">
      <p class="text-xs font-semibold text-accent-deep">{{ $t('challenge.visitor.demoCode') }}</p>
      <p class="mt-1 text-2xl font-bold tracking-[0.2em] text-heading"><span dir="ltr">{{ demoInvite.team.inviteCode }}</span></p>
      <p class="mt-1 text-sm">{{ lt(demoInvite.team.name) }} · {{ schoolName(demoInvite.team.schoolId) }}</p>
    </div>
    <p v-else class="mt-6 rounded-xl bg-[#f8f7fc] p-4 text-sm leading-7">
      {{ $t(state?.teams.length ? 'challenge.visitor.join.noSample' : 'challenge.visitor.demoUnavailable') }}
    </p>

    <p v-if="!permitted" class="mt-5 rounded-xl bg-brand/10 p-3 text-sm text-brand-deep">
      {{ $t('challenge.shell.lockedPhase', { phase: $t('challenge.phases.team_formation') }) }}
    </p>

    <form class="mt-6" novalidate @submit.prevent="submit">
      <label :for="inputId" class="challenge-label">{{ $t('challenge.student.team.codeLabel') }}</label>
      <div class="flex gap-2.5">
        <input
          :id="inputId"
          :value="code"
          dir="ltr"
          type="text"
          inputmode="text"
          autocomplete="off"
          autocapitalize="characters"
          maxlength="6"
          class="challenge-field min-w-0 flex-1 font-bold tracking-[0.12em]"
          :aria-invalid="!!error || (code.length === 6 && !match)"
          :aria-describedby="`${inputId}-status`"
          @input="normalize"
        >
        <button type="submit" class="challenge-button shrink-0" :disabled="!permitted || !match">{{ $t('challenge.student.team.join') }}</button>
      </div>
      <p :id="`${inputId}-status`" class="mt-2 text-[0.8125rem] leading-6" aria-live="polite">
        <span v-if="match" class="inline-flex items-start gap-1.5 font-semibold text-accent-deep">
          <AppIcon name="check-circle" class="mt-1 h-4 w-4 shrink-0" />
          {{ $t('challenge.visitor.join.match', { team: lt(match.name), school: schoolName(match.schoolId) }) }}
        </span>
        <span v-else-if="code.length === 6" class="text-red-700">{{ $t('challenge.validation.teamNotFound') }}</span>
        <span v-else>{{ $t('challenge.student.team.codeHelp') }}</span>
      </p>
      <p v-if="error" role="alert" class="mt-2 text-sm text-red-700">{{ $t(error) }}</p>
    </form>
  </ChallengeModal>
</template>
