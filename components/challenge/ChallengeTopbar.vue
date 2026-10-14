<script setup lang="ts">
import type { ChallengeRole } from '~/types/challenge'
const { role, state, ready } = useChallenge()
const { locale, setLocale } = useI18n()
const localePath = useLocalePath()
const { toggle } = useSidebar()
const drawer = useState('challenge-drawer', () => false)
const auditOpen = ref(false)
const simulatorOpen = ref(false)
const roles: ChallengeRole[] = ['public', 'student', 'school', 'judge', 'admin']
const roleHomes = { public: '/challenge', student: '/challenge/student', school: '/challenge/school', judge: '/challenge/judge', admin: '/challenge/admin' }
const changeRole = (event: Event) => navigateTo(localePath(roleHomes[(event.target as HTMLSelectElement).value as ChallengeRole]))
const route = useRoute()
const breadcrumb = computed(() => {
  const parts = route.path.replace(/^\/ar(?=\/)/, '').split('/').filter(Boolean)
  const section = parts[1]
  const page = parts[2]
  if (section === 'student' && page) return `student.${page}.title`
  if (section === 'school' && page) return `school.${page === 'training' ? 'training' : 'submissions'}Title`
  if (section === 'admin' && page) return `admin.${page}Title`
  if (section === 'results') return 'results.title'
  return undefined
})
</script>
<template>
  <header class="border-b border-gray-200 bg-[#f2f0fe] px-5 py-3 lg:px-8">
    <div class="flex flex-wrap items-center gap-3">
      <div class="hidden lg:block"><button type="button" class="challenge-icon-button" :aria-label="$t('challenge.shell.toggleSidebar')" @click="toggle"><AppIcon name="sidebar" class="h-5 w-5" /></button></div>
      <div class="lg:hidden"><button type="button" class="challenge-icon-button" :aria-label="$t('challenge.shell.navigation')" @click="drawer = true"><AppIcon name="menu" class="h-5 w-5" /></button></div>
      <nav class="flex min-w-0 flex-1 items-center gap-2 text-sm" :aria-label="$t('challenge.shell.breadcrumb')"><NuxtLink :to="localePath('/challenge')" class="font-semibold text-heading">{{ $t('challenge.shell.title') }}</NuxtLink><span class="hidden sm:inline">/</span><span class="hidden sm:inline">{{ $t(breadcrumb ? `challenge.${breadcrumb}` : `challenge.roles.${role}`) }}</span></nav>
      <ChallengeStatusPill v-if="ready && state" tone="brand">{{ $t(`challenge.phases.${state.competition.phase}`) }}</ChallengeStatusPill>
      <div class="ms-auto flex gap-1 rounded-xl border border-gray-200 bg-white p-1"><button v-for="lang in (['en', 'ar'] as const)" :key="lang" type="button" class="rounded-lg px-2.5 py-1.5 text-xs font-bold" :class="locale === lang ? 'bg-brand-dark text-white' : 'text-text hover:text-brand-deep'" :aria-pressed="locale === lang" @click="setLocale(lang)">{{ lang.toUpperCase() }}</button></div>
    </div>
    <div v-if="ready" class="mt-3 flex flex-wrap items-end gap-3 border-t border-brand/10 pt-3">
      <div class="min-w-[125px] flex-1 sm:max-w-[175px]"><label for="challenge-role" class="mb-1 block text-xs font-medium">{{ $t('challenge.shell.viewAs') }}</label><select id="challenge-role" :value="role" class="challenge-field !min-h-9 !py-1 text-xs" @change="changeRole"><option v-for="item in roles" :key="item" :value="item">{{ $t(`challenge.roles.${item}`) }}</option></select></div>
      <ChallengePersonaSwitcher class="min-w-[160px] flex-[2] sm:max-w-[260px]" />
      <ChallengeDemoMenu class="ms-auto" />
      <template v-if="role === 'admin'"><button type="button" class="challenge-icon-button" :title="$t('challenge.audit.title')" :aria-label="$t('challenge.audit.title')" @click="auditOpen = true"><AppIcon name="history" class="h-5 w-5" /></button><button type="button" class="challenge-icon-button" :title="$t('challenge.simulator.title')" :aria-label="$t('challenge.simulator.title')" @click="simulatorOpen = true"><AppIcon name="flask" class="h-5 w-5" /></button></template>
    </div>
  </header>
  <template v-if="role === 'admin'"><ChallengeAuditLogModal v-model="auditOpen" /><ChallengeSimulatorModal v-model="simulatorOpen" /></template>
</template>
