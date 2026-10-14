<script setup lang="ts">
import type { Student, Team } from '~/types/challenge'

const props = defineProps<{ modelValue: boolean; team: Team | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const { t } = useI18n()
const { lt, number, date } = useChallengeFormat()
const toast = useChallengeToast()
const { state, currentSchool, addSchoolStudent, removeSchoolStudent, setTeamLeader, studentProgress } = useChallenge()
const formId = useId()
const roster = computed(() => (state.value?.students ?? []).filter(student => props.team?.memberIds.includes(student.id)))
const canManage = computed(() => !!props.team && props.team.schoolId === currentSchool.value?.id && currentSchool.value?.approvalStatus === 'approved' && state.value?.competition.phase === 'team_formation')
const maxMembers = computed(() => state.value?.competition.maxTeamMembers ?? 5)
const canAdd = computed(() => canManage.value && roster.value.length < maxMembers.value)
const error = ref('')
const removeOpen = ref(false)
const removeId = ref<string | null>(null)
const removedStudent = computed(() => roster.value.find(student => student.id === removeId.value) ?? null)
const empty = () => ({ name: '', email: '', nationalId: '', dateOfBirth: '', grade: 7, guardianConsent: false })
const form = reactive(empty())
const ageRange = computed(() => `\u2066${props.team?.ageCategory.replace('-', '–') ?? ''}\u2069`)
const birthMax = new Date().toISOString().slice(0, 10)

watch(() => [props.modelValue, props.team?.id, currentSchool.value?.id], () => { Object.assign(form, empty()); error.value = ''; removeOpen.value = false; removeId.value = null })
watch(() => props.modelValue, open => { if (!open) removeOpen.value = false })
function add() {
  error.value = ''
  if (!props.team) return
  const result = addSchoolStudent(props.team.id, { ...form, grade: Number(form.grade) })
  if (toast.result(result, 'challenge.school.toasts.studentAdded')) Object.assign(form, empty())
  else error.value = t(result.errorKey ?? 'challenge.toasts.failed')
}
function makeLeader(student: Student) {
  if (props.team) toast.result(setTeamLeader(props.team.id, student.id), 'challenge.school.toasts.leaderUpdated')
}
function requestRemoval(student: Student) { removeId.value = student.id; removeOpen.value = true }
function remove() {
  if (props.team && removeId.value) toast.result(removeSchoolStudent(props.team.id, removeId.value), 'challenge.school.toasts.studentRemoved')
  removeId.value = null
}
function nationalInput(event: Event) {
  const input = event.target as HTMLInputElement
  form.nationalId = input.value.replace(/\D/g, '').slice(0, 10)
  input.value = form.nationalId
  error.value = ''
}
</script>

<template>
  <ChallengeModal :model-value="modelValue" :title="team ? t('challenge.school.roster.title', { team: lt(team.name) }) : t('challenge.school.manageRoster')" wide @update:model-value="emit('update:modelValue', $event)">
    <ChallengeEmptyState v-if="!team" :title="t('challenge.school.roster.noTeamTitle')" :description="t('challenge.school.roster.noTeamHelp')" icon="users" />
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-text"><p>{{ t('challenge.school.ageCategory', { range: ageRange }) }}</p><i18n-t keypath="challenge.school.memberCount" tag="p" class="tabular-nums"><template #ratio><bdi dir="ltr">{{ number(roster.length) }} / {{ number(maxMembers) }}</bdi></template></i18n-t></div>
      <div v-if="!canManage" class="mt-4 flex gap-2 rounded-xl bg-brand/5 p-3 text-sm leading-relaxed text-text" role="status"><AppIcon name="lock" class="mt-0.5 h-4 w-4 shrink-0" /><p>{{ currentSchool?.approvalStatus !== 'approved' ? t('challenge.school.approvalRequired') : t('challenge.shell.lockedPhase', { phase: t('challenge.phases.team_formation') }) }}</p></div>
      <p class="mt-4 text-xs leading-relaxed text-text">{{ t('challenge.school.roster.reviewHelp') }}</p>

      <ul v-if="roster.length" class="mt-4 divide-y divide-brand/10">
        <li v-for="student in roster" :key="student.id" class="py-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0"><p class="flex flex-wrap items-center gap-2 font-semibold text-heading"><span class="break-words">{{ lt(student.name) }}</span><ChallengeStatusPill v-if="team.leaderId === student.id" tone="brand">{{ t('challenge.school.roster.leader') }}</ChallengeStatusPill></p><p class="mt-1 break-all text-xs text-text"><bdi>{{ student.email }}</bdi></p></div>
            <div class="flex flex-wrap gap-2"><button type="button" class="challenge-button-secondary" :disabled="!canManage || team.leaderId === student.id" @click="makeLeader(student)">{{ t('challenge.school.roster.makeLeader') }}</button><button type="button" class="challenge-icon-button text-red-700" :disabled="!canManage" :aria-label="t('challenge.school.roster.removeLabel', { student: lt(student.name) })" @click="requestRemoval(student)"><AppIcon name="trash" class="h-5 w-5" /></button></div>
          </div>
          <dl class="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 text-xs sm:grid-cols-4">
            <div><dt class="text-text">{{ t('challenge.school.roster.nationalId') }}</dt><dd class="mt-1 text-heading"><bdi>{{ student.nationalId }}</bdi></dd></div>
            <div><dt class="text-text">{{ t('challenge.school.roster.birthDate') }}</dt><dd class="mt-1 text-heading">{{ date(student.dateOfBirth) }}</dd></div>
            <div><dt class="text-text">{{ t('challenge.school.roster.grade') }}</dt><dd class="mt-1 text-heading">{{ number(student.grade) }}</dd></div>
            <div><dt class="text-text">{{ t('challenge.school.roster.training') }}</dt><dd class="mt-1 font-semibold text-heading">{{ number(studentProgress(student.id), { maximumFractionDigits: 1 }) }}%</dd></div>
          </dl>
          <p class="mt-3 flex items-center gap-1.5 text-xs" :class="student.guardianConsent ? 'text-accent-deep' : 'text-red-700'"><AppIcon :name="student.guardianConsent ? 'check' : 'alert-triangle'" class="h-3.5 w-3.5" />{{ t(student.guardianConsent ? 'challenge.school.roster.consentReceived' : 'challenge.school.roster.consentMissing') }}</p>
        </li>
      </ul>
      <ChallengeEmptyState v-else :title="t('challenge.school.roster.noMembersTitle')" :description="t('challenge.school.roster.noMembersHelp')" icon="users" />

      <form class="mt-6 border-t border-brand/10 pt-6" @submit.prevent="add" @input="error = ''">
        <h3 class="text-lg font-bold text-heading">{{ t('challenge.school.roster.addStudent') }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-text">{{ t('challenge.school.roster.addHelp', { range: ageRange }) }}</p>
        <p v-if="roster.length >= maxMembers" class="mt-3 text-sm font-semibold text-brand-deep" role="status">{{ t('challenge.school.roster.full', { maximum: number(maxMembers) }) }}</p>
        <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label :for="`${formId}-name`" class="challenge-label">{{ t('challenge.school.roster.name') }}</label><input :id="`${formId}-name`" v-model="form.name" class="challenge-field" maxlength="100" minlength="2" required :disabled="!canAdd"></div>
          <div><label :for="`${formId}-email`" class="challenge-label">{{ t('challenge.school.roster.email') }}</label><input :id="`${formId}-email`" v-model="form.email" class="challenge-field" type="email" dir="ltr" maxlength="160" required :disabled="!canAdd"></div>
          <div><label :for="`${formId}-national`" class="challenge-label">{{ t('challenge.school.roster.nationalId') }}</label><input :id="`${formId}-national`" :value="form.nationalId" class="challenge-field" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" minlength="10" dir="ltr" required :disabled="!canAdd" :aria-describedby="`${formId}-national-help`" @input="nationalInput"><p :id="`${formId}-national-help`" class="mt-2 text-xs text-text">{{ t('challenge.school.roster.nationalHelp') }}</p></div>
          <div><label :for="`${formId}-birth`" class="challenge-label">{{ t('challenge.school.roster.birthDate') }}</label><input :id="`${formId}-birth`" v-model="form.dateOfBirth" class="challenge-field" type="date" :max="birthMax" dir="ltr" required :disabled="!canAdd"></div>
          <div><label :for="`${formId}-grade`" class="challenge-label">{{ t('challenge.school.roster.grade') }}</label><select :id="`${formId}-grade`" v-model.number="form.grade" class="challenge-field" :disabled="!canAdd"><option v-for="grade in [7, 8, 9, 10, 11, 12]" :key="grade" :value="grade">{{ number(grade) }}</option></select></div>
          <label class="flex cursor-pointer items-start gap-3 self-center py-2 text-sm leading-relaxed text-heading"><input v-model="form.guardianConsent" type="checkbox" required class="mt-1 h-4 w-4 shrink-0 accent-[#6B4AEE]" :disabled="!canAdd"><span>{{ t('challenge.school.roster.consent') }}</span></label>
        </div>
        <p v-if="error" class="mt-4 text-sm text-red-700" role="alert">{{ error }}</p>
        <div class="mt-6 flex flex-wrap justify-end gap-3"><button type="button" class="challenge-button-secondary" @click="emit('update:modelValue', false)">{{ t('challenge.shell.close') }}</button><button type="submit" class="challenge-button" :disabled="!canAdd"><AppIcon name="user-plus" class="h-4 w-4" />{{ t('challenge.school.roster.addStudent') }}</button></div>
      </form>
    </template>
  </ChallengeModal>
  <ChallengeConfirm v-model="removeOpen" :title="t('challenge.school.roster.removeTitle')" :message="t('challenge.school.roster.removeWarning', { student: removedStudent ? lt(removedStudent.name) : '' })" :confirm-label="t('challenge.school.roster.remove')" @confirm="remove" />
</template>
