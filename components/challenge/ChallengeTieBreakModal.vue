<script setup lang="ts">
import { calculateRankings } from '~/utils/challengeScoring'
const props = defineProps<{ modelValue: boolean; teamIds: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { state, resolveTie } = useChallenge()
const { lt, number } = useChallengeFormat()
const { result } = useChallengeToast()
const priority = ref<string[]>([])
const order = ref<string[]>([])
const note = ref('')
watch(() => props.modelValue, open => { if (open) { priority.value = [...(state.value?.competition.criterionPriority || [])]; for (const criterion of state.value?.criteria || []) if (!priority.value.includes(criterion.id)) priority.value.push(criterion.id); order.value = [...props.teamIds]; note.value = '' } })
const move = (list: string[], index: number, direction: number) => { const next = index + direction; if (next < 0 || next >= list.length) return; [list[index], list[next]] = [list[next]!, list[index]!] }
const preview = computed(() => {
  if (!state.value) return []
  const copy = JSON.parse(JSON.stringify(state.value))
  copy.competition.criterionPriority = [...priority.value]
  copy.tieBreakResolutions.push({ id: 'preview', teamIds: props.teamIds, orderedTeamIds: order.value, criterionPriority: priority.value, note: note.value, createdAt: new Date().toISOString() })
  return calculateRankings(copy).filter(row => props.teamIds.includes(row.teamId))
})
const save = () => { if (result(resolveTie(props.teamIds, order.value, priority.value, note.value), 'challenge.admin.tieResolved')) emit('update:modelValue', false) }
</script>
<template>
  <ChallengeModal :model-value="modelValue" :title="$t('challenge.admin.breakTie')" wide @update:model-value="emit('update:modelValue', $event)"><form v-if="state" class="space-y-6" @submit.prevent="save"><p class="text-sm leading-relaxed">{{ $t('challenge.admin.tieHint') }}</p><div class="grid gap-6 md:grid-cols-2"><section><h3 class="mb-3 font-bold">{{ $t('challenge.admin.criterionPriority') }}</h3><ol class="divide-y divide-gray-100"><li v-for="(id, index) in priority" :key="id" class="flex items-center gap-2 py-3"><span class="min-w-0 flex-1 text-sm">{{ number(index + 1) }}. {{ lt(state.criteria.find(item => item.id === id)?.name) }}</span><button type="button" class="challenge-icon-button" :disabled="index === 0" :aria-label="$t('challenge.admin.moveUp')" @click="move(priority, index, -1)"><AppIcon name="arrow-left" class="h-4 w-4 rotate-90" /></button><button type="button" class="challenge-icon-button" :disabled="index === priority.length - 1" :aria-label="$t('challenge.admin.moveDown')" @click="move(priority, index, 1)"><AppIcon name="arrow-right" class="h-4 w-4 rotate-90" /></button></li></ol></section><section><h3 class="mb-3 font-bold">{{ $t('challenge.admin.manualOrder') }}</h3><ol class="divide-y divide-gray-100"><li v-for="(id, index) in order" :key="id" class="flex items-center gap-2 py-3"><span class="min-w-0 flex-1 text-sm">{{ number(index + 1) }}. {{ lt(state.teams.find(item => item.id === id)?.name) }}</span><button type="button" class="challenge-icon-button" :disabled="index === 0" :aria-label="$t('challenge.admin.moveUp')" @click="move(order, index, -1)"><AppIcon name="arrow-left" class="h-4 w-4 rotate-90" /></button><button type="button" class="challenge-icon-button" :disabled="index === order.length - 1" :aria-label="$t('challenge.admin.moveDown')" @click="move(order, index, 1)"><AppIcon name="arrow-right" class="h-4 w-4 rotate-90" /></button></li></ol></section></div><section class="rounded-xl bg-brand/5 p-4"><h3 class="font-bold">{{ $t('challenge.admin.resultPreview') }}</h3><ol class="mt-3 space-y-2"><li v-for="row in preview" :key="row.teamId" class="flex justify-between gap-3 text-sm"><span>{{ number(row.rank) }}. {{ lt(state.teams.find(team => team.id === row.teamId)?.name) }}</span><strong><bdi dir="ltr">{{ number(row.score) }} / {{ number(100) }}</bdi></strong></li></ol></section><div><label for="tie-note" class="challenge-label">{{ $t('challenge.admin.requiredNote') }}</label><textarea id="tie-note" v-model="note" rows="3" class="challenge-field" required minlength="3" maxlength="1000" /></div><div class="flex justify-end gap-3"><button type="button" class="challenge-button-secondary" @click="emit('update:modelValue', false)">{{ $t('challenge.shell.cancel') }}</button><button class="challenge-button" :disabled="note.trim().length < 3">{{ $t('challenge.admin.saveTie') }}</button></div></form></ChallengeModal>
</template>
