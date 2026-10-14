export type ChallengeRole = 'public' | 'school' | 'student' | 'judge' | 'admin'
export type ChallengePhase = 'registration' | 'team_formation' | 'training' | 'submission' | 'judging' | 'results' | 'archived'
export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected'
export type ResultsVisibility = 'hidden' | 'published'
export type AgeCategory = '12-14' | '15-18'
export type SessionMode = 'live' | 'in_person' | 'recorded'
export type SubmissionStatus = 'draft' | 'submitted' | 'locked'
export type EvaluationStatus = 'draft' | 'submitted'
export interface LocalizedText { en: string; ar: string }

export interface Competition {
  id: string
  title: LocalizedText
  description: LocalizedText
  phase: ChallengePhase
  registrationDeadline: string
  submissionDeadline: string
  judgingDeadline: string
  resultsDate: string
  ageCategories: AgeCategory[]
  minTeamMembers: number
  maxTeamMembers: number
  trainingThreshold: number
  blindJudging: boolean
  resultsVisibility: ResultsVisibility
  criterionPriority: string[]
}

export interface School {
  id: string
  name: LocalizedText
  governorate: string
  type: 'public' | 'private' | 'international'
  contactName: LocalizedText
  email: string
  phone: string
  expectedStudents: number
  approvalStatus: ApprovalStatus
  reviewNote: string
  registeredAt: string
}

export interface Student {
  id: string
  schoolId: string
  teamId: string | null
  name: LocalizedText
  email: string
  nationalId: string
  dateOfBirth: string
  grade: number
  guardianConsent: boolean
}

export interface DevlogEntry {
  id: string
  studentId: string
  text: LocalizedText
  createdAt: string
}

export interface Team {
  id: string
  schoolId: string
  name: LocalizedText
  ageCategory: AgeCategory
  inviteCode: string
  memberIds: string[]
  leaderId: string | null
  approvalStatus: ApprovalStatus
  reviewNote: string
  devlog: DevlogEntry[]
  createdAt: string
}

export interface Judge {
  id: string
  name: LocalizedText
  email: string
  expertise: LocalizedText
  schoolId: string | null
  assignedTeamIds: string[]
}

export interface LMSSession {
  id: string
  title: LocalizedText
  description: LocalizedText
  mode: SessionMode
  startsAt: string
  durationMinutes: number
  assignment: LocalizedText
  resourceUrl: string
}

export interface QuizQuestion {
  id: string
  text: LocalizedText
  options: { id: string; text: LocalizedText }[]
  correctOptionId: string
}

export interface LMSCourse {
  id: string
  title: LocalizedText
  description: LocalizedText
  sessions: LMSSession[]
  quizQuestions: QuizQuestion[]
}

export interface StudentTrainingProgress {
  studentId: string
  attendedSessionIds: string[]
  completedAssignmentIds: string[]
  quizScore: number | null
  quizAnswers: Record<string, string>
  quizSubmittedAt: string | null
}

export interface SubmissionContent {
  title: LocalizedText
  description: LocalizedText
  genre: string
  platform: string
  buildUrl: string
  packageUrl: string
  repositoryUrl: string
  gddUrl: string
  presentationUrl: string
  coverUrl: string
  trailerUrl: string
  screenshotUrls: string[]
}

export interface SubmissionVersion {
  id: string
  version: string
  label: string
  content: SubmissionContent
  savedAt: string
  createdAt: string
  savedBy: string
}

export interface GameSubmission {
  id: string
  teamId: string
  content: SubmissionContent
  versions: SubmissionVersion[]
  status: SubmissionStatus
  updatedAt: string
  submittedAt: string | null
  lockedAt: string | null
}

export interface EvaluationCriterion {
  id: string
  name: LocalizedText
  description: LocalizedText
  weight: number
}

export interface JudgeEvaluation {
  id: string
  judgeId: string
  teamId: string
  scores: Record<string, number>
  strengths: string
  improvements: string
  recommendation: string
  status: EvaluationStatus
  updatedAt: string
  submittedAt: string | null
  lockedAt: string | null
}

export interface SpecialAward {
  id: string
  key: 'game_design' | 'story' | 'technical' | 'art' | 'mechanics' | 'audience'
  name: LocalizedText
  teamId: string | null
}

export interface TieBreakResolution {
  id: string
  teamIds: string[]
  orderedTeamIds: string[]
  criterionPriority: string[]
  note: string
  createdAt: string
}

export interface AuditLogItem {
  id: string
  timestamp: string
  actorId: string | null
  actorName: LocalizedText
  role: ChallengeRole
  action: string
  entityType: string
  entityId: string | null
  note: string
}

export interface ChallengeState {
  version: 1
  seededAt: string
  competition: Competition
  schools: School[]
  teams: Team[]
  students: Student[]
  judges: Judge[]
  course: LMSCourse
  trainingProgress: StudentTrainingProgress[]
  submissions: GameSubmission[]
  criteria: EvaluationCriterion[]
  evaluations: JudgeEvaluation[]
  awards: SpecialAward[]
  tieBreakResolutions: TieBreakResolution[]
  auditLog: AuditLogItem[]
  personas: { schoolId: string | null; studentId: string | null; judgeId: string | null }
  nextId: number
}

export interface ChallengeActionResult { ok: boolean; errorKey?: string }
export interface RegisterSchoolInput {
  name: string
  governorate: string
  type: School['type']
  contactName: string
  email: string
  phone: string
  expectedStudents: number
}

export interface SchoolStudentInput {
  name: string
  email: string
  nationalId: string
  dateOfBirth: string
  grade: number
  guardianConsent: boolean
}

export interface JudgeEvaluationInput {
  scores: Record<string, number>
  strengths: string
  improvements: string
  recommendation: string
}

export type ChallengeSimulatorScenario = 'withdrawal' | 'attendance' | 'extension' | 'anomaly' | 'tie'
export interface ChallengeSimulatorInput {
  teamId?: string
  studentId?: string
  teamIds?: string[]
  reason?: string
}

export interface ChallengeRanking {
  teamId: string
  rank: number
  score: number
  evaluationCount: number
  criterionScores: Record<string, number>
  judgeScores: { judgeId: string; score: number }[]
  spread: number
  isAnomaly: boolean
  tied: boolean
}

export const CHALLENGE_PHASES: ChallengePhase[] = ['registration', 'team_formation', 'training', 'submission', 'judging', 'results', 'archived']
