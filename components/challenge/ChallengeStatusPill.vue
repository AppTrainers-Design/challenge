<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' }>(), { tone: 'neutral' })
const tones = { neutral: 'bg-gray-100 text-gray-700', brand: 'bg-brand/10 text-brand-deep', success: 'bg-accent/15 text-accent-deep', warning: 'bg-amber-50 text-amber-800', danger: 'bg-red-50 text-red-700' }
</script>
<template><span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" :class="tones[tone]"><slot /></span></template>
