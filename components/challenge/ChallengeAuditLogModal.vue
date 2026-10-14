<script setup lang="ts">
import type { ChallengeRole, AuditLogItem } from '~/types/challenge'
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { state } = useChallenge()
const { lt, date, number } = useChallengeFormat()
const { t } = useI18n()
const search = ref('')
const role = ref('all')
const action = ref('all')
const roles: ChallengeRole[] = ['public', 'student', 'school', 'judge', 'admin']
const actions = computed(() => [...new Set(state.value?.auditLog.map(item => item.action) || [])].sort())
const filtered = computed(() => [...(state.value?.auditLog || [])].reverse().filter(item => (role.value === 'all' || item.role === role.value) && (action.value === 'all' || item.action === action.value) && `${lt(item.actorName)} ${t(`challenge.audit.actions.${item.action}`)} ${item.entityId || ''} ${item.note}`.toLowerCase().includes(search.value.toLowerCase())))
const groups = computed(() => {
  const days = new Map<string, AuditLogItem[]>()
  for (const item of filtered.value) { const day = item.timestamp.slice(0, 10); days.set(day, [...(days.get(day) || []), item]) }
  return [...days].map(([day, items]) => ({ day, items }))
})
</script>
<template>
  <ChallengeModal :model-value="modelValue" :title="$t('challenge.audit.title')" wide @update:model-value="emit('update:modelValue', $event)"><p class="mb-5 text-sm leading-relaxed">{{ $t('challenge.audit.intro') }}</p><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_230px]"><div><label for="audit-search" class="challenge-label">{{ $t('challenge.admin.search') }}</label><input id="audit-search" v-model="search" type="search" class="challenge-field" :placeholder="$t('challenge.audit.searchPlaceholder')" /></div><div><label for="audit-role" class="challenge-label">{{ $t('challenge.audit.role') }}</label><select id="audit-role" v-model="role" class="challenge-field"><option value="all">{{ $t('challenge.audit.allRoles') }}</option><option v-for="item in roles" :key="item" :value="item">{{ $t(`challenge.roles.${item}`) }}</option></select></div><div><label for="audit-action" class="challenge-label">{{ $t('challenge.audit.action') }}</label><select id="audit-action" v-model="action" class="challenge-field"><option value="all">{{ $t('challenge.audit.allActions') }}</option><option v-for="item in actions" :key="item" :value="item">{{ $t(`challenge.audit.actions.${item}`) }}</option></select></div></div><p class="my-5 text-xs">{{ $t('challenge.audit.resultCount', { count: number(filtered.length) }) }}</p><div v-if="groups.length" class="space-y-7"><section v-for="group in groups" :key="group.day"><h3 class="mb-4 font-bold text-heading">{{ date(group.day) }}</h3><ol class="space-y-4 border-s border-brand/20 ps-5"><li v-for="item in group.items" :key="item.id" class="relative border-b border-gray-100 pb-4 last:border-0"><span class="absolute -start-[25px] top-1.5 h-2 w-2 rounded-full bg-brand" /><div class="flex flex-wrap items-start justify-between gap-3"><div><strong class="text-sm">{{ $t(`challenge.audit.actions.${item.action}`) }}</strong><p class="mt-1 text-xs">{{ lt(item.actorName) }} · {{ $t(`challenge.roles.${item.role}`) }}</p></div><time class="text-xs">{{ date(item.timestamp, { timeStyle: 'short' }) }}</time></div><p v-if="item.entityId" class="mt-2 text-xs">{{ $t('challenge.audit.entity') }}: <bdi>{{ item.entityId }}</bdi></p><p v-if="item.note" class="mt-2 break-words rounded-lg bg-brand/5 p-3 text-sm" dir="auto">{{ item.note }}</p></li></ol></section></div><ChallengeEmptyState v-else :title="$t('challenge.admin.noMatches')" :description="$t('challenge.admin.adjustFilters')" icon="history" /></ChallengeModal>
</template>
