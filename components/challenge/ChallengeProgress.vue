<script setup lang="ts">
const props = withDefaults(defineProps<{ value: number; threshold?: number; label?: string }>(), { threshold: 80 })
const { number } = useChallengeFormat()
const value = computed(() => Math.max(0, Math.min(100, props.value)))
</script>
<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-3 text-sm"><span>{{ label || $t('challenge.shell.progress') }}</span><strong class="tabular-nums text-heading">{{ number(value, { maximumFractionDigits: 1 }) }}%</strong></div>
    <div class="relative h-2.5 rounded-full bg-brand/10" role="progressbar" :aria-label="label || $t('challenge.shell.progress')" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100">
      <div class="h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none" :class="value >= threshold ? 'bg-accent-dark' : 'bg-brand'" :style="{ width: `${value}%` }" />
      <span class="absolute -top-1 h-4 border-s-2 border-heading" :style="{ insetInlineStart: `${threshold}%` }" />
    </div>
    <p class="mt-2 text-xs text-text">{{ $t('challenge.shell.threshold', { value: number(threshold) }) }}</p>
  </div>
</template>
