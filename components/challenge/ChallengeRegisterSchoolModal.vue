<script setup lang="ts">
import type { RegisterSchoolInput } from '~/types/challenge'
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [open: boolean] }>()
const { state, registerSchool } = useChallenge()
const { result } = useChallengeToast()
const form = reactive<RegisterSchoolInput>({ name: '', governorate: 'amman', type: 'public', contactName: '', email: '', phone: '', expectedStudents: 12 })
const governorates = ['amman', 'irbid', 'zarqa', 'balqa', 'madaba', 'karak', 'tafilah', 'maan', 'aqaba', 'mafraq', 'jerash', 'ajloun']
const error = ref('')
const permitted = computed(() => state.value?.competition.phase === 'registration')
const submit = () => {
  const action = registerSchool({ ...form })
  error.value = action.errorKey || ''
  if (result(action, 'challenge.toasts.schoolRegistered')) {
    emit('update:modelValue', false)
    Object.assign(form, { name: '', contactName: '', email: '', phone: '', expectedStudents: 12 })
  }
}
watch(() => props.modelValue, () => { error.value = '' })
</script>
<template>
  <ChallengeModal :model-value="modelValue" :title="$t('challenge.public.registerSchool')" @update:model-value="emit('update:modelValue', $event)">
    <p v-if="!permitted" class="mb-5 rounded-xl bg-brand/10 p-3 text-sm text-brand-deep">{{ $t('challenge.shell.lockedPhase', { phase: $t('challenge.phases.registration') }) }}</p>
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block"><span class="challenge-label">{{ $t('challenge.public.schoolName') }}</span><input v-model="form.name" class="challenge-field" maxlength="120" required autocomplete="organization" /></label>
      <div class="grid gap-4 sm:grid-cols-2"><label><span class="challenge-label">{{ $t('challenge.public.governorate') }}</span><select v-model="form.governorate" class="challenge-field"><option v-for="item in governorates" :key="item" :value="item">{{ $t(`challenge.governorates.${item}`) }}</option></select></label><label><span class="challenge-label">{{ $t('challenge.public.schoolType') }}</span><select v-model="form.type" class="challenge-field"><option v-for="item in ['public', 'private', 'international']" :key="item" :value="item">{{ $t(`challenge.schoolTypes.${item}`) }}</option></select></label></div>
      <label class="block"><span class="challenge-label">{{ $t('challenge.public.coordinator') }}</span><input v-model="form.contactName" class="challenge-field" required maxlength="100" autocomplete="name" /></label>
      <div class="grid gap-4 sm:grid-cols-2"><label><span class="challenge-label">{{ $t('challenge.public.email') }}</span><input v-model="form.email" type="email" dir="ltr" class="challenge-field" required autocomplete="email" /></label><label><span class="challenge-label">{{ $t('challenge.public.phone') }}</span><input v-model="form.phone" type="tel" dir="ltr" class="challenge-field" placeholder="0791234567" required autocomplete="tel" /><span class="mt-1 block text-xs">{{ $t('challenge.public.phoneHint') }}</span></label></div>
      <label class="block"><span class="challenge-label">{{ $t('challenge.public.expectedStudents') }}</span><input v-model.number="form.expectedStudents" type="number" min="3" max="500" step="1" class="challenge-field" required /></label>
      <p v-if="error" role="alert" class="text-sm text-red-700">{{ $t(error) }}</p>
      <div class="flex justify-end gap-3 pt-3"><button type="button" class="challenge-button-secondary" @click="emit('update:modelValue', false)">{{ $t('challenge.shell.cancel') }}</button><button type="submit" class="challenge-button" :disabled="!permitted">{{ $t('challenge.public.registerSchool') }}</button></div>
    </form>
  </ChallengeModal>
</template>
