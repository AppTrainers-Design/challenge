<script setup lang="ts">
const { role, state, selectPersona } = useChallenge()
const { lt } = useChallengeFormat()
const { result } = useChallengeToast()
const uid = useId()
const options = computed(() => role.value === 'student' ? state.value?.students : role.value === 'school' ? state.value?.schools : role.value === 'judge' ? state.value?.judges : [])
const selected = computed(() => role.value === 'student' ? state.value?.personas.studentId : role.value === 'school' ? state.value?.personas.schoolId : state.value?.personas.judgeId)
</script>
<template><div v-if="options?.length" class="min-w-0"><label :for="uid" class="mb-1 block text-xs font-medium text-text">{{ $t('challenge.shell.actingAs') }}</label><select :id="uid" :value="selected" class="challenge-field !min-h-9 !py-1 text-xs" @change="result(selectPersona(role, ($event.target as HTMLSelectElement).value), 'challenge.toasts.personaChanged')"><option v-for="item in options" :key="item.id" :value="item.id">{{ lt(item.name) }}</option></select></div></template>
