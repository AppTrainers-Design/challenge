<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; title: string; wide?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const modalCount = useState('challenge-modal-count', () => 0)
const previousOverflow = useState<string | null>('challenge-modal-overflow', () => null)
let lockedScroll = false
let returnFocus: HTMLElement | null = null
const restoreScroll = () => {
  if (!lockedScroll) return
  lockedScroll = false
  modalCount.value = Math.max(0, modalCount.value - 1)
  if (!modalCount.value && previousOverflow.value !== null) { document.body.style.overflow = previousOverflow.value; previousOverflow.value = null }
}
const close = () => { emit('update:modelValue', false) }
watch(() => props.modelValue, async open => {
  await nextTick()
  if (!dialog.value) return
  if (open && !dialog.value.open) {
    returnFocus = document.activeElement as HTMLElement
    dialog.value.showModal()
    if (!modalCount.value) previousOverflow.value = document.body.style.overflow
    modalCount.value++
    lockedScroll = true
    document.body.style.overflow = 'hidden'
  } else if (!open && dialog.value.open) {
    dialog.value.close()
    restoreScroll()
    returnFocus?.focus()
  }
}, { immediate: true })
onBeforeUnmount(() => { if (import.meta.client) { dialog.value?.close(); restoreScroll() } })
const backdrop = (event: MouseEvent) => {
  if (event.target !== dialog.value) return
  const bounds = dialog.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close()
}
</script>
<template>
  <dialog ref="dialog" :aria-labelledby="titleId" class="challenge-modal" :class="{ 'challenge-modal--wide': wide }" @cancel.prevent="close" @close="restoreScroll(); close()" @click="backdrop">
    <div class="p-5 sm:p-7">
      <div class="mb-6 flex items-start justify-between gap-4">
        <h2 :id="titleId" class="text-xl font-bold text-heading">{{ title }}</h2>
        <button type="button" class="challenge-icon-button shrink-0" :aria-label="$t('challenge.shell.close')" @click="close"><AppIcon name="close" class="h-5 w-5" /></button>
      </div>
      <slot />
    </div>
  </dialog>
</template>
<style scoped>
.challenge-modal { border: 0; padding: 0; border-radius: 1rem; inline-size: calc(100vw - 2rem); max-inline-size: 36rem; max-block-size: calc(100dvh - 2rem); overflow: auto; color: #010028; box-shadow: 0 24px 60px #01002830; }
.challenge-modal--wide { max-inline-size: 64rem; }
.challenge-modal::backdrop { background: #01002870; }
</style>
