<script setup lang="ts">
import { CHALLENGE_PHASES, type ChallengePhase } from '~/types/challenge'
definePageMeta({ layout: 'challenge' })
const { state, ready, kpis, anomalies, ties, changePhase } = useChallenge()
const { t } = useI18n()
const { lt, number, date } = useChallengeFormat()
const localePath = useLocalePath()
const { result } = useChallengeToast()
useHead(() => ({ title: `${t('challenge.admin.title')} - Gaming Lab` }))
const phase = ref<ChallengePhase>('judging')
const phaseOpen = ref(false)
const reason = ref('')
const backwards = computed(() => CHALLENGE_PHASES.indexOf(phase.value) < CHALLENGE_PHASES.indexOf(state.value?.competition.phase || 'registration'))
const incomplete = computed(() => state.value?.teams.filter(team => team.memberIds.length < state.value!.competition.minTeamMembers).length || 0)
const pendingTeams = computed(() => state.value?.teams.filter(team => team.approvalStatus === 'pending').length || 0)
const unassigned = computed(() => state.value?.judges.filter(judge => !judge.assignedTeamIds.length).length || 0)
const attention = computed(() => [
  { key: 'pendingSchools', count: kpis.value.pendingSchools, to: 'governance' },
  { key: 'pendingTeams', count: pendingTeams.value, to: 'governance' },
  { key: 'incompleteTeams', count: incomplete.value, to: 'governance' },
  { key: 'anomalies', count: anomalies.value.length, to: 'results' },
  { key: 'ties', count: ties.value.length, to: 'results' },
  { key: 'unassignedJudges', count: unassigned.value, to: 'judging' },
].filter(item => item.count))
const openPhase = () => { phase.value = state.value?.competition.phase || 'registration'; reason.value = ''; phaseOpen.value = true }
const applyPhase = () => { if (result(changePhase(phase.value, reason.value), 'challenge.admin.savedPhase')) phaseOpen.value = false }
</script>
<template>
  <div v-if="ready && state" class="challenge-page space-y-8">
    <div class="flex flex-wrap items-start justify-between gap-5"><div><h1 class="challenge-heading">{{ $t('challenge.admin.title') }}</h1><p class="challenge-subtitle">{{ $t('challenge.admin.overviewIntro') }}</p></div><button type="button" class="challenge-button" @click="openPhase"><AppIcon name="calendar" class="h-4 w-4" />{{ $t('challenge.admin.changePhase') }}</button></div>
    <section class="grid gap-6 lg:grid-cols-[1.1fr_2fr]" :aria-label="$t('challenge.admin.metrics')">
      <div class="rounded-2xl bg-brand-dark p-7 text-white"><p class="text-sm">{{ $t('challenge.admin.eligibleTeams') }}</p><p class="my-3 text-5xl font-bold tabular-nums"><bdi dir="ltr">{{ number(kpis.eligibleTeams) }}<span class="ms-2 text-lg font-medium">/ {{ number(kpis.teams) }}</span></bdi></p><p class="text-sm leading-relaxed">{{ $t('challenge.admin.eligibilityHint') }}</p><NuxtLink :to="localePath('/challenge/admin/judging')" class="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline">{{ $t('challenge.admin.manageJudging') }}<AppIcon name="arrow-right" class="h-4 w-4 rtl:rotate-180" /></NuxtLink></div>
      <div class="challenge-panel grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3"><div v-for="metric in (['schools', 'students', 'submissions', 'judges', 'completedEvaluations', 'approvedSchools'] as const)" :key="metric"><p class="text-sm">{{ $t(`challenge.admin.${metric}`) }}</p><p class="mt-2 text-3xl font-bold tabular-nums text-heading">{{ number(kpis[metric]) }}</p></div></div>
    </section>
    <section class="challenge-panel"><div class="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 class="text-xl font-bold text-heading">{{ $t('challenge.admin.currentPhase') }}</h2><ChallengeStatusPill tone="brand">{{ $t(`challenge.phases.${state.competition.phase}`) }}</ChallengeStatusPill></div><ChallengeLifecycleStepper :phase="state.competition.phase" /><p class="mt-4 text-sm">{{ $t('challenge.admin.phaseHint') }}</p></section>
    <div class="grid items-start gap-6 xl:grid-cols-2"><section class="challenge-panel"><h2 class="text-xl font-bold text-heading">{{ $t('challenge.admin.attention') }}</h2><ul v-if="attention.length" class="mt-3 divide-y divide-gray-100"><li v-for="item in attention" :key="item.key"><NuxtLink :to="localePath(`/challenge/admin/${item.to}`)" class="flex items-center justify-between gap-4 py-4 hover:text-brand-deep"><span>{{ $t(`challenge.admin.${item.key}`) }}</span><ChallengeStatusPill tone="warning">{{ number(item.count) }}</ChallengeStatusPill></NuxtLink></li></ul><p v-else class="mt-4 text-sm">{{ $t('challenge.admin.noAttention') }}</p></section>
      <section class="challenge-panel"><h2 class="text-xl font-bold text-heading">{{ $t('challenge.admin.latestActivity') }}</h2><ol class="mt-4 space-y-4"><li v-for="event in [...state.auditLog].reverse().slice(0, 5)" :key="event.id" class="border-b border-gray-100 pb-4 last:border-0"><div class="flex flex-wrap justify-between gap-2"><strong class="text-sm">{{ $t(`challenge.audit.actions.${event.action}`) }}</strong><time class="text-xs">{{ date(event.timestamp, { dateStyle: 'short', timeStyle: 'short' }) }}</time></div><p class="mt-1 text-xs">{{ lt(event.actorName) }} · {{ $t(`challenge.roles.${event.role}`) }}</p><p v-if="event.note" class="mt-2 break-words text-sm" dir="auto">{{ event.note }}</p></li></ol></section></div>
    <ChallengeModal v-model="phaseOpen" :title="$t('challenge.admin.changePhase')"><form class="space-y-5" @submit.prevent="applyPhase"><div><label for="admin-phase" class="challenge-label">{{ $t('challenge.admin.targetPhase') }}</label><select id="admin-phase" v-model="phase" class="challenge-field"><option v-for="item in CHALLENGE_PHASES" :key="item" :value="item">{{ $t(`challenge.phases.${item}`) }}</option></select></div><p class="rounded-xl bg-brand/5 p-4 text-sm leading-relaxed">{{ $t(phase === 'judging' ? 'challenge.admin.judgingEffect' : phase === 'results' ? 'challenge.admin.resultsEffect' : 'challenge.admin.phaseEffect') }}</p><p v-if="backwards" class="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{{ $t('challenge.admin.backwardEffect') }}</p><div><label for="admin-phase-reason" class="challenge-label">{{ $t(backwards ? 'challenge.admin.requiredReason' : 'challenge.admin.optionalReason') }}</label><textarea id="admin-phase-reason" v-model="reason" class="challenge-field" :required="backwards" :minlength="backwards ? 3 : undefined" rows="3" maxlength="1000" /></div><div class="flex justify-end gap-3"><button type="button" class="challenge-button-secondary" @click="phaseOpen = false">{{ $t('challenge.shell.cancel') }}</button><button class="challenge-button" :disabled="phase === state.competition.phase || (backwards && reason.trim().length < 3)">{{ $t('challenge.admin.confirmPhase') }}</button></div></form></ChallengeModal>
  </div><ChallengePageSkeleton v-else />
</template>
