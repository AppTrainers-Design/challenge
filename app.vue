<script setup lang="ts">
// <html lang> and dir follow the locale, so Arabic renders right-to-left.
const i18nHead = useLocaleHead({ dir: true, lang: true })
useHead(() => ({ htmlAttrs: i18nHead.value.htmlAttrs }))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
