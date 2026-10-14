<script setup lang="ts">
import type { ChallengePhase, ChallengeSimulatorScenario } from '~/types/challenge'
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { state, runSimulator, teamEligible } = useChallenge()
const { lt, date } = useChallengeFormat()
const { result } = useChallengeToast()
const scenarios: ChallengeSimulatorScenario[] = ['withdrawal', 'attendance', 'extension', 'anomaly', 'tie']
const phases: Record<ChallengeSimulatorScenario, ChallengePhase[]> = { withdrawal: ['team_formation', 'training', 'submission', 'judging'], attendance: ['training', 'submission', 'judging'], extension: ['submission'], anomaly: ['judging'], tie: ['judging', 'results'] }
const scenario = ref<ChallengeSimulatorScenario>('withdrawal')
const teamId = ref('')
const secondTeamId = ref('')
const studentId = ref('')
const reason = ref('')
const allowed = computed(() => phases[scenario.value].includes(state.value?.competition.phase || 'archived'))
const teams = computed(() => (state.value?.teams || []).filter(team => {
  if (scenario.value === 'withdrawal') return team.memberIds.length > 0
  if (scenario.value === 'anomaly' || scenario.value === 'tie') return teamEligible(team.id) && state.value!.submissions.some(item => item.teamId === team.id && item.status !== 'draft') && state.value!.judges.filter(judge => judge.assignedTeamIds.includes(team.id) && judge.schoolId !== team.schoolId).length >= 2
  return true
}))
const members = computed(() => { const team = state.value?.teams.find(item => item.id === teamId.value); return state.value?.students.filter(student => team?.memberIds.includes(student.id)) || [] })
watch([scenario, () => props.modelValue], () => { teamId.value = teams.value[0]?.id || ''; secondTeamId.value = teams.value[1]?.id || ''; reason.value = '' })
watch(teamId, () => { studentId.value = members.value.at(-1)?.id || ''; if (secondTeamId.value === teamId.value) secondTeamId.value = teams.value.find(team => team.id !== teamId.value)?.id || '' })
const valid = computed(() => allowed.value && (scenario.value === 'extension' ? reason.value.trim().length >= 3 : !!teamId.value) && (scenario.value !== 'withdrawal' || !!studentId.value) && (scenario.value !== 'tie' || !!secondTeamId.value && secondTeamId.value !== teamId.value))
const run = () => { const action = runSimulator(scenario.value, { teamId: teamId.value, studentId: studentId.value, teamIds: scenario.value === 'tie' ? [teamId.value, secondTeamId.value] : undefined, reason: reason.value }); if (result(action, 'challenge.simulator.completed')) emit('update:modelValue', false) }
</script>
<template>
  <ChallengeModal :model-value="modelValue" :title="$t('challenge.simulator.title')" @update:model-value="emit('update:modelValue', $event)"><form v-if="state" class="space-y-5" @submit.prevent="run"><p class="text-sm leading-relaxed">{{ $t('challenge.simulator.intro') }}</p><div><label for="simulator-scenario" class="challenge-label">{{ $t('challenge.simulator.scenario') }}</label><select id="simulator-scenario" v-model="scenario" class="challenge-field"><option v-for="item in scenarios" :key="item" :value="item">{{ $t(`challenge.simulator.${item}.title`) }}</option></select></div><div class="rounded-xl bg-brand/5 p-4"><h3 class="font-semibold">{{ $t('challenge.simulator.effect') }}</h3><p class="mt-2 text-sm leading-relaxed">{{ $t(`challenge.simulator.${scenario}.effect`) }}</p></div><p v-if="!allowed" class="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{{ $t('challenge.simulator.locked') }} {{ phases[scenario].map(phase => $t(`challenge.phases.${phase}`)).join(' / ') }}</p>
    <div v-if="scenario !== 'extension'"><label for="simulator-team" class="challenge-label">{{ $t('challenge.admin.team') }}</label><select id="simulator-team" v-model="teamId" class="challenge-field"><option v-for="team in teams" :key="team.id" :value="team.id">{{ lt(team.name) }}</option></select><p v-if="!teams.length" class="mt-2 text-sm text-amber-900">{{ $t('challenge.simulator.noTeams') }}</p></div>
    <div v-if="scenario === 'withdrawal'"><label for="simulator-student" class="challenge-label">{{ $t('challenge.admin.student') }}</label><select id="simulator-student" v-model="studentId" class="challenge-field"><option v-for="student in members" :key="student.id" :value="student.id">{{ lt(student.name) }}</option></select></div>
    <div v-if="scenario === 'tie'"><label for="simulator-second-team" class="challenge-label">{{ $t('challenge.simulator.secondTeam') }}</label><select id="simulator-second-team" v-model="secondTeamId" class="challenge-field"><option v-for="team in teams.filter(item => item.id !== teamId)" :key="team.id" :value="team.id">{{ lt(team.name) }}</option></select></div>
    <p v-if="scenario === 'extension'" class="text-sm">{{ $t('challenge.simulator.currentDeadline') }}: {{ date(state.competition.submissionDeadline, { dateStyle: 'medium', timeStyle: 'short' }) }}</p>
    <div><label for="simulator-reason" class="challenge-label">{{ $t(scenario === 'extension' ? 'challenge.admin.requiredReason' : 'challenge.admin.optionalReason') }}</label><textarea id="simulator-reason" v-model="reason" class="challenge-field" rows="3" :required="scenario === 'extension'" :minlength="scenario === 'extension' ? 3 : undefined" maxlength="1000" /></div><p class="text-xs leading-relaxed">{{ $t('challenge.simulator.auditHint') }}</p><div class="flex justify-end gap-3"><button type="button" class="challenge-button-secondary" @click="emit('update:modelValue', false)">{{ $t('challenge.shell.cancel') }}</button><button class="challenge-button" :disabled="!valid"><AppIcon name="flask" class="h-4 w-4" />{{ $t('challenge.simulator.run') }}</button></div></form></ChallengeModal>
</template>
