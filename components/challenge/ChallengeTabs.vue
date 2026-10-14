<script setup lang="ts">
const props = defineProps<{ modelValue: string; items: { id: string; label: string }[]; label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [id: string] }>()
const { locale } = useI18n()
const uid = useId()
const buttons = ref<HTMLButtonElement[]>([])
const navigate = (event: KeyboardEvent, index: number) => {
  const direction = locale.value === 'ar' ? -1 : 1
  let next = index
  if (event.key === 'ArrowRight') next += direction
  else if (event.key === 'ArrowLeft') next -= direction
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = props.items.length - 1
  else return
  event.preventDefault()
  next = (next + props.items.length) % props.items.length
  emit('update:modelValue', props.items[next]!.id)
  buttons.value[next]?.focus()
}
</script>
<template>
  <div>
    <div role="tablist" :aria-label="label || $t('challenge.shell.tabs')" class="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
      <button v-for="(item, index) in items" :id="`${uid}-tab-${item.id}`" :key="item.id" ref="buttons" type="button" role="tab" :aria-selected="modelValue === item.id" :aria-controls="`${uid}-panel`" :tabindex="modelValue === item.id ? 0 : -1" class="shrink-0 border-b-2 px-4 py-3 text-sm font-semibold" :class="modelValue === item.id ? 'border-brand text-brand-deep' : 'border-transparent text-text hover:text-brand-deep'" @click="emit('update:modelValue', item.id)" @keydown="navigate($event, index)">{{ item.label }}</button>
    </div>
    <div :id="`${uid}-panel`" role="tabpanel" :aria-labelledby="`${uid}-tab-${modelValue}`" tabindex="0"><slot /></div>
  </div>
</template>
