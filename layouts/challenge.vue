<script setup lang="ts">
const { t } = useI18n()
const { ready, init } = useChallenge()
onMounted(init)
useHead(() => ({ title: `${t('challenge.shell.title')} - Gaming Lab`, meta: [{ name: 'robots', content: 'noindex, nofollow' }] }))
</script>
<template>
  <ChallengeSurface class="min-h-screen bg-[#f2f0fe] text-text lg:flex">
    <a href="#challenge-main" class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-white focus:p-4">{{ $t('challenge.shell.skip') }}</a>
    <ChallengeSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <ChallengeTopbar class="sticky top-0 z-30" />
      <main id="challenge-main" class="min-w-0 flex-1" tabindex="-1"><slot v-if="ready" /><ChallengePageSkeleton v-else /></main>
      <footer class="challenge-page !py-5 text-xs text-text">{{ $t('challenge.shell.demoNotice') }}</footer>
    </div>
    <ChallengeToaster />
  </ChallengeSurface>
</template>
<style>
/* Shared styles live in ChallengeSurface; keep this block for existing Vite HMR style imports. */
</style>
