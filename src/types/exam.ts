export type ProfileCategoryKey =
  | 'dishes'
  | 'regulation'
  | 'guest'
  | 'sales'
  | 'confidence';

export type AgentBranch =
  | 'Экзаменация'
  | 'Консультант'
  | 'Завершение'
  | 'Защита';

export type FinalAgentName =
  | 'Экзаменатор'
  | 'Консультант'
  | 'Завершение'
  | 'Защита';

export type AnswerEvaluation =
  | 'правильно'
  | 'частично правильно'
  | 'неправильно';

export type DifficultyLevel = 'простая' | 'средняя' | 'каверзная';

export type CandidateStatus = 'сильный' | 'средний' | 'слабый';

export type PipelineAgentId =
  | 'answer_check'
  | 'branch'
  | 'profiler'
  | 'topic_analyzer'
  | 'examiner'
  | 'consultant'
  | 'completion'
  | 'protection';

export interface PipelineAgentMeta {
  id: PipelineAgentId;
  label: string;
  shortLabel: string;
  role: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  ingredients: string;
  allergens: string[];
  note?: string;
}

export interface RegulationRule {
  id: number;
  title: string;
  description: string;
}

export interface ReplyOption {
  id: string;
  isPrimary: boolean;
  label: string;
  wasAnswer: boolean;
  evaluation?: AnswerEvaluation;
  checkComment: string;
  branch: AgentBranch;
  finalAgent: FinalAgentName;
  profileCategory?: ProfileCategoryKey;
  confidenceNote?: string;
  agentReplyText: string;
  nextQuestionText?: string;
  nextTopicLabel: string;
  nextDifficulty?: DifficultyLevel;
  nextTopicReason: string;
  nextExpectedAnswer?: string;
}

export interface ExamStep {
  stepNumber: number;
  topicLabel: string;
  profileCategory?: ProfileCategoryKey;
  difficulty?: DifficultyLevel;
  expectedAnswer: string;
  replies: ReplyOption[];
}

export interface ScenarioData {
  id: 'experienced' | 'nervous' | 'trickster';
  title: string;
  subtitle: string;
  tag: string;
  expectedStepsCount: number;
  initialQuestion: string;
  initialTopic: string;
  initialDifficulty: DifficultyLevel;
  initialExpectedAnswer: string;
  steps: ExamStep[];
  passSummaryText: string;
  passRecommendation: string;
  failSummaryText: string;
  failRecommendation: string;
}

export interface CategoryStats {
  key: ProfileCategoryKey;
  title: string;
  questionsCount: number;
  scoreSum: number;
  percent: number | null;
  comment: string;
}

export interface CandidateProfile {
  categories: Record<ProfileCategoryKey, CategoryStats>;
  evaluatedCount: number;
  totalScoreSum: number;
  score: number;
  status: CandidateStatus;
}

export interface StepTraceLog {
  stepNumber: number;
  candidateText: string;
  wasAnswer: boolean;
  pastTopic: string;
  evaluation?: AnswerEvaluation;
  checkComment: string;
  branch: AgentBranch;
  finalAgent: FinalAgentName;
  profileSnapshot: CandidateProfile;
  nextTopic: string;
  nextDifficulty?: DifficultyLevel;
  nextTopicReason: string;
  nextExpectedAnswer: string;
  finalAgentResponse: string;
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'candidate' | 'system';
  agentName?: FinalAgentName;
  text: string;
  stepNumber?: number;
  trace?: StepTraceLog;
  showScenarioShortcuts?: boolean;
}
