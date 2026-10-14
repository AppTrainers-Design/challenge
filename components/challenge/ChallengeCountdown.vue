<script setup lang="ts">
const props = defineProps<{ deadline: string }>()
const { number } = useChallengeFormat()
const now = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { now.value = Date.now(); timer = setInterval(() => { now.value = Date.now() }, 1000) })
onBeforeUnmount(() => clearInterval(timer))
const remaining = computed(() => Math.max(0, Math.floor((new Date(props.deadline).getTime() - now.value) / 1000)))
const units = computed(() => [{ key: 'days', value: Math.floor(remaining.value / 86400) }, { key: 'hours', value: Math.floor(remaining.value % 86400 / 3600) }, { key: 'minutes', value: Math.floor(remaining.value % 3600 / 60) }, { key: 'seconds', value: remaining.value % 60 }])
</script>
<template><div><p class="mb-3 text-sm font-medium">{{ $t('challenge.public.deadline') }}</p><p v-if="now && !remaining" class="font-bold">{{ $t('challenge.public.deadlinePassed') }}</p><div v-else class="flex gap-5 sm:gap-7" role="timer" :aria-label="$t('challenge.public.deadline')"><div v-for="unit in units" :key="unit.key"><span class="text-2xl font-bold tabular-nums sm:text-3xl">{{ now ? number(unit.value, { minimumIntegerDigits: 2 }) : '—' }}</span><span class="mt-1 block text-xs">{{ $t(`challenge.public.${unit.key}`) }}</span></div></div></div></template>
