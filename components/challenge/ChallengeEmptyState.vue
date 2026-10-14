<script setup lang="ts">
withDefaults(defineProps<{ title: string; description: string; icon?: string }>(), { icon: 'gamepad' })
</script>
<template><div class="py-10 text-center"><AppIcon :name="icon" class="mx-auto mb-4 h-10 w-10 text-brand" /><h2 class="text-xl font-bold text-heading">{{ title }}</h2><p class="mx-auto mt-3 max-w-xl leading-relaxed text-text">{{ description }}</p><div v-if="$slots.default" class="mt-6 flex flex-wrap justify-center gap-3"><slot /></div></div></template>
