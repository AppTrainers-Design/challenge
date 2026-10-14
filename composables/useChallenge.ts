import { computed, effectScope, watch } from 'vue'
import { CHALLENGE_PHASES } from '../types/challenge'
import type { AgeCategory, ChallengeActionResult, ChallengePhase, ChallengeRole, ChallengeState, LocalizedText, RegisterSchoolInput, Student, SubmissionContent, Team } from '../types/challenge'
import { createChallengeSeed } from '../utils/challengeSeed'
import { calculateRankings, calculateStudentProgress, calculateTeamProgress, calculateTies, isTeamEligible } from '../utils/challengeScoring'
import { createChallengeManagement } from '../utils/challengeManagement'

const STORAGE_KEY = 'glab-challenge:v1'
const persistence = new WeakMap<object, { timer: ReturnType<typeof setTimeout> | null; failed: boolean }>()
const phases = new Set<string>(CHALLENGE_PHASES)
const governorates = new Set(['amman', 'irbid', 'zarqa', 'aqaba', 'karak', 'balqa', 'madaba', 'mafraq', 'jerash', 'ajloun', 'tafilah', 'maan'])
const approvedStatuses = new Set(['pending', 'approved', 'changes_requested', 'rejected'])
const localized = (value: string): LocalizedText => ({ en: value, ar: value })
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const record = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value)
const string = (value: unknown): value is string => typeof value === 'string'
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(string)
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const validDate = (value: unknown) => string(value) && Number.isFinite(Date.parse(value))
const nullableDate = (value: unknown) => value === null || validDate(value)
const localizedText = (value: unknown) => record(value) && string(value.en) && string(value.ar)
const textMap = (value: unknown) => record(value) && Object.values(value).every(string)
const scoreMap = (value: unknown) => record(value) && Object.values(value).every(number)
const identity = (value: unknown): value is Record<string, any> & { id: string } => record(value) && string(value.id) && !!value.id
const uniqueIds = (items: { id: string }[]) => new Set(items.map(item => item.id)).size === items.length
const inviteFromNumber = (value: number) => {
  let code = ''
  for (let position = 0; position < 6; position++) {
    code = String.fromCharCode(65 + value % 26) + code
    value = Math.floor(value / 26)
  }
  return code
}

function validContent(value: unknown): value is SubmissionContent {
  if (!record(value)) return false
  return localizedText(value.title) && localizedText(value.description)
    && ['genre', 'platform', 'buildUrl', 'packageUrl', 'repositoryUrl', 'gddUrl', 'presentationUrl', 'coverUrl', 'trailerUrl'].every(key => string(value[key]))
    && stringArray(value.screenshotUrls)
}

/** Persisted data is untrusted. Check the version and every structure the UI consumes. */
export function isValidChallengeState(value: unknown): value is ChallengeState {
  if (!record(value) || value.version !== 1 || !validDate(value.seededAt) || !Number.isSafeInteger(value.nextId) || value.nextId < 1000) return false
  const competition = value.competition
  if (!identity(competition) || !localizedText(competition.title) || !localizedText(competition.description) || !phases.has(competition.phase)
    || !['registrationDeadline', 'submissionDeadline', 'judgingDeadline', 'resultsDate'].every(key => validDate(competition[key]))
    || !Array.isArray(competition.ageCategories) || !competition.ageCategories.every((age: unknown) => age === '12-14' || age === '15-18')
    || !number(competition.minTeamMembers) || !number(competition.maxTeamMembers) || !number(competition.trainingThreshold)
    || typeof competition.blindJudging !== 'boolean' || !['hidden', 'published'].includes(competition.resultsVisibility) || !stringArray(competition.criterionPriority)) return false
  const collections = ['schools', 'teams', 'students', 'judges', 'trainingProgress', 'submissions', 'criteria', 'evaluations', 'awards', 'tieBreakResolutions', 'auditLog']
  if (!collections.every(key => Array.isArray(value[key]))) return false
  if (!value.schools.every((item: unknown) => identity(item) && localizedText(item.name) && governorates.has(item.governorate) && ['public', 'private', 'international'].includes(item.type) && localizedText(item.contactName) && string(item.email) && string(item.phone) && number(item.expectedStudents) && approvedStatuses.has(item.approvalStatus) && string(item.reviewNote) && validDate(item.registeredAt))) return false
  if (!value.students.every((item: unknown) => identity(item) && string(item.schoolId) && (item.teamId === null || string(item.teamId)) && localizedText(item.name) && string(item.email) && string(item.nationalId) && validDate(item.dateOfBirth) && number(item.grade) && typeof item.guardianConsent === 'boolean')) return false
  if (!value.teams.every((item: unknown) => identity(item) && string(item.schoolId) && localizedText(item.name) && ['12-14', '15-18'].includes(item.ageCategory) && string(item.inviteCode) && stringArray(item.memberIds) && (item.leaderId === null || string(item.leaderId)) && approvedStatuses.has(item.approvalStatus) && string(item.reviewNote) && validDate(item.createdAt) && Array.isArray(item.devlog) && item.devlog.every((entry: unknown) => identity(entry) && string(entry.studentId) && localizedText(entry.text) && validDate(entry.createdAt)))) return false
  if (!value.judges.every((item: unknown) => identity(item) && localizedText(item.name) && string(item.email) && localizedText(item.expertise) && (item.schoolId === null || string(item.schoolId)) && stringArray(item.assignedTeamIds))) return false
  const course = value.course
  if (!identity(course) || !localizedText(course.title) || !localizedText(course.description) || !Array.isArray(course.sessions) || !Array.isArray(course.quizQuestions)) return false
  if (!course.sessions.every((item: unknown) => identity(item) && localizedText(item.title) && localizedText(item.description) && ['live', 'in_person', 'recorded'].includes(item.mode) && validDate(item.startsAt) && number(item.durationMinutes) && localizedText(item.assignment) && string(item.resourceUrl))) return false
  if (!course.quizQuestions.every((item: unknown) => identity(item) && localizedText(item.text) && string(item.correctOptionId) && Array.isArray(item.options) && item.options.length > 0 && item.options.every((option: unknown) => identity(option) && localizedText(option.text)) && item.options.some((option: any) => option.id === item.correctOptionId))) return false
  if (!value.trainingProgress.every((item: unknown) => record(item) && string(item.studentId) && stringArray(item.attendedSessionIds) && stringArray(item.completedAssignmentIds) && (item.quizScore === null || number(item.quizScore) && item.quizScore >= 0 && item.quizScore <= 100) && textMap(item.quizAnswers) && nullableDate(item.quizSubmittedAt))) return false
  if (!value.submissions.every((item: unknown) => identity(item) && string(item.teamId) && validContent(item.content) && ['draft', 'submitted', 'locked'].includes(item.status) && validDate(item.updatedAt) && nullableDate(item.submittedAt) && nullableDate(item.lockedAt) && Array.isArray(item.versions) && item.versions.every((version: unknown) => identity(version) && string(version.version) && string(version.label) && validContent(version.content) && validDate(version.savedAt) && validDate(version.createdAt) && string(version.savedBy)))) return false
  if (!value.criteria.every((item: unknown) => identity(item) && localizedText(item.name) && localizedText(item.description) && number(item.weight) && item.weight >= 0 && item.weight <= 100)) return false
  if (!value.evaluations.every((item: unknown) => identity(item) && string(item.judgeId) && string(item.teamId) && scoreMap(item.scores) && string(item.strengths) && string(item.improvements) && string(item.recommendation) && ['draft', 'submitted'].includes(item.status) && validDate(item.updatedAt) && nullableDate(item.submittedAt) && nullableDate(item.lockedAt))) return false
  if (!value.awards.every((item: unknown) => identity(item) && ['game_design', 'story', 'technical', 'art', 'mechanics', 'audience'].includes(item.key) && localizedText(item.name) && (item.teamId === null || string(item.teamId)))) return false
  if (!value.tieBreakResolutions.every((item: unknown) => identity(item) && stringArray(item.teamIds) && stringArray(item.orderedTeamIds) && stringArray(item.criterionPriority) && string(item.note) && validDate(item.createdAt))) return false
  if (!value.auditLog.every((item: unknown) => identity(item) && validDate(item.timestamp) && (item.actorId === null || string(item.actorId)) && localizedText(item.actorName) && ['public', 'school', 'student', 'judge', 'admin'].includes(item.role) && string(item.action) && string(item.entityType) && (item.entityId === null || string(item.entityId)) && string(item.note))) return false
  if (!record(value.personas) || !['schoolId', 'studentId', 'judgeId'].every(key => value.personas[key] === null || string(value.personas[key]))) return false
  if (!['schools', 'students', 'teams', 'judges', 'submissions', 'criteria', 'evaluations', 'awards', 'tieBreakResolutions', 'auditLog'].every(key => uniqueIds(value[key]))) return false
  const schools = new Set(value.schools.map((item: any) => item.id))
  const teams = new Set(value.teams.map((item: any) => item.id))
  const students = new Set(value.students.map((item: any) => item.id))
  return value.students.every((student: any) => schools.has(student.schoolId) && (student.teamId === null || teams.has(student.teamId)))
    && value.teams.every((team: any) => schools.has(team.schoolId) && team.memberIds.every((id: string) => students.has(id)) && (team.leaderId === null || team.memberIds.includes(team.leaderId)))
    && value.trainingProgress.every((progress: any) => students.has(progress.studentId))
    && value.submissions.every((submission: any) => teams.has(submission.teamId))
}

export const useChallenge = () => {
  const nuxtApp = useNuxtApp()
  const state = useState<ChallengeState | null>('challenge-state', () => null)
  const ready = useState<boolean>('challenge-ready', () => false)
  const route = useRoute()
  const role = computed<ChallengeRole>(() => {
    const parts = route.path.split('/').filter(Boolean)
    const rolePart = parts[parts.indexOf('challenge') + 1]
    return rolePart && ['school', 'student', 'judge', 'admin'].includes(rolePart) ? rolePart as ChallengeRole : 'public'
  })
  const currentStudent = computed(() => state.value?.students.find(student => student.id === state.value?.personas.studentId) ?? null)
  const currentSchool = computed(() => state.value?.schools.find(school => school.id === state.value?.personas.schoolId) ?? null)
  const currentJudge = computed(() => state.value?.judges.find(judge => judge.id === state.value?.personas.judgeId) ?? null)
  const currentTeam = computed(() => state.value?.teams.find(team => team.id === currentStudent.value?.teamId && team.memberIds.includes(currentStudent.value.id)) ?? null)
  const currentSubmission = computed(() => state.value?.submissions.find(submission => submission.teamId === currentTeam.value?.id) ?? null)
  const rankings = computed(() => state.value ? calculateRankings(state.value) : [])
  const anomalies = computed(() => rankings.value.filter(row => row.isAnomaly))
  const ties = computed(() => calculateTies(rankings.value))
  const kpis = computed(() => ({
    schools: state.value?.schools.length ?? 0,
    approvedSchools: state.value?.schools.filter(school => school.approvalStatus === 'approved').length ?? 0,
    teams: state.value?.teams.length ?? 0,
    students: state.value?.students.length ?? 0,
    judges: state.value?.judges.length ?? 0,
    submissions: state.value?.submissions.filter(submission => submission.status !== 'draft').length ?? 0,
    completedEvaluations: state.value?.evaluations.filter(evaluation => evaluation.status === 'submitted').length ?? 0,
    eligibleTeams: state.value?.teams.filter(team => isTeamEligible(team, state.value!)).length ?? 0,
    pendingSchools: state.value?.schools.filter(school => school.approvalStatus === 'pending').length ?? 0,
  }))
  const fail = (key: string): ChallengeActionResult => ({ ok: false, errorKey: `challenge.validation.${key}` })
  const success = (): ChallengeActionResult => ({ ok: true })
  const now = () => new Date().toISOString()
  const id = (prefix: string) => `${prefix}-${state.value!.nextId++}`

  function init() {
    if (!import.meta.client) return
    const toast = useChallengeToast()
    const storageRecord = persistence.get(nuxtApp) ?? { timer: null, failed: false }
    const storageFailed = () => {
      if (storageRecord.failed) return
      storageRecord.failed = true
      toast.push('challenge.toasts.storageFailed', 'warning')
    }
    if (!ready.value) {
      let restored: ChallengeState | null = null
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const decoded: unknown = JSON.parse(raw)
          if (isValidChallengeState(decoded)) restored = decoded
        }
      } catch { storageFailed() }
      state.value = restored ?? createChallengeSeed()
      ready.value = true
    }
    if (persistence.has(nuxtApp)) return
    persistence.set(nuxtApp, storageRecord)
    const flush = () => {
      if (storageRecord.timer) { clearTimeout(storageRecord.timer); storageRecord.timer = null }
      if (!state.value) return
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value)) }
      catch { storageFailed() }
    }
    effectScope(true).run(() => watch(state, () => {
      if (storageRecord.timer) clearTimeout(storageRecord.timer)
      storageRecord.timer = setTimeout(flush, 200)
    }, { deep: true, flush: 'sync' }))
    window.addEventListener('pagehide', flush)
    flush()
  }

  function audit(action: string, entityType: string, entityId: string | null, note = '') {
    if (!state.value) return
    const actor = role.value === 'student' ? currentStudent.value : role.value === 'school' ? currentSchool.value : role.value === 'judge' ? currentJudge.value : null
    const fallbackName = role.value === 'admin' ? { en: 'Administrator', ar: 'مسؤول المسابقة' } : { en: 'Demo visitor', ar: 'زائر تجريبي' }
    state.value.auditLog.push({ id: id('audit'), timestamp: now(), actorId: actor?.id ?? null, actorName: actor?.name ?? fallbackName, role: role.value, action, entityType, entityId, note })
  }

  function guard(allowedRole: ChallengeRole, allowedPhases: ChallengePhase[]): ChallengeActionResult | null {
    if (!ready.value || !state.value) return fail('notReady')
    if (role.value !== allowedRole) return fail('wrongRole')
    if (!allowedPhases.includes(state.value.competition.phase)) return fail('wrongPhase')
    if (allowedRole === 'student' && !currentStudent.value || allowedRole === 'school' && !currentSchool.value || allowedRole === 'judge' && !currentJudge.value) return fail('noPersona')
    return null
  }

  const resolveTeam = (team: Team | string) => typeof team === 'string' ? state.value?.teams.find(item => item.id === team) : team
  function studentProgress(studentId: string) {
    return state.value ? calculateStudentProgress(state.value.trainingProgress.find(item => item.studentId === studentId), state.value.course) : 0
  }
  function teamProgress(team: Team | string) {
    const resolved = resolveTeam(team)
    return resolved && state.value ? calculateTeamProgress(resolved, state.value) : 0
  }
  function teamEligible(team: Team | string) {
    const resolved = resolveTeam(team)
    return !!resolved && !!state.value && isTeamEligible(resolved, state.value)
  }

  function registerSchool(input: RegisterSchoolInput): ChallengeActionResult {
    const blocked = guard('public', ['registration'])
    if (blocked) return blocked
    if (!input || !string(input.name) || input.name.trim().length < 2 || input.name.trim().length > 140 || !string(input.contactName) || input.contactName.trim().length < 2) return fail('invalidName')
    if (!string(input.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return fail('invalidEmail')
    const phone = string(input.phone) ? input.phone.replace(/[\s()-]/g, '') : ''
    if (!/^(?:0|\+962|00962)7[789]\d{7}$/.test(phone)) return fail('invalidPhone')
    if (!Number.isInteger(input.expectedStudents) || input.expectedStudents < 3 || input.expectedStudents > 500) return fail('invalidExpectedStudents')
    if (!governorates.has(input.governorate) || !['public', 'private', 'international'].includes(input.type)) return fail('invalidSchool')
    const email = input.email.trim().toLowerCase()
    if (state.value!.schools.some(school => school.email.toLowerCase() === email)) return fail('duplicateSchool')
    const schoolId = id('school')
    state.value!.schools.push({ id: schoolId, name: localized(input.name.trim()), contactName: localized(input.contactName.trim()), governorate: input.governorate, type: input.type, email, phone, expectedStudents: input.expectedStudents, approvalStatus: 'pending', reviewNote: '', registeredAt: now() })
    audit('school_registered', 'school', schoolId)
    return success()
  }

  function studentAge(dateOfBirth: string) {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    return today.getUTCFullYear() - birth.getUTCFullYear() - (today.getUTCMonth() < birth.getUTCMonth() || today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate() ? 1 : 0)
  }

  const fitsAgeCategory = (student: Student, category: AgeCategory) => {
    const age = studentAge(student.dateOfBirth)
    return category === '12-14' ? age >= 12 && age <= 14 : age >= 15 && age <= 18
  }
  const findTeamByCode = (inviteCode: string) => state.value?.teams.find(item => item.inviteCode === String(inviteCode).trim().toUpperCase()) ?? null

  function addStudentToTeam(student: Student, team: Team): ChallengeActionResult {
    if (team.schoolId !== student.schoolId) return fail('schoolMismatch')
    if (state.value!.schools.find(school => school.id === student.schoolId)?.approvalStatus !== 'approved') return fail('schoolNotApproved')
    if (team.memberIds.length >= state.value!.competition.maxTeamMembers) return fail('teamFull')
    if (!student.guardianConsent) return fail('guardianConsent')
    if (!fitsAgeCategory(student, team.ageCategory)) return fail('ageMismatch')
    student.teamId = team.id
    team.memberIds.push(student.id)
    if (!team.leaderId) team.leaderId = student.id
    audit('team_joined', 'team', team.id, student.id)
    return success()
  }

  function joinTeam(inviteCode: string): ChallengeActionResult {
    const blocked = guard('student', ['team_formation'])
    if (blocked) return blocked
    const student = currentStudent.value!
    if (student.teamId) return fail('alreadyInTeam')
    const team = findTeamByCode(inviteCode)
    if (!team) return fail('teamNotFound')
    return addStudentToTeam(student, team)
  }

  // The public page lets a visitor try the invitation-code flow without picking a student
  // first: it joins as a student of the team's school who has no team yet, preferring the
  // current student identity when that student qualifies.
  const canJoinTeam = (student: Student, team: Team) => !student.teamId && student.schoolId === team.schoolId && student.guardianConsent && fitsAgeCategory(student, team.ageCategory)
  const demoJoiner = (team: Team) => {
    const current = currentStudent.value
    return current && canJoinTeam(current, team) ? current : state.value?.students.find(student => canJoinTeam(student, team)) ?? null
  }
  const demoInvite = computed(() => {
    if (!state.value) return null
    const { schools, teams, competition } = state.value
    for (const team of teams) {
      if (team.approvalStatus !== 'approved' || team.memberIds.length >= competition.maxTeamMembers) continue
      if (schools.find(school => school.id === team.schoolId)?.approvalStatus !== 'approved') continue
      const student = demoJoiner(team)
      if (student) return { team, student }
    }
    return null
  })

  function joinTeamWithCode(inviteCode: string): ChallengeActionResult {
    const blocked = guard('public', ['team_formation'])
    if (blocked) return blocked
    const team = findTeamByCode(inviteCode)
    if (!team) return fail('teamNotFound')
    const student = demoJoiner(team)
    if (!student) return fail('noDemoStudent')
    const joined = addStudentToTeam(student, team)
    if (joined.ok) state.value!.personas.studentId = student.id
    return joined
  }

  function createTeam(name: string, ageCategory?: AgeCategory): ChallengeActionResult {
    const blocked = guard('student', ['team_formation'])
    if (blocked) return blocked
    const student = currentStudent.value!
    if (student.teamId) return fail('alreadyInTeam')
    if (!string(name) || name.trim().length < 2 || name.trim().length > 100) return fail('invalidName')
    if (state.value!.schools.find(school => school.id === student.schoolId)?.approvalStatus !== 'approved') return fail('schoolNotApproved')
    if (!student.guardianConsent) return fail('guardianConsent')
    const age = studentAge(student.dateOfBirth)
    const category = ageCategory ?? (age <= 14 ? '12-14' : '15-18')
    if (!['12-14', '15-18'].includes(category) || (category === '12-14' ? age < 12 || age > 14 : age < 15 || age > 18)) return fail('ageMismatch')
    const teamId = id('team')
    let inviteCode = inviteFromNumber(state.value!.nextId)
    while (state.value!.teams.some(team => team.inviteCode === inviteCode)) inviteCode = inviteFromNumber(++state.value!.nextId)
    state.value!.teams.push({ id: teamId, schoolId: student.schoolId, name: localized(name.trim()), ageCategory: category, inviteCode, memberIds: [student.id], leaderId: student.id, approvalStatus: 'pending', reviewNote: '', devlog: [], createdAt: now() })
    student.teamId = teamId
    audit('team_created', 'team', teamId)
    return success()
  }

  function addDevlog(text: string): ChallengeActionResult {
    const blocked = guard('student', ['team_formation', 'training', 'submission'])
    if (blocked) return blocked
    if (!currentTeam.value) return fail('teamRequired')
    if (!string(text) || !text.trim() || text.trim().length > 2000) return fail('invalidName')
    currentTeam.value.devlog.push({ id: id('devlog'), studentId: currentStudent.value!.id, text: localized(text.trim()), createdAt: now() })
    audit('devlog_added', 'team', currentTeam.value.id)
    return success()
  }

  function trainingGuard(sessionId?: string) {
    const blocked = guard('student', ['training', 'submission'])
    if (blocked) return blocked
    if (!currentTeam.value) return fail('teamRequired')
    if (sessionId && !state.value!.course.sessions.some(session => session.id === sessionId)) return fail('invalidSession')
    return null
  }

  function trainingRecord() {
    let progress = state.value!.trainingProgress.find(item => item.studentId === currentStudent.value!.id)
    if (!progress) {
      progress = { studentId: currentStudent.value!.id, attendedSessionIds: [], completedAssignmentIds: [], quizScore: null, quizAnswers: {}, quizSubmittedAt: null }
      state.value!.trainingProgress.push(progress)
    }
    return progress
  }

  function markAttendance(sessionId: string): ChallengeActionResult {
    const blocked = trainingGuard(sessionId)
    if (blocked) return blocked
    const progress = trainingRecord()
    if (!progress.attendedSessionIds.includes(sessionId)) {
      progress.attendedSessionIds.push(sessionId)
      audit('attendance_marked', 'session', sessionId, currentStudent.value!.id)
    }
    return success()
  }

  function markAssignment(sessionId: string): ChallengeActionResult {
    const blocked = trainingGuard(sessionId)
    if (blocked) return blocked
    const progress = trainingRecord()
    if (!progress.attendedSessionIds.includes(sessionId)) return fail('attendanceRequired')
    if (!progress.completedAssignmentIds.includes(sessionId)) {
      progress.completedAssignmentIds.push(sessionId)
      audit('assignment_completed', 'session', sessionId, currentStudent.value!.id)
    }
    return success()
  }

  function submitQuiz(answers: Record<string, string>): ChallengeActionResult {
    const blocked = trainingGuard()
    if (blocked) return blocked
    if (!record(answers)) return fail('invalidQuiz')
    const questions = state.value!.course.quizQuestions
    if (!questions.length || questions.some(question => !answers[question.id])) return fail('incompleteQuiz')
    if (questions.some(question => !question.options.some(option => option.id === answers[question.id]))) return fail('invalidQuiz')
    const progress = trainingRecord()
    progress.quizAnswers = Object.fromEntries(questions.map(question => [question.id, answers[question.id]!]))
    progress.quizScore = questions.filter(question => answers[question.id] === question.correctOptionId).length / questions.length * 100
    progress.quizSubmittedAt = now()
    audit('quiz_submitted', 'course', state.value!.course.id, `${progress.quizScore}%`)
    return success()
  }

  function getSubmissionGate(): { allowed: boolean; errorKey?: string } {
    const blocked = guard('student', ['submission'])
    if (blocked) return { allowed: false, errorKey: blocked.errorKey }
    const team = currentTeam.value
    if (!team) return { allowed: false, errorKey: fail('teamRequired').errorKey }
    if (team.leaderId !== currentStudent.value!.id) return { allowed: false, errorKey: fail('leaderRequired').errorKey }
    if (currentSubmission.value?.status === 'locked' || currentSubmission.value?.lockedAt) return { allowed: false, errorKey: fail('submissionLocked').errorKey }
    if (Date.now() >= Date.parse(state.value!.competition.submissionDeadline)) return { allowed: false, errorKey: fail('deadlinePassed').errorKey }
    if (!teamEligible(team)) return { allowed: false, errorKey: fail('teamNotEligible').errorKey }
    return { allowed: true }
  }
  const submissionGate = computed(getSubmissionGate)

  function contentValidation(content: SubmissionContent, complete = false): ChallengeActionResult | null {
    if (!validContent(content)) return fail('submissionIncomplete')
    const urls = [content.buildUrl, content.packageUrl, content.repositoryUrl, content.gddUrl, content.presentationUrl, content.coverUrl, content.trailerUrl, ...content.screenshotUrls]
    if (urls.some(url => {
      if (!url.trim()) return false
      try { const parsed = new URL(url); return !['https:', 'http:'].includes(parsed.protocol) || !!parsed.username || !!parsed.password }
      catch { return true }
    })) return fail('invalidUrl')
    if (complete && (!content.title.en.trim() || !content.title.ar.trim() || !content.description.en.trim() || !content.description.ar.trim() || !content.buildUrl.trim() || !content.gddUrl.trim() || !content.presentationUrl.trim() || !['educational', 'adventure', 'puzzle', 'platformer'].includes(content.genre) || !['web', 'windows', 'android'].includes(content.platform))) return fail('submissionIncomplete')
    return null
  }

  function saveSubmission(content: SubmissionContent): ChallengeActionResult {
    const gate = getSubmissionGate()
    if (!gate.allowed) return { ok: false, errorKey: gate.errorKey }
    const invalid = contentValidation(content)
    if (invalid) return invalid
    let submission = currentSubmission.value
    const savedAt = now()
    if (!submission) {
      submission = { id: id('submission'), teamId: currentTeam.value!.id, content: clone(content), versions: [], status: 'draft', updatedAt: savedAt, submittedAt: null, lockedAt: null }
      state.value!.submissions.push(submission)
    }
    const version = `1.${submission.versions.length}`
    submission.content = clone(content)
    submission.versions.push({ id: id('version'), version, label: version, content: clone(content), savedAt, createdAt: savedAt, savedBy: currentStudent.value!.id })
    submission.status = 'draft'
    submission.submittedAt = null
    submission.updatedAt = savedAt
    audit('submission_version_saved', 'submission', submission.id, version)
    return success()
  }

  function submitSubmission(): ChallengeActionResult {
    const gate = getSubmissionGate()
    if (!gate.allowed) return { ok: false, errorKey: gate.errorKey }
    const submission = currentSubmission.value
    if (!submission) return fail('noSubmission')
    if (!submission.versions.length) return fail('noSavedVersion')
    const invalid = contentValidation(submission.content, true)
    if (invalid) return invalid
    submission.status = 'submitted'
    submission.submittedAt = now()
    submission.updatedAt = submission.submittedAt
    audit('submission_submitted', 'submission', submission.id)
    return success()
  }

  function lockSubmission(): ChallengeActionResult {
    const gate = getSubmissionGate()
    if (!gate.allowed) return { ok: false, errorKey: gate.errorKey }
    const submission = currentSubmission.value
    if (!submission) return fail('noSubmission')
    if (submission.status !== 'submitted') return fail('submissionNotSubmitted')
    submission.status = 'locked'
    submission.lockedAt = now()
    submission.updatedAt = submission.lockedAt
    audit('submission_locked', 'submission', submission.id)
    return success()
  }

  function selectPersona(personaRole: ChallengeRole, personaId: string | null): ChallengeActionResult {
    if (!state.value || !ready.value) return fail('notReady')
    const collection = personaRole === 'school' ? state.value.schools : personaRole === 'student' ? state.value.students : personaRole === 'judge' ? state.value.judges : null
    if (!collection || !personaId || !collection.some(item => item.id === personaId)) return fail('invalidPersona')
    const key = `${personaRole}Id` as keyof ChallengeState['personas']
    state.value.personas[key] = personaId
    audit('persona_selected', personaRole, personaId)
    return success()
  }

  function jumpToPhase(phase: ChallengePhase): ChallengeActionResult {
    if (!state.value || !ready.value) return fail('notReady')
    if (!phases.has(phase)) return fail('wrongPhase')
    const previous = state.value.competition.phase
    state.value.competition.phase = phase
    audit('demo_phase_changed', 'competition', state.value.competition.id, `${previous} → ${phase}`)
    return success()
  }

  function resetDemo(phase: ChallengePhase = 'team_formation'): ChallengeActionResult {
    if (!import.meta.client) return fail('notReady')
    if (!phases.has(phase)) return fail('wrongPhase')
    state.value = createChallengeSeed(phase)
    ready.value = true
    audit('demo_reset', 'competition', state.value.competition.id, phase)
    return success()
  }

  const management = createChallengeManagement({ state, currentSchool, currentJudge, guard, fail, success, audit, id, now })

  return {
    ...management,
    state, ready, init, role, currentStudent, currentSchool, currentJudge, currentTeam, currentSubmission,
    activeStudent: currentStudent, activeTeam: currentTeam, studentProgress, teamProgress, teamEligible,
    rankings, anomalies, ties, kpis, submissionGate,
    registerSchool, joinTeam, joinTeamWithCode, demoInvite, createTeam, addDevlog, markAttendance, markAssignment, submitQuiz,
    saveSubmission, saveSubmissionVersion: saveSubmission, submitSubmission, lockSubmission,
    selectPersona, jumpToPhase, resetDemo,
  }
}
