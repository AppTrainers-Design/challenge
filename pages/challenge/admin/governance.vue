<script setup lang="ts">
import type { ApprovalStatus } from '~/types/challenge'
definePageMeta({ layout: 'challenge' })
const { state, ready, reviewEntity } = useChallenge()
const { t } = useI18n()
const { lt, date, number } = useChallengeFormat()
const { result } = useChallengeToast()
useHead(() => ({ title: `${t('challenge.admin.governanceTitle')} - Gaming Lab` }))
const tab = ref('schools')
const statusFilter = ref('all')
const search = ref('')
const statuses: ApprovalStatus[] = ['pending', 'approved', 'changes_requested', 'rejected']
const items = computed(() => {
  if (!state.value) return []
  const records = tab.value === 'schools' ? state.value.schools.map(school => ({ id: school.id, name: lt(school.name), status: school.approvalStatus, note: school.reviewNote, detail: `${t(`challenge.governorates.${school.governorate}`)} · ${school.email}`, count: state.value!.teams.filter(team => team.schoolId === school.id).length, createdAt: school.registeredAt })) : state.value.teams.map(team => ({ id: team.id, name: lt(team.name), status: team.approvalStatus, note: team.reviewNote, detail: `${lt(state.value!.schools.find(school => school.id === team.schoolId)?.name)} · ${team.ageCategory}`, count: team.memberIds.length, createdAt: team.createdAt }))
  return records.filter(item => (statusFilter.value === 'all' || statusFilter.value === item.status) && `${item.name} ${item.detail}`.toLowerCase().includes(search.value.toLowerCase()))
})
const reviewOpen = ref(false)
const target = ref<{ id: string; name: string; entity: 'school' | 'team' } | null>(null)
const decision = ref<ApprovalStatus>('approved')
const note = ref('')
const needsNote = computed(() => decision.value === 'changes_requested' || decision.value === 'rejected')
const openReview = (item: { id: string; name: string; note: string }) => { target.value = { id: item.id, name: item.name, entity: tab.value === 'schools' ? 'school' : 'team' }; note.value = item.note; decision.value = 'approved'; reviewOpen.value = true }
const applyReview = () => { if (target.value && result(reviewEntity(target.value.entity, target.value.id, decision.value, note.value), 'challenge.admin.reviewSaved')) reviewOpen.value = false }
const tone = (status: ApprovalStatus) => status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : status === 'changes_requested' ? 'warning' : 'neutral'
</script>
<template>
  <div v-if="ready && state" class="challenge-page space-y-7"><div><h1 class="challenge-heading">{{ $t('challenge.admin.governanceTitle') }}</h1><p class="challenge-subtitle">{{ $t('challenge.admin.governanceIntro') }}</p></div><section class="challenge-panel"><ChallengeTabs v-model="tab" :items="[{ id: 'schools', label: $t('challenge.admin.schools') }, { id: 'teams', label: $t('challenge.admin.teams') }]" :label="$t('challenge.admin.governanceTitle')"><div class="mb-6 grid gap-4 sm:grid-cols-[1fr_240px]"><div><label for="admin-entity-search" class="challenge-label">{{ $t('challenge.admin.search') }}</label><input id="admin-entity-search" v-model="search" type="search" class="challenge-field" :placeholder="$t('challenge.admin.searchEntities')" /></div><div><label for="admin-status-filter" class="challenge-label">{{ $t('challenge.admin.approvalStatus') }}</label><select id="admin-status-filter" v-model="statusFilter" class="challenge-field"><option value="all">{{ $t('challenge.admin.allStatuses') }}</option><option v-for="status in statuses" :key="status" :value="status">{{ $t(`challenge.status.${status}`) }}</option></select></div></div>
      <div v-if="items.length" class="space-y-4"><article v-for="item in items" :key="item.id" class="flex flex-wrap items-start gap-4 border-b border-gray-100 py-4 first:pt-0 last:border-0"><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-3"><h2 class="font-bold text-heading">{{ item.name }}</h2><ChallengeStatusPill :tone="tone(item.status)">{{ $t(`challenge.status.${item.status}`) }}</ChallengeStatusPill></div><p class="mt-2 break-words text-sm">{{ item.detail }}</p><p class="mt-2 text-xs">{{ $t(tab === 'schools' ? 'challenge.admin.teamCount' : 'challenge.admin.memberCount', { count: number(item.count) }) }} · {{ date(item.createdAt) }}</p><p v-if="item.note" class="mt-3 rounded-lg bg-brand/5 p-3 text-sm" dir="auto">{{ item.note }}</p></div><button type="button" class="challenge-button-secondary" @click="openReview(item)">{{ $t('challenge.admin.review') }}</button></article></div><ChallengeEmptyState v-else :title="$t('challenge.admin.noMatches')" :description="$t('challenge.admin.adjustFilters')" icon="building" /></ChallengeTabs></section>
    <ChallengeModal v-model="reviewOpen" :title="$t('challenge.admin.review')"><form v-if="target" class="space-y-5" @submit.prevent="applyReview"><p class="font-semibold">{{ target.name }}</p><div><label for="admin-review-decision" class="challenge-label">{{ $t('challenge.admin.decision') }}</label><select id="admin-review-decision" v-model="decision" class="challenge-field"><option v-for="status in statuses" :key="status" :value="status">{{ $t(`challenge.status.${status}`) }}</option></select></div><p class="text-sm">{{ $t('challenge.admin.reviewHint') }}</p><div><label for="admin-review-note" class="challenge-label">{{ $t(needsNote ? 'challenge.admin.requiredNote' : 'challenge.admin.optionalNote') }}</label><textarea id="admin-review-note" v-model="note" rows="4" class="challenge-field" :required="needsNote" :minlength="needsNote ? 3 : undefined" maxlength="1000" /></div><div class="flex justify-end gap-3"><button type="button" class="challenge-button-secondary" @click="reviewOpen = false">{{ $t('challenge.shell.cancel') }}</button><button class="challenge-button" :disabled="needsNote && note.trim().length < 3">{{ $t('challenge.admin.saveDecision') }}</button></div></form></ChallengeModal>
  </div><ChallengePageSkeleton v-else />
</template>
