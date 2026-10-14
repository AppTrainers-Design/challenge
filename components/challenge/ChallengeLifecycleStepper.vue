<script setup lang="ts">
import { CHALLENGE_PHASES, type ChallengePhase } from '~/types/challenge'
const props = defineProps<{ phase: ChallengePhase }>()
const index = computed(() => CHALLENGE_PHASES.indexOf(props.phase))
const { number } = useChallengeFormat()
</script>
<template><ol class="flex gap-5 overflow-x-auto pb-3" :aria-label="$t('challenge.public.timeline')"><li v-for="(item, i) in CHALLENGE_PHASES" :key="item" class="min-w-[112px] flex-1" :aria-current="i === index ? 'step' : undefined"><span class="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" :class="i < index ? 'bg-accent/15 text-accent-deep' : i === index ? 'bg-brand-dark text-white' : 'bg-gray-100 text-text'"><AppIcon v-if="i < index" name="check" class="h-4 w-4" /><template v-else>{{ number(i + 1) }}</template></span><span class="text-sm" :class="i === index ? 'font-bold text-brand-deep' : 'text-text'">{{ $t(`challenge.phases.${item}`) }}</span></li></ol></template>
