<script setup lang="ts">
const props = defineProps<{ titleKey: string; stage: number }>()
const { t } = useI18n()
const localePath = useLocalePath()
useHead(() => ({ title: `${t(props.titleKey)} - Gaming Lab` }))
</script>
<template><div class="challenge-page"><h1 class="challenge-heading">{{ $t(titleKey) }}</h1><div class="challenge-panel mt-7"><ChallengeEmptyState :title="$t('challenge.shell.upcomingTitle', { stage })" :description="$t('challenge.shell.upcomingDescription')" icon="clock"><NuxtLink :to="localePath('/challenge/student')" class="challenge-button">{{ $t('challenge.shell.tryStudent') }}</NuxtLink><NuxtLink :to="localePath('/challenge')" class="challenge-button-secondary">{{ $t('challenge.public.overview') }}</NuxtLink></ChallengeEmptyState></div></div></template>
