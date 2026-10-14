import type { ChallengeRanking, ChallengeState, EvaluationCriterion, JudgeEvaluation, LMSCourse, StudentTrainingProgress, Team } from '../types/challenge'

const bounded = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
const rounded = (value: number) => Math.round(value * 100) / 100

/** Scores always use the configured percentage weights and stay within 0–100. */
export function weightedScore(evaluation: Pick<JudgeEvaluation, 'scores'>, criteria: EvaluationCriterion[]): number {
  return rounded(criteria.reduce((sum, criterion) => sum + bounded(Number(evaluation.scores[criterion.id])) * criterion.weight / 100, 0))
}

export function calculateStudentProgress(progress: StudentTrainingProgress | undefined, course: LMSCourse): number {
  if (!progress) return 0
  const validSessions = new Set(course.sessions.map(session => session.id))
  const count = validSessions.size
  const attendance = new Set(progress.attendedSessionIds.filter(id => validSessions.has(id))).size
  const assignments = new Set(progress.completedAssignmentIds.filter(id => validSessions.has(id))).size
  return rounded((count ? attendance / count * 40 + assignments / count * 30 : 0) + bounded(progress.quizScore ?? 0) * 0.3)
}

export function calculateTeamProgress(team: Team, state: ChallengeState): number {
  if (!team.memberIds.length) return 0
  return rounded(team.memberIds.reduce((total, id) => total + calculateStudentProgress(state.trainingProgress.find(progress => progress.studentId === id), state.course), 0) / team.memberIds.length)
}

export function isTeamEligible(team: Team, state: ChallengeState): boolean {
  const school = state.schools.find(item => item.id === team.schoolId)
  const uniqueMembers = [...new Set(team.memberIds)]
  return school?.approvalStatus === 'approved'
    && team.approvalStatus === 'approved'
    && uniqueMembers.length >= state.competition.minTeamMembers
    && uniqueMembers.length <= state.competition.maxTeamMembers
    && uniqueMembers.every(id => state.students.some(student => student.id === id && student.teamId === team.id && student.schoolId === team.schoolId && student.guardianConsent))
    && uniqueMembers.includes(team.leaderId ?? '')
    && calculateTeamProgress(team, state) >= state.competition.trainingThreshold
}

/** Draft evaluations never contribute to a score, spread, or tie. */
export function calculateRankings(state: ChallengeState): ChallengeRanking[] {
  const rows: ChallengeRanking[] = []
  for (const team of state.teams) {
    if (!isTeamEligible(team, state) || !state.submissions.some(submission => submission.teamId === team.id && submission.status !== 'draft')) continue
    const evaluations = state.evaluations.filter(item => item.teamId === team.id && item.status === 'submitted' && state.judges.some(judge => judge.id === item.judgeId && judge.assignedTeamIds.includes(team.id) && judge.schoolId !== team.schoolId))
    if (!evaluations.length) continue
    const judgeScores = evaluations.map(item => ({ judgeId: item.judgeId, score: weightedScore(item, state.criteria) }))
    const scores = judgeScores.map(item => item.score)
    const criterionScores = Object.fromEntries(state.criteria.map(criterion => [criterion.id, rounded(evaluations.reduce((sum, evaluation) => sum + bounded(evaluation.scores[criterion.id] ?? 0), 0) / evaluations.length)]))
    const spread = rounded(Math.max(...scores) - Math.min(...scores))
    rows.push({ teamId: team.id, rank: 0, score: rounded(scores.reduce((sum, score) => sum + score, 0) / scores.length), evaluationCount: evaluations.length, criterionScores, judgeScores, spread, isAnomaly: spread >= 30, tied: false })
  }
  const compare = (left: ChallengeRanking, right: ChallengeRanking): number => {
    if (Math.abs(left.score - right.score) >= 0.005) return right.score - left.score
    for (const criterion of state.competition.criterionPriority) {
      const difference = (right.criterionScores[criterion] ?? 0) - (left.criterionScores[criterion] ?? 0)
      if (Math.abs(difference) >= 0.005) return difference
    }
    const resolution = [...state.tieBreakResolutions].reverse().find(item => item.orderedTeamIds.includes(left.teamId) && item.orderedTeamIds.includes(right.teamId))
    if (resolution) return resolution.orderedTeamIds.indexOf(left.teamId) - resolution.orderedTeamIds.indexOf(right.teamId)
    return 0
  }
  rows.sort((left, right) => compare(left, right) || left.teamId.localeCompare(right.teamId))
  rows.forEach((row, index) => {
    const previous = rows[index - 1]
    row.rank = previous && compare(previous, row) === 0 ? previous.rank : index + 1
    row.tied = rows.some(other => other !== row && compare(row, other) === 0)
  })
  return rows
}

export function calculateTies(rankings: ChallengeRanking[]): string[][] {
  const groups = new Map<number, string[]>()
  rankings.filter(row => row.tied).forEach(row => groups.set(row.rank, [...(groups.get(row.rank) ?? []), row.teamId]))
  return [...groups.values()].filter(group => group.length > 1)
}
