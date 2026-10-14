import { CHALLENGE_PHASES } from '../types/challenge'
import type { ChallengePhase, ChallengeState, LocalizedText, SubmissionContent } from '../types/challenge'

const DAY = 86_400_000
const text = (en: string, ar: string): LocalizedText => ({ en, ar })
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const at = (now: number, days: number) => new Date(now + days * DAY).toISOString()

export function emptySubmissionContent(): SubmissionContent {
  return { title: text('', ''), description: text('', ''), genre: 'educational', platform: 'web', buildUrl: '', packageUrl: '', repositoryUrl: '', gddUrl: '', presentationUrl: '', coverUrl: '', trailerUrl: '', screenshotUrls: [] }
}

/** A fixed PRNG makes demo identities, assignments, and scores reproducible. */
function seededRandom(seed = 4217) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4_294_967_296
  }
}

export function createChallengeSeed(phase: ChallengePhase = 'team_formation', now = Date.now()): ChallengeState {
  const random = seededRandom()
  const state: ChallengeState = {
    version: 1, seededAt: at(now, 0), nextId: 1000,
    competition: {
      id: 'challenge-2026', title: text('Schools Game Development Challenge', 'تحدي تطوير الألعاب للمدارس'),
      description: text('Learn, build, and share a game that makes a difference.', 'تعلّم وطوّر وشارك لعبة تصنع فرقًا.'),
      phase, registrationDeadline: at(now, 7), submissionDeadline: at(now, 3), judgingDeadline: at(now, 10), resultsDate: at(now, 14),
      ageCategories: ['12-14', '15-18'], minTeamMembers: 3, maxTeamMembers: 5, trainingThreshold: 80,
      blindJudging: true, resultsVisibility: 'hidden', criterionPriority: ['creativity', 'gameplay', 'technical', 'art', 'presentation'],
    },
    schools: [], teams: [], students: [], judges: [],
    course: {
      id: 'course-01', title: text('From an idea to a playable game', 'من فكرة إلى لعبة قابلة للعب'),
      description: text('Seven practical sessions to prepare your team for the challenge.', 'سبع جلسات عملية لإعداد فريقك للتحدي.'), sessions: [], quizQuestions: [],
    },
    trainingProgress: [], submissions: [], criteria: [], evaluations: [], awards: [], tieBreakResolutions: [], auditLog: [],
    personas: { schoolId: 'school-01', studentId: 'student-001', judgeId: 'judge-01' },
  }
  const schoolNames = [
    ['Amman Future School', 'مدرسة عمّان المستقبل'], ['Irbid Pioneers School', 'مدرسة إربد الروّاد'],
    ['Zarqa Innovation School', 'مدرسة الزرقاء للابتكار'], ['Aqaba Horizons School', 'مدرسة آفاق العقبة'],
    ['Karak Knowledge School', 'مدرسة الكرك المعرفة'], ['Salt Excellence School', 'مدرسة السلط التميّز'],
    ['Madaba Creativity School', 'مدرسة مادبا الإبداع'], ['Mafraq Discovery School', 'مدرسة المفرق الاستكشاف'],
  ]
  const governorates = ['amman', 'irbid', 'zarqa', 'aqaba', 'karak', 'balqa', 'madaba', 'mafraq']
  schoolNames.forEach(([en, ar], index) => {
    const id = `school-${String(index + 1).padStart(2, '0')}`
    state.schools.push({ id, name: text(en!, ar!), governorate: governorates[index]!, type: index % 3 === 0 ? 'private' : 'public', contactName: text(`Coordinator ${index + 1}`, `منسّق المدرسة ${index + 1}`), email: `school${index + 1}@example.org`, phone: `079100000${index + 1}`, expectedStudents: index < 4 ? 8 : 4, approvalStatus: index === 6 ? 'pending' : 'approved', reviewNote: '', registeredAt: at(now, -28 + index) })
  })
  const teamNames = [
    ['Pixel Pioneers', 'روّاد البكسل'], ['Code Falcons', 'صقور البرمجة'], ['Future Makers', 'صنّاع المستقبل'],
    ['Green Quest', 'الرحلة الخضراء'], ['Orbit Studio', 'استوديو المدار'], ['Desert Stars', 'نجوم الصحراء'],
    ['Dream Builders', 'بنّاؤو الأحلام'], ['Byte Heroes', 'أبطال البايت'], ['Creative Sparks', 'شرارات الإبداع'],
    ['Game Voyagers', 'رحّالة الألعاب'], ['Bright Minds', 'العقول المضيئة'], ['Digital Explorers', 'المستكشفون الرقميون'],
  ]
  const givenNames = [['Omar', 'عمر'], ['Layan', 'ليان'], ['Yazan', 'يزن'], ['Salma', 'سلمى'], ['Adam', 'آدم'], ['Mira', 'ميرا'], ['Ahmad', 'أحمد'], ['Jana', 'جنى']]
  const schoolIndices = [0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7]
  teamNames.forEach(([en, ar], index) => {
    const id = `team-${String(index + 1).padStart(2, '0')}`
    const schoolId = state.schools[schoolIndices[index]!]!.id
    const ageCategory = index % 2 === 0 ? '15-18' : '12-14'
    const memberIds = Array.from({ length: 4 }, (_, member) => `student-${String(index * 4 + member + 1).padStart(3, '0')}`)
    const inviteCode = `GLABA${String.fromCharCode(65 + index)}`
    state.teams.push({ id, schoolId, name: text(en!, ar!), ageCategory, inviteCode, memberIds, leaderId: memberIds[0]!, approvalStatus: schoolIndices[index] === 6 ? 'pending' : 'approved', reviewNote: '', devlog: [{ id: `devlog-${index + 1}`, studentId: memberIds[0]!, text: text('We tested our first playable prototype and collected feedback.', 'اختبرنا النموذج الأول القابل للعب وجمعنا الملاحظات.'), createdAt: at(now, -3) }], createdAt: at(now, -21) })
    memberIds.forEach((studentId, member) => {
      const number = index * 4 + member + 1
      const given = givenNames[(number - 1) % givenNames.length]!
      state.students.push({ id: studentId, schoolId, teamId: id, name: text(`${given[0]} ${index + 1}`, `${given[1]} ${index + 1}`), email: `student${number}@example.org`, nationalId: `201000${String(number).padStart(4, '0')}`, dateOfBirth: `${ageCategory === '15-18' ? '2010' : '2013'}-${String(member + 1).padStart(2, '0')}-15`, grade: ageCategory === '15-18' ? 10 + member % 2 : 7 + member % 2, guardianConsent: true })
    })
  })
  state.students.push(
    { id: 'student-049', schoolId: 'school-01', teamId: null, name: text('Noor Haddad', 'نور حدّاد'), email: 'noor@example.org', nationalId: '2010000049', dateOfBirth: '2010-05-12', grade: 10, guardianConsent: true },
    { id: 'student-050', schoolId: 'school-02', teamId: null, name: text('Tareq Salim', 'طارق سليم'), email: 'tareq@example.org', nationalId: '2010000050', dateOfBirth: '2013-03-18', grade: 8, guardianConsent: true },
  )
  const sessionData = [
    ['Game design foundations', 'أساسيات تصميم الألعاب', 'Define your player, goal, and core loop.', 'حدّد اللاعب والهدف ودورة اللعب الأساسية.'],
    ['Your first playable scene', 'مشهدك الأول القابل للعب', 'Build a small scene with player movement.', 'أنشئ مشهدًا صغيرًا مع حركة اللاعب.'],
    ['Mechanics and feedback', 'الميكانيكا والتغذية الراجعة', 'Add a clear rule, reward, and feedback.', 'أضف قاعدة واضحة ومكافأة وتغذية راجعة.'],
    ['Art and sound', 'الفن والصوت', 'Create a consistent visual and audio style.', 'أنشئ أسلوبًا بصريًا وصوتيًا متناسقًا.'],
    ['Levels and accessibility', 'المراحل وإمكانية الوصول', 'Design an accessible introduction level.', 'صمّم مرحلة تمهيدية يسهل الوصول إليها.'],
    ['Testing and iteration', 'الاختبار والتحسين', 'Test your game and document three improvements.', 'اختبر لعبتك ووثّق ثلاثة تحسينات.'],
    ['Presenting your game', 'عرض لعبتك', 'Prepare your design document and short pitch.', 'أعدّ وثيقة التصميم وعرضًا مختصرًا.'],
  ]
  sessionData.forEach(([en, ar, assignmentEn, assignmentAr], index) => state.course.sessions.push({ id: `session-${index + 1}`, title: text(en!, ar!), description: text('Practice together, share your work, and ask questions.', 'تدرّبوا معًا وشاركوا أعمالكم واطرحوا أسئلتكم.'), mode: (['live', 'in_person', 'recorded'] as const)[index % 3]!, startsAt: at(now, -10 + index), durationMinutes: 90, assignment: text(assignmentEn!, assignmentAr!), resourceUrl: 'https://example.org/challenge/resources' }))
  const quiz = [
    ['What defines a game’s core loop?', 'ما الذي يحدّد دورة اللعب الأساسية؟', ['Repeated player actions and feedback', 'Only the title', 'The file size'], ['أفعال اللاعب المتكرّرة والتغذية الراجعة', 'العنوان فقط', 'حجم الملف']],
    ['Why do we test with players?', 'لماذا نختبر اللعبة مع اللاعبين؟', ['To find unclear or frustrating parts', 'To remove all rules', 'To increase file size'], ['لاكتشاف الأجزاء غير الواضحة أو المحبطة', 'لإزالة جميع القواعد', 'لزيادة حجم الملف']],
    ['Which choice improves accessibility?', 'أي خيار يحسّن إمكانية الوصول؟', ['Clear instructions and readable contrast', 'Very small text', 'Using color alone for meaning'], ['تعليمات واضحة وتباين مقروء', 'نص صغير جدًا', 'الاعتماد على اللون وحده للمعنى']],
    ['What belongs in a game design document?', 'ماذا تتضمّن وثيقة تصميم اللعبة؟', ['Goals, mechanics, and player experience', 'Only a screenshot', 'Private passwords'], ['الأهداف والميكانيكا وتجربة اللاعب', 'لقطة شاشة فقط', 'كلمات مرور خاصة']],
    ['How should a team use feedback?', 'كيف ينبغي للفريق استخدام الملاحظات؟', ['Choose improvements, test, and iterate', 'Ignore every comment', 'Change the whole project at random'], ['اختيار تحسينات واختبارها وتكرار التطوير', 'تجاهل جميع التعليقات', 'تغيير المشروع كله عشوائيًا']],
  ] as const
  quiz.forEach(([en, ar, optionsEn, optionsAr], index) => {
    const correctIndex = index % 3
    const choices = [0, 1, 2].map(position => { const source = (position - correctIndex + 3) % 3; return { id: `option-${position + 1}`, text: text(optionsEn[source]!, optionsAr[source]!) } })
    state.course.quizQuestions.push({ id: `question-${index + 1}`, text: text(en, ar), options: choices, correctOptionId: `option-${correctIndex + 1}` })
  })
  state.students.forEach(student => state.trainingProgress.push({ studentId: student.id, attendedSessionIds: state.course.sessions.map(session => session.id), completedAssignmentIds: state.course.sessions.map(session => session.id), quizScore: 100, quizAnswers: Object.fromEntries(state.course.quizQuestions.map(question => [question.id, question.correctOptionId])), quizSubmittedAt: at(now, -2) }))
  const rubric = [['creativity', 'Creativity and impact', 'الإبداع والأثر', 30], ['gameplay', 'Gameplay and experience', 'اللعب والتجربة', 25], ['technical', 'Technical quality', 'الجودة التقنية', 20], ['art', 'Art and sound', 'الفن والصوت', 15], ['presentation', 'Presentation and documentation', 'العرض والتوثيق', 10]] as const
  rubric.forEach(([id, en, ar, weight]) => state.criteria.push({ id, name: text(en, ar), description: text('Assess the quality and clarity of the team’s work.', 'قيّم جودة عمل الفريق ووضوحه.'), weight }))
  const judgeNames = [['Rana Khalil', 'رنا خليل'], ['Sami Nasser', 'سامي ناصر'], ['Dina Mousa', 'دينا موسى'], ['Hani Adel', 'هاني عادل'], ['Lina Saleh', 'لينا صالح'], ['Zaid Hasan', 'زيد حسن']]
  judgeNames.forEach(([en, ar], index) => state.judges.push({ id: `judge-${String(index + 1).padStart(2, '0')}`, name: text(en!, ar!), email: `judge${index + 1}@example.org`, expertise: text(index % 2 ? 'Game development and education' : 'Game design and interactive media', index % 2 ? 'تطوير الألعاب والتعليم' : 'تصميم الألعاب والوسائط التفاعلية'), schoolId: index === 0 ? 'school-01' : null, assignedTeamIds: [] }))
  state.teams.forEach((team, index) => {
    const available = state.judges.filter(judge => judge.schoolId !== team.schoolId)
    for (let offset = 0; offset < 3; offset++) available[(index + offset) % available.length]!.assignedTeamIds.push(team.id)
  })
  const gameNames = [['Water Guardians', 'حرّاس الماء'], ['Solar Adventure', 'مغامرة الشمس'], ['Recycling Heroes', 'أبطال إعادة التدوير'], ['The Lost Garden', 'الحديقة المفقودة'], ['Orbit Rescue', 'إنقاذ المدار'], ['Desert Journey', 'رحلة الصحراء'], ['Color Stories', 'حكايات الألوان'], ['Byte Valley', 'وادي البايت'], ['Tiny Planet', 'الكوكب الصغير'], ['History Quest', 'رحلة التاريخ'], ['Bridge Builder', 'بنّاء الجسور'], ['Dream Forest', 'غابة الأحلام']]
  state.teams.forEach((team, index) => {
    const name = gameNames[index]!
    const content: SubmissionContent = { ...emptySubmissionContent(), title: text(name[0]!, name[1]!), description: text('A student-made game about teamwork, discovery, and caring for our world.', 'لعبة طوّرها الطلاب عن التعاون والاستكشاف والعناية بعالمنا.'), genre: ['educational', 'adventure', 'puzzle', 'platformer'][index % 4]!, buildUrl: 'https://example.org/challenge/play', packageUrl: 'https://example.org/challenge/game.zip', repositoryUrl: 'https://example.org/challenge/source', gddUrl: 'https://example.org/challenge/design.pdf', presentationUrl: 'https://example.org/challenge/presentation.pdf', trailerUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' }
    const savedAt = at(now, -1)
    state.submissions.push({ id: `submission-${index + 1}`, teamId: team.id, content, versions: [{ id: `version-${index + 1}-0`, version: '1.0', label: '1.0', content: clone(content), savedAt, createdAt: savedAt, savedBy: team.leaderId! }], status: index === 0 || index > 7 ? 'draft' : index % 2 ? 'locked' : 'submitted', updatedAt: savedAt, submittedAt: index === 0 || index > 7 ? null : savedAt, lockedAt: index % 2 && index < 8 ? savedAt : null })
    state.judges.filter(judge => judge.assignedTeamIds.includes(team.id)).forEach((judge, judgeIndex) => {
      const base = 92 - index * 2 + Math.floor(random() * 7) - 3
      const scores = Object.fromEntries(state.criteria.map(criterion => [criterion.id, Math.max(30, Math.min(100, base + Math.floor(random() * 9) - 4))]))
      state.evaluations.push({ id: `evaluation-${index + 1}-${judgeIndex + 1}`, judgeId: judge.id, teamId: team.id, scores, strengths: 'Clear goal and thoughtful iteration.', improvements: 'Continue refining the onboarding experience.', recommendation: 'A promising game to keep developing.', status: 'submitted', updatedAt: at(now, -0.5), submittedAt: at(now, -0.5), lockedAt: at(now, -0.5) })
    })
  })
  const awards = [['game_design', 'Best game design', 'أفضل تصميم لعبة'], ['story', 'Best story', 'أفضل قصة'], ['technical', 'Technical innovation', 'ابتكار تقني'], ['art', 'Best art', 'أفضل فن'], ['mechanics', 'Best mechanics', 'أفضل ميكانيكا'], ['audience', 'Audience choice', 'اختيار الجمهور']] as const
  awards.forEach(([key, en, ar], index) => state.awards.push({ id: `award-${index + 1}`, key, name: text(en, ar), teamId: state.teams[index]?.id ?? null }))
  state.auditLog.push({ id: 'audit-seed', timestamp: state.seededAt, actorId: null, actorName: text('Demo system', 'النظام التجريبي'), role: 'admin', action: 'demo_seeded', entityType: 'competition', entityId: state.competition.id, note: phase })
  return trimToPhase(state, phase)
}

/** Removes later-stage data instead of merely changing the phase badge. */
export function trimToPhase(state: ChallengeState, phase: ChallengePhase): ChallengeState {
  const index = CHALLENGE_PHASES.indexOf(phase)
  state.competition.phase = phase
  if (index < 1) {
    state.teams = []
    state.students.forEach(student => { student.teamId = null })
  }
  if (index < 2) {
    state.trainingProgress.forEach(progress => { progress.attendedSessionIds = []; progress.completedAssignmentIds = []; progress.quizScore = null; progress.quizAnswers = {}; progress.quizSubmittedAt = null })
    state.teams.forEach(team => { team.devlog = [] })
  } else if (phase === 'training') {
    state.trainingProgress.forEach((progress, studentIndex) => {
      const completed = studentIndex < 4 ? 0 : studentIndex % 8
      progress.attendedSessionIds = state.course.sessions.slice(0, completed).map(session => session.id)
      progress.completedAssignmentIds = state.course.sessions.slice(0, Math.max(0, completed - 1)).map(session => session.id)
      progress.quizScore = null; progress.quizAnswers = {}; progress.quizSubmittedAt = null
    })
  }
  if (index < 3) state.submissions = []
  if (index < 4) {
    state.evaluations = []
    state.judges.forEach(judge => { judge.assignedTeamIds = [] })
  } else {
    state.submissions.forEach(submission => { submission.status = 'locked'; submission.submittedAt ||= state.seededAt; submission.lockedAt ||= state.seededAt })
  }
  if (index < 5) {
    state.tieBreakResolutions = []
    state.awards.forEach(award => { award.teamId = null })
    state.competition.resultsVisibility = 'hidden'
  } else state.competition.resultsVisibility = 'published'
  return state
}
