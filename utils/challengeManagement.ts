import type { Ref } from 'vue'
import { CHALLENGE_PHASES } from '../types/challenge'
import type { AgeCategory, ApprovalStatus, ChallengeActionResult, ChallengePhase, ChallengeRole, ChallengeSimulatorInput, ChallengeSimulatorScenario, ChallengeState, EvaluationCriterion, Judge, JudgeEvaluation, JudgeEvaluationInput, School, SchoolStudentInput, Team } from '../types/challenge'
import { calculateRankings, calculateTies, isTeamEligible } from './challengeScoring'

interface ManagementContext {
  state: Ref<ChallengeState | null>
  currentSchool: Ref<School | null>
  currentJudge: Ref<Judge | null>
  guard: (role: ChallengeRole, phases: ChallengePhase[]) => ChallengeActionResult | null
  fail: (key: string) => ChallengeActionResult
  success: () => ChallengeActionResult
  audit: (action: string, entityType: string, entityId: string | null, note?: string) => void
  id: (prefix: string) => string
  now: () => string
}

/** The same guards and audit trail serve UI actions and the local scenario simulator. */
export function createChallengeManagement(context: ManagementContext) {
  const { state, currentSchool, currentJudge, guard, fail, success, audit, id, now } = context
  const editablePhases = CHALLENGE_PHASES.filter(phase => phase !== 'archived')
  const world = () => state.value!
  const localText = (text: string) => ({ en: text, ar: text })
  const hideResults = () => { world().competition.resultsVisibility = 'hidden' }
  const requiredNote = (value: unknown) => typeof value === 'string' && value.trim().length >= 3 && value.trim().length <= 2000
  const approvedSchool = (team: Team) => world().schools.find(school => school.id === team.schoolId)?.approvalStatus === 'approved'
  const submittedTeam = (team: Team) => isTeamEligible(team, world()) && world().submissions.some(submission => submission.teamId === team.id && submission.status !== 'draft')
  const unique = (items: string[]) => new Set(items).size === items.length
  const validPriority = (priority: string[]) => Array.isArray(priority) && unique(priority) && priority.length === world().criteria.length && priority.every(key => world().criteria.some(criterion => criterion.id === key))
  const validWeights = () => Math.abs(world().criteria.reduce((sum, criterion) => sum + criterion.weight, 0) - 100) < .001

  function schoolTeam(teamId: string) {
    const blocked = guard('school', ['team_formation'])
    if (blocked) return { blocked, team: undefined }
    if (currentSchool.value!.approvalStatus !== 'approved') return { blocked: fail('schoolNotApproved'), team: undefined }
    const team = world().teams.find(item => item.id === teamId && item.schoolId === currentSchool.value!.id)
    return team ? { blocked: null, team } : { blocked: fail('teamNotFound'), team: undefined }
  }

  function createSchoolTeam(name: string, ageCategory: AgeCategory): ChallengeActionResult {
    const blocked = guard('school', ['team_formation'])
    if (blocked) return blocked
    if (currentSchool.value!.approvalStatus !== 'approved') return fail('schoolNotApproved')
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return fail('invalidName')
    if (!world().competition.ageCategories.includes(ageCategory)) return fail('ageMismatch')
    const teamId = id('team')
    let inviteCode = ''
    do {
      let value = world().nextId++
      inviteCode = ''
      for (let position = 0; position < 6; position++) { inviteCode = String.fromCharCode(65 + value % 26) + inviteCode; value = Math.floor(value / 26) }
    } while (world().teams.some(team => team.inviteCode === inviteCode))
    world().teams.push({ id: teamId, schoolId: currentSchool.value!.id, name: localText(name.trim()), ageCategory, inviteCode, memberIds: [], leaderId: null, approvalStatus: 'pending', reviewNote: '', devlog: [], createdAt: now() })
    audit('school_team_created', 'team', teamId)
    return success()
  }

  function addSchoolStudent(teamId: string, input: SchoolStudentInput): ChallengeActionResult {
    const { blocked, team } = schoolTeam(teamId)
    if (blocked || !team) return blocked ?? fail('teamNotFound')
    if (!input || typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 100) return fail('invalidName')
    if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return fail('invalidEmail')
    if (typeof input.nationalId !== 'string' || !/^\d{10}$/.test(input.nationalId)) return fail('invalidNationalId')
    if (world().students.some(student => student.nationalId === input.nationalId || student.email.toLowerCase() === input.email.trim().toLowerCase())) return fail('duplicateStudent')
    if (typeof input.dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) return fail('invalidBirthDate')
    const birth = new Date(input.dateOfBirth + 'T00:00:00Z')
    if (!Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== input.dateOfBirth) return fail('invalidBirthDate')
    const today = new Date()
    const age = today.getUTCFullYear() - birth.getUTCFullYear() - (today.getUTCMonth() < birth.getUTCMonth() || today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate() ? 1 : 0)
    if (team.ageCategory === '12-14' ? age < 12 || age > 14 : age < 15 || age > 18) return fail('ageMismatch')
    if (!Number.isInteger(input.grade) || input.grade < 7 || input.grade > 12) return fail('invalidGrade')
    if (input.guardianConsent !== true) return fail('guardianConsent')
    if (team.memberIds.length >= world().competition.maxTeamMembers) return fail('teamFull')
    const studentId = id('student')
    world().students.push({ id: studentId, schoolId: team.schoolId, teamId, name: localText(input.name.trim()), email: input.email.trim().toLowerCase(), nationalId: input.nationalId, dateOfBirth: input.dateOfBirth, grade: input.grade, guardianConsent: true })
    team.memberIds.push(studentId)
    if (!team.leaderId) team.leaderId = studentId
    team.approvalStatus = 'pending'; team.reviewNote = ''
    world().trainingProgress.push({ studentId, attendedSessionIds: [], completedAssignmentIds: [], quizScore: null, quizAnswers: {}, quizSubmittedAt: null })
    audit('student_added', 'team', teamId, studentId)
    return success()
  }

  function detachStudent(team: Team, studentId: string) {
    team.memberIds = team.memberIds.filter(member => member !== studentId)
    const student = world().students.find(item => item.id === studentId)
    if (student) student.teamId = null
    if (team.leaderId === studentId) team.leaderId = team.memberIds[0] ?? null
    team.approvalStatus = 'pending'; team.reviewNote = ''
  }

  function removeSchoolStudent(teamId: string, studentId: string): ChallengeActionResult {
    const { blocked, team } = schoolTeam(teamId)
    if (blocked || !team) return blocked ?? fail('teamNotFound')
    if (!team.memberIds.includes(studentId)) return fail('studentNotFound')
    detachStudent(team, studentId)
    audit('student_removed', 'team', teamId, studentId)
    return success()
  }

  function setTeamLeader(teamId: string, studentId: string): ChallengeActionResult {
    const { blocked, team } = schoolTeam(teamId)
    if (blocked || !team) return blocked ?? fail('teamNotFound')
    if (!team.memberIds.includes(studentId)) return fail('studentNotFound')
    team.leaderId = studentId
    audit('leader_changed', 'team', teamId, studentId)
    return success()
  }

  function saveJudgeEvaluation(teamId: string, input: JudgeEvaluationInput, submit = false): ChallengeActionResult {
    const blocked = guard('judge', ['judging'])
    if (blocked) return blocked
    const judge = currentJudge.value!
    const team = world().teams.find(item => item.id === teamId)
    if (!team || !judge.assignedTeamIds.includes(teamId)) return fail('notAssigned')
    if (judge.schoolId === team.schoolId) return fail('conflictOfInterest')
    if (!submittedTeam(team)) return fail('teamNotEligible')
    if (!validWeights()) return fail('invalidWeights')
    let evaluation = world().evaluations.find(item => item.teamId === teamId && item.judgeId === judge.id)
    if (evaluation?.lockedAt || evaluation?.status === 'submitted') return fail('evaluationLocked')
    if (!input || !input.scores || typeof input.scores !== 'object' || world().criteria.some(criterion => !Number.isFinite(input.scores[criterion.id]) || input.scores[criterion.id]! < 0 || input.scores[criterion.id]! > 100)) return fail('invalidScores')
    if (['strengths', 'improvements', 'recommendation'].some(key => typeof input[key as keyof JudgeEvaluationInput] !== 'string' || String(input[key as keyof JudgeEvaluationInput]).length > 4000)) return fail('invalidEvaluationNotes')
    if (submit && ![input.strengths, input.improvements, input.recommendation].every(requiredNote)) return fail('evaluationNotesRequired')
    const timestamp = now()
    if (!evaluation) {
      evaluation = { id: id('evaluation'), teamId, judgeId: judge.id, scores: {}, strengths: '', improvements: '', recommendation: '', status: 'draft', updatedAt: timestamp, submittedAt: null, lockedAt: null }
      world().evaluations.push(evaluation)
    }
    evaluation.scores = Object.fromEntries(world().criteria.map(criterion => [criterion.id, input.scores[criterion.id]!]))
    Object.assign(evaluation, { strengths: input.strengths.trim(), improvements: input.improvements.trim(), recommendation: input.recommendation.trim(), status: submit ? 'submitted' : 'draft', updatedAt: timestamp, submittedAt: submit ? timestamp : null, lockedAt: submit ? timestamp : null })
    audit(submit ? 'evaluation_submitted' : 'evaluation_draft_saved', 'evaluation', evaluation.id, teamId)
    return success()
  }

  function changePhase(phase: ChallengePhase, reason: string): ChallengeActionResult {
    const blocked = guard('admin', CHALLENGE_PHASES)
    if (blocked) return blocked
    if (!CHALLENGE_PHASES.includes(phase)) return fail('wrongPhase')
    const previous = world().competition.phase
    if (CHALLENGE_PHASES.indexOf(phase) < CHALLENGE_PHASES.indexOf(previous) && !requiredNote(reason)) return fail('reasonRequired')
    if (previous === phase) return success()
    world().competition.phase = phase
    if (!['results', 'archived'].includes(phase)) hideResults()
    if (phase === 'judging') world().submissions.filter(submission => submission.status === 'submitted').forEach(submission => { submission.status = 'locked'; submission.lockedAt = now(); submission.updatedAt = now() })
    audit('phase_changed', 'competition', world().competition.id, previous + ' → ' + phase + (reason?.trim() ? ': ' + reason.trim() : ''))
    return success()
  }

  function reviewEntity(entity: 'school' | 'team', entityId: string, status: ApprovalStatus, note: string): ChallengeActionResult {
    const blocked = guard('admin', editablePhases)
    if (blocked) return blocked
    if (!['school', 'team'].includes(entity) || !['approved', 'changes_requested', 'rejected', 'pending'].includes(status)) return fail('invalidApproval')
    const target = (entity === 'school' ? world().schools : world().teams).find(item => item.id === entityId)
    if (!target) return fail('entityNotFound')
    if (['changes_requested', 'rejected'].includes(status) && !requiredNote(note)) return fail('reviewNoteRequired')
    if (entity === 'team' && status === 'approved') {
      const team = target as Team
      if (!approvedSchool(team)) return fail('schoolNotApproved')
      if (!unique(team.memberIds) || team.memberIds.length < world().competition.minTeamMembers || team.memberIds.length > world().competition.maxTeamMembers || !team.memberIds.includes(team.leaderId ?? '') || team.memberIds.some(member => !world().students.some(student => student.id === member && student.teamId === team.id && student.schoolId === team.schoolId && student.guardianConsent))) return fail('invalidRoster')
    }
    target.approvalStatus = status
    target.reviewNote = typeof note === 'string' ? note.trim().slice(0, 2000) : ''
    hideResults()
    audit(entity + '_reviewed', entity, entityId, status + (target.reviewNote ? ': ' + target.reviewNote : ''))
    return success()
  }

  function assignJudges(teamId: string, judgeIds: string[]): ChallengeActionResult {
    const blocked = guard('admin', ['submission', 'judging'])
    if (blocked) return blocked
    const team = world().teams.find(item => item.id === teamId)
    if (!team || !submittedTeam(team)) return fail('teamNotEligible')
    if (!Array.isArray(judgeIds) || judgeIds.length < 2 || judgeIds.length > 3 || !unique(judgeIds) || judgeIds.some(judgeId => !world().judges.some(judge => judge.id === judgeId))) return fail('invalidAssignments')
    if (judgeIds.some(judgeId => world().judges.find(judge => judge.id === judgeId)?.schoolId === team.schoolId)) return fail('conflictOfInterest')
    if (world().evaluations.some(evaluation => evaluation.teamId === teamId && evaluation.status === 'submitted' && !judgeIds.includes(evaluation.judgeId))) return fail('lockedAssignment')
    world().judges.forEach(judge => { judge.assignedTeamIds = judge.assignedTeamIds.filter(item => item !== teamId); if (judgeIds.includes(judge.id)) judge.assignedTeamIds.push(teamId) })
    hideResults()
    audit('judges_assigned', 'team', teamId, judgeIds.join(', '))
    return success()
  }

  function autoAssignJudges(): ChallengeActionResult {
    const blocked = guard('admin', ['submission', 'judging'])
    if (blocked) return blocked
    const teams = world().teams.filter(submittedTeam)
    if (!teams.length) return fail('noEligibleSubmissions')
    const assignments = new Map<string, string[]>()
    const loads = new Map(world().judges.map(judge => [judge.id, 0]))
    for (const team of teams) {
      const available = world().judges.filter(judge => judge.schoolId !== team.schoolId)
      if (available.length < 2) return fail('insufficientJudges')
      const locked = [...new Set(world().evaluations.filter(evaluation => evaluation.teamId === team.id && evaluation.status === 'submitted').map(evaluation => evaluation.judgeId))]
      if (locked.length > 3 || locked.some(judgeId => !available.some(judge => judge.id === judgeId))) return fail('invalidAssignments')
      locked.forEach(judgeId => loads.set(judgeId, (loads.get(judgeId) ?? 0) + 1))
      assignments.set(team.id, locked)
    }
    for (const team of teams) {
      const selected = assignments.get(team.id)!
      const available = world().judges.filter(judge => judge.schoolId !== team.schoolId && !selected.includes(judge.id))
        .sort((left, right) => (loads.get(left.id) ?? 0) - (loads.get(right.id) ?? 0) || left.id.localeCompare(right.id))
      while (selected.length < Math.min(3, world().judges.filter(judge => judge.schoolId !== team.schoolId).length)) {
        const judge = available.shift()!
        selected.push(judge.id)
        loads.set(judge.id, (loads.get(judge.id) ?? 0) + 1)
      }
    }
    world().judges.forEach(judge => { judge.assignedTeamIds = [...assignments].filter(([, judges]) => judges.includes(judge.id)).map(([teamId]) => teamId) })
    hideResults()
    audit('judges_auto_assigned', 'competition', world().competition.id, String(teams.length))
    return success()
  }

  function saveCriteria(criteria: EvaluationCriterion[]): ChallengeActionResult {
    const blocked = guard('admin', ['registration', 'team_formation', 'training', 'submission', 'judging'])
    if (blocked) return blocked
    if (!Array.isArray(criteria) || criteria.length !== world().criteria.length || !unique(criteria.map(criterion => criterion.id)) || criteria.some(criterion => !world().criteria.some(item => item.id === criterion.id) || !criterion.name?.en?.trim() || !criterion.name?.ar?.trim() || !Number.isFinite(criterion.weight) || criterion.weight < 0 || criterion.weight > 100) || Math.abs(criteria.reduce((sum, criterion) => sum + criterion.weight, 0) - 100) > .001) return fail('invalidWeights')
    world().criteria = criteria.map(criterion => ({ ...criterion, name: { en: criterion.name.en.trim().slice(0, 140), ar: criterion.name.ar.trim().slice(0, 140) }, description: { en: criterion.description?.en ?? '', ar: criterion.description?.ar ?? '' } }))
    hideResults()
    audit('criteria_updated', 'competition', world().competition.id)
    return success()
  }

  function setBlindJudging(value: boolean): ChallengeActionResult {
    const blocked = guard('admin', ['registration', 'team_formation', 'training', 'submission', 'judging'])
    if (blocked) return blocked
    if (typeof value !== 'boolean') return fail('invalidSetting')
    world().competition.blindJudging = value
    audit('blind_judging_changed', 'competition', world().competition.id, String(value))
    return success()
  }

  function reopenEvaluation(evaluationId: string, reason: string): ChallengeActionResult {
    const blocked = guard('admin', ['judging'])
    if (blocked) return blocked
    if (!requiredNote(reason)) return fail('reasonRequired')
    const evaluation = world().evaluations.find(item => item.id === evaluationId)
    if (!evaluation) return fail('entityNotFound')
    evaluation.status = 'draft'; evaluation.lockedAt = null; evaluation.submittedAt = null; evaluation.updatedAt = now()
    hideResults()
    audit('evaluation_reopened', 'evaluation', evaluationId, reason.trim())
    return success()
  }

  function resolveTie(teamIds: string[], orderedTeamIds: string[], criterionPriority: string[], note: string): ChallengeActionResult {
    const blocked = guard('admin', ['judging', 'results'])
    if (blocked) return blocked
    if (!requiredNote(note)) return fail('reasonRequired')
    if (!Array.isArray(teamIds) || teamIds.length < 2 || !unique(teamIds) || !Array.isArray(orderedTeamIds) || !unique(orderedTeamIds) || orderedTeamIds.length !== teamIds.length || orderedTeamIds.some(teamId => !teamIds.includes(teamId)) || !validPriority(criterionPriority)) return fail('invalidTieBreak')
    const rows = calculateRankings(world()).filter(row => teamIds.includes(row.teamId))
    if (rows.length !== teamIds.length || rows.some(row => Math.abs(row.score - rows[0]!.score) >= .005)) return fail('invalidTieBreak')
    world().competition.criterionPriority = [...criterionPriority]
    world().tieBreakResolutions.push({ id: id('tie'), teamIds: [...teamIds], orderedTeamIds: [...orderedTeamIds], criterionPriority: [...criterionPriority], note: note.trim(), createdAt: now() })
    hideResults()
    audit('tie_resolved', 'competition', world().competition.id, orderedTeamIds.join(' > ') + ': ' + note.trim())
    return success()
  }

  function assignAward(awardId: string, teamId: string | null): ChallengeActionResult {
    const blocked = guard('admin', ['judging', 'results'])
    if (blocked) return blocked
    const award = world().awards.find(item => item.id === awardId)
    if (!award) return fail('entityNotFound')
    if (teamId !== null && !calculateRankings(world()).some(row => row.teamId === teamId)) return fail('teamNotEligible')
    award.teamId = teamId
    hideResults()
    audit('award_assigned', 'award', awardId, teamId ?? '')
    return success()
  }

  function setResultsVisibility(published: boolean): ChallengeActionResult {
    const blocked = guard('admin', published ? ['results'] : editablePhases)
    if (blocked) return blocked
    if (typeof published !== 'boolean') return fail('invalidSetting')
    if (published) {
      const rows = calculateRankings(world())
      const teams = world().teams.filter(submittedTeam)
      if (!validWeights() || !rows.length || rows.length !== teams.length || rows.some(row => row.evaluationCount < 2)) return fail('resultsNotReady')
      if (calculateTies(rows).length) return fail('unresolvedTies')
      if (teams.some(team => { const assigned = world().judges.filter(judge => judge.assignedTeamIds.includes(team.id)); return assigned.length < 2 || assigned.length > 3 || assigned.some(judge => judge.schoolId === team.schoolId) })) return fail('invalidAssignments')
    }
    world().competition.resultsVisibility = published ? 'published' : 'hidden'
    audit(published ? 'results_published' : 'results_hidden', 'competition', world().competition.id)
    return success()
  }

  function simulatedEvaluation(team: Team, judgeId: string, score: number) {
    let evaluation = world().evaluations.find(item => item.teamId === team.id && item.judgeId === judgeId)
    const timestamp = now()
    if (!evaluation) {
      evaluation = { id: id('evaluation'), teamId: team.id, judgeId, scores: {}, strengths: '', improvements: '', recommendation: '', status: 'draft', updatedAt: timestamp, submittedAt: null, lockedAt: null }
      world().evaluations.push(evaluation)
    }
    Object.assign(evaluation, { scores: Object.fromEntries(world().criteria.map(criterion => [criterion.id, score])), strengths: 'Local simulator scenario', improvements: 'Review the simulated scoring difference.', recommendation: 'For demo review only.', status: 'submitted', updatedAt: timestamp, submittedAt: timestamp, lockedAt: timestamp })
  }

  function runSimulator(scenario: ChallengeSimulatorScenario, input: ChallengeSimulatorInput = {}): ChallengeActionResult {
    const allowed: Record<ChallengeSimulatorScenario, ChallengePhase[]> = { withdrawal: ['team_formation', 'training', 'submission', 'judging'], attendance: ['training', 'submission', 'judging'], extension: ['submission'], anomaly: ['judging'], tie: ['judging', 'results'] }
    if (!Object.hasOwn(allowed, scenario)) return fail('invalidScenario')
    const blocked = guard('admin', allowed[scenario])
    if (blocked) return blocked
    const team = world().teams.find(item => item.id === input.teamId)
    if (['withdrawal', 'attendance', 'anomaly'].includes(scenario) && !team) return fail('teamNotFound')
    if (scenario === 'withdrawal') {
      const studentId = input.studentId ?? team!.memberIds.at(-1)
      if (!studentId || !team!.memberIds.includes(studentId)) return fail('studentNotFound')
      detachStudent(team!, studentId)
    } else if (scenario === 'attendance') {
      world().trainingProgress.filter(progress => team!.memberIds.includes(progress.studentId)).forEach(progress => { progress.attendedSessionIds = []; progress.completedAssignmentIds = []; progress.quizScore = 0 })
    } else if (scenario === 'extension') {
      if (!requiredNote(input.reason)) return fail('reasonRequired')
      world().competition.submissionDeadline = new Date(Date.parse(world().competition.submissionDeadline) + 86_400_000).toISOString()
    } else if (scenario === 'anomaly') {
      if (!submittedTeam(team!)) return fail('teamNotEligible')
      const judges = world().judges.filter(judge => judge.assignedTeamIds.includes(team!.id) && judge.schoolId !== team!.schoolId)
      if (judges.length < 2) return fail('insufficientJudges')
      simulatedEvaluation(team!, judges[0]!.id, 95); simulatedEvaluation(team!, judges[1]!.id, 45)
    } else {
      const ids = input.teamIds ?? world().teams.filter(submittedTeam).slice(0, 2).map(item => item.id)
      if (ids.length !== 2 || !unique(ids)) return fail('invalidTieBreak')
      const tiedTeams = world().teams.filter(item => ids.includes(item.id))
      if (tiedTeams.length !== 2 || tiedTeams.some(item => !submittedTeam(item) || world().judges.filter(judge => judge.assignedTeamIds.includes(item.id) && judge.schoolId !== item.schoolId).length < 2)) return fail('insufficientJudges')
      tiedTeams.forEach(item => world().judges.filter(judge => judge.assignedTeamIds.includes(item.id) && judge.schoolId !== item.schoolId).forEach(judge => simulatedEvaluation(item, judge.id, 100)))
      world().tieBreakResolutions = world().tieBreakResolutions.filter(resolution => !resolution.teamIds.some(teamId => ids.includes(teamId)))
    }
    hideResults()
    audit('simulator_' + scenario, 'competition', world().competition.id, [input.teamId, input.studentId, input.reason].filter(Boolean).join(': '))
    return success()
  }

  return { createSchoolTeam, addSchoolStudent, removeSchoolStudent, setTeamLeader, saveJudgeEvaluation, changePhase, reviewEntity, assignJudges, autoAssignJudges, saveCriteria, setBlindJudging, reopenEvaluation, resolveTie, assignAward, setResultsVisibility, runSimulator }
}
