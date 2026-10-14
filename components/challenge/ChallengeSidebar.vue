<script setup lang="ts">
const { role } = useChallenge()
const route = useRoute()
const localePath = useLocalePath()
const { collapsed } = useSidebar()
const drawer = useState('challenge-drawer', () => false)
const { t } = useI18n()
const items = computed(() => {
  const group = {
    public: [['public.overview', '/challenge', 'gamepad'], ['results.title', '/challenge/results', 'trophy']],
    student: [['student.team.title', '/challenge/student', 'users'], ['student.training.title', '/challenge/student/training', 'book-open'], ['student.submission.title', '/challenge/student/submission', 'upload']],
    school: [['school.title', '/challenge/school', 'building'], ['school.trainingTitle', '/challenge/school/training', 'book-open'], ['school.submissionsTitle', '/challenge/school/submissions', 'upload']],
    judge: [['judge.title', '/challenge/judge', 'scale']],
    admin: [['admin.title', '/challenge/admin', 'grid'], ['admin.governanceTitle', '/challenge/admin/governance', 'shield-check'], ['admin.judgingTitle', '/challenge/admin/judging', 'scale'], ['admin.resultsTitle', '/challenge/admin/results', 'trophy'], ['admin.reportsTitle', '/challenge/admin/reports', 'chart-bar']],
  }
  return group[role.value].map(([label, to, icon]) => ({ label: t(`challenge.${label}`), to: localePath(to!), icon: icon! }))
})
const active = (to: string) => route.path.replace(/\/$/, '') === to.replace(/\/$/, '')
watch(() => route.fullPath, () => { drawer.value = false })
const dialog = ref<HTMLDialogElement | null>(null)
let previousOverflow: string | undefined
const restore = () => { if (previousOverflow !== undefined) { document.body.style.overflow = previousOverflow; previousOverflow = undefined } }
watch(drawer, async open => {
  await nextTick()
  if (open && !dialog.value?.open) { previousOverflow = document.body.style.overflow; dialog.value?.showModal(); document.body.style.overflow = 'hidden' }
  else if (!open && dialog.value?.open) { dialog.value.close(); restore() }
})
onBeforeUnmount(() => { if (import.meta.client) { dialog.value?.close(); restore() } })
</script>
<template>
  <aside class="sticky top-2 m-2 hidden h-[calc(100vh-1rem)] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white lg:flex" :class="collapsed ? 'w-[72px]' : 'w-64'">
    <NuxtLink :to="localePath('/challenge')" class="flex min-h-[76px] items-center gap-3 border-b border-gray-100 p-4" :aria-label="$t('challenge.shell.title')">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white"><AppIcon name="gamepad" class="h-5 w-5" /></span>
      <div v-if="!collapsed" class="min-w-0"><strong class="block text-heading">Gaming Lab</strong><span class="text-xs text-text">{{ $t('challenge.shell.title') }}</span></div>
    </NuxtLink>
    <nav class="flex-1 space-y-1 p-3" :aria-label="$t('challenge.shell.navigation')">
      <p v-if="!collapsed" class="mb-3 px-3 pt-3 text-xs font-semibold text-text">{{ $t(`challenge.roles.${role}`) }}</p>
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to" :aria-current="active(item.to) ? 'page' : undefined" :aria-label="item.label" :title="collapsed ? item.label : undefined" class="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold" :class="active(item.to) ? 'bg-brand/10 text-brand-deep' : 'text-text hover:bg-[#f2f0fe]'">
        <AppIcon :name="item.icon" class="h-5 w-5 shrink-0" /><span v-if="!collapsed">{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <NuxtLink :to="localePath('/')" class="m-3 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text hover:bg-[#f2f0fe]" :aria-label="$t('challenge.shell.back')"><AppIcon name="arrow-left" class="h-5 w-5 shrink-0 rtl:-scale-x-100" /><span v-if="!collapsed">{{ $t('challenge.shell.back') }}</span></NuxtLink>
    <div v-if="!collapsed" class="border-t border-gray-100 px-6 py-4"><ChallengeStatusPill tone="brand">{{ $t('challenge.shell.demo') }}</ChallengeStatusPill></div>
  </aside>
  <dialog ref="dialog" class="challenge-drawer lg:hidden" :aria-label="$t('challenge.shell.navigation')" @cancel.prevent="drawer = false" @close="restore(); drawer = false" @click="($event.target === dialog) && (drawer = false)">
    <div class="flex items-center justify-between border-b border-gray-100 p-5"><strong class="text-heading">{{ $t('challenge.shell.title') }}</strong><button class="challenge-icon-button" :aria-label="$t('challenge.shell.close')" @click="drawer = false"><AppIcon name="close" class="h-5 w-5" /></button></div>
    <nav class="space-y-2 p-4" :aria-label="$t('challenge.shell.navigation')"><NuxtLink v-for="item in items" :key="item.to" :to="item.to" :aria-current="active(item.to) ? 'page' : undefined" class="flex min-h-11 items-center gap-3 rounded-xl p-3 font-semibold" :class="active(item.to) ? 'bg-brand/10 text-brand-deep' : 'text-text'"><AppIcon :name="item.icon" class="h-5 w-5" />{{ item.label }}</NuxtLink><NuxtLink :to="localePath('/')" class="mt-6 flex items-center gap-3 p-3"><AppIcon name="arrow-left" class="h-5 w-5 rtl:-scale-x-100" />{{ $t('challenge.shell.back') }}</NuxtLink></nav>
  </dialog>
</template>
<style scoped>
.challenge-drawer { position: fixed; inset-block: 0; inset-inline-start: 0; inset-inline-end: auto; margin: 0; block-size: 100dvh; max-block-size: 100dvh; inline-size: min(320px, 86vw); border: 0; border-start-end-radius: 1rem; border-end-end-radius: 1rem; padding: 0; color: #010028; }
.challenge-drawer::backdrop { background: #01002870; }
</style>
