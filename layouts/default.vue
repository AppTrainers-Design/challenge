<script setup lang="ts">
// Stands in for gaming-lab-fe's default layout, whose header and footer need the
// site's API and login. The public challenge pages only need a frame and a way
// to switch language; the switch matches the one in ChallengeTopbar.
const { locale, setLocale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <NuxtLink :to="localePath('/challenge')" class="flex items-center gap-2 text-base font-extrabold text-heading">
          <img src="~/assets/images/edge-icon.png" alt="" width="32" height="32" class="h-8 w-8" />
          Gaming Lab
        </NuxtLink>
        <div class="ms-auto flex gap-1 rounded-xl border border-gray-200 bg-white p-1"><button v-for="lang in (['en', 'ar'] as const)" :key="lang" type="button" class="rounded-lg px-2.5 py-1.5 text-xs font-bold" :class="locale === lang ? 'bg-brand-dark text-white' : 'text-text hover:text-brand-deep'" :aria-pressed="locale === lang" @click="setLocale(lang)">{{ lang.toUpperCase() }}</button></div>
      </div>
    </header>
    <main class="flex-grow">
      <slot />
    </main>
  </div>
</template>
