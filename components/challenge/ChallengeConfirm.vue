<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string; message: string; confirmLabel?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()
const confirm = () => { emit('confirm'); emit('update:modelValue', false) }
</script>
<template>
  <ChallengeModal :model-value="modelValue" :title="title" @update:model-value="emit('update:modelValue', $event)">
    <p class="text-text leading-relaxed">{{ message }}</p>
    <slot />
    <div class="mt-7 flex flex-wrap justify-end gap-3">
      <button type="button" class="challenge-button-secondary" @click="emit('update:modelValue', false)">{{ $t('challenge.shell.cancel') }}</button>
      <button type="button" class="challenge-button" @click="confirm">{{ confirmLabel || $t('challenge.shell.confirm') }}</button>
    </div>
  </ChallengeModal>
</template>
