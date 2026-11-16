import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  HelpCircle,
  Info,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  AnswerEvaluation,
  CandidateProfile,
  ChatMessage,
  FinalAgentName,
  ReplyOption,
  ScenarioData,
  StepTraceLog,
} from '../types/exam';
import {
  CATEGORY_ORDER,
  createInitialProfile,
  formatAgentTraceText,
  updateProfileWithReply,
} from '../utils/scoring';
import { AgentPipeline } from './AgentPipeline';

interface ExamWorkspaceProps {
  scenario: ScenarioData;
  allScenarios: ScenarioData[];
  onSwitchScenario: (id: ScenarioData['id']) => void;
  onBackToLanding: () => void;
  onOpenKnowledgeBase: () => void;
  onCompleteMission: (
    finalProfile: CandidateProfile,
    traces: StepTraceLog[]
  ) => void;
}

function EvaluationBadge({ evaluation }: { evaluation?: AnswerEvaluation }) {
  if (!evaluation) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <Info className="h-3.5 w-3.5 text-slate-500" />
        <span>Служебный шаг (без балла)</span>
      </span>
    );
  }
  if (evaluation === 'правильно') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>Правильно</span>
      </span>
    );
  }
  if (evaluation === 'частично правильно') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
        <span>Частично правильно</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
      <XCircle className="h-3.5 w-3.5 text-red-600" />
      <span>Неправильно</span>
    </span>
  );
}

export const ExamWorkspace: React.FC<ExamWorkspaceProps> = ({
  scenario,
  allScenarios,
  onSwitchScenario,
  onBackToLanding,
  onOpenKnowledgeBase,
  onCompleteMission,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [profile, setProfile] = useState<CandidateProfile>(() =>
    createInitialProfile()
  );
  const [traces, setTraces] = useState<StepTraceLog[]>([]);
  const [selectedTraceStep, setSelectedTraceStep] = useState<number | null>(
    null
  );
  const [isTraceExpanded, setIsTraceExpanded] = useState(false);
  const [expandedChatTraceIds, setExpandedChatTraceIds] = useState<
    Record<string, boolean>
  >({});

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: `init-${scenario.id}`,
      sender: 'agent',
      agentName: 'Экзаменатор',
      text: scenario.initialQuestion,
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [cascadeStage, setCascadeStage] = useState<number>(-1);
  const [activeFinalAgent, setActiveFinalAgent] =
    useState<FinalAgentName>('Экзаменатор');
  const [highlightTick, setHighlightTick] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [mobileTab, setMobileTab] = useState<'dialog' | 'agents'>('dialog');
  const [agentsUpdatedBadge, setAgentsUpdatedBadge] = useState(false);
  const [freeText, setFreeText] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearPendingTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Reset state whenever scenario changes
  useEffect(() => {
    clearPendingTimers();
    setCurrentStepIndex(0);
    setProfile(createInitialProfile());
    setTraces([]);
    setSelectedTraceStep(null);
    setIsTraceExpanded(false);
    setExpandedChatTraceIds({});
    setMessages([
      {
        id: `init-${scenario.id}-${Date.now()}`,
        sender: 'agent',
        agentName: 'Экзаменатор',
        text: scenario.initialQuestion,
      },
    ]);
    setIsTyping(false);
    setCascadeStage(-1);
    setActiveFinalAgent('Экзаменатор');
    setHighlightTick(0);
    setIsFinished(false);
    setMobileTab('dialog');
    setAgentsUpdatedBadge(false);
    setFreeText('');
    return () => clearPendingTimers();
  }, [scenario]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping, isFinished]);

  const currentStep = scenario.steps[currentStepIndex];

  const handleRestart = () => {
    clearPendingTimers();
    setCurrentStepIndex(0);
    setProfile(createInitialProfile());
    setTraces([]);
    setSelectedTraceStep(null);
    setIsTraceExpanded(false);
    setExpandedChatTraceIds({});
    setMessages([
      {
        id: `init-${scenario.id}-${Date.now()}`,
        sender: 'agent',
        agentName: 'Экзаменатор',
        text: scenario.initialQuestion,
      },
    ]);
    setIsTyping(false);
    setCascadeStage(-1);
    setActiveFinalAgent('Экзаменатор');
    setHighlightTick(0);
    setIsFinished(false);
    setAgentsUpdatedBadge(false);
    setFreeText('');
  };

  const handleSelectReply = (reply: ReplyOption) => {
    if (isTyping || isFinished || !currentStep) return;

    const candidateMsg: ChatMessage = {
      id: `cand-${currentStep.stepNumber}-${reply.id}-${Date.now()}`,
      sender: 'candidate',
      text: reply.label,
      stepNumber: currentStep.stepNumber,
    };

    setMessages((prev) => [...prev, candidateMsg]);
    setIsTyping(true);
    setActiveFinalAgent(reply.finalAgent);

    const updatedProfile = updateProfileWithReply(
      profile,
      reply,
      currentStep.profileCategory
    );

    const isLastStep = currentStepIndex === scenario.steps.length - 1;
    const isPassing = updatedProfile.score >= 70;

    const finalTextParts: string[] = [];
    if (isLastStep) {
      finalTextParts.push(
        isPassing
          ? `${reply.agentReplyText}\n\nВердикт: СДАЛ (${updatedProfile.score}%). ${scenario.passSummaryText}`
          : `${reply.agentReplyText}\n\nВердикт: НЕ СДАЛ (${updatedProfile.score}%). ${scenario.failSummaryText}`
      );
    } else {
      finalTextParts.push(reply.agentReplyText);
      if (reply.nextQuestionText) {
        finalTextParts.push(reply.nextQuestionText);
      }
    }

    const fullFinalAgentResponse = finalTextParts.join('\n\n');

    const trace: StepTraceLog = {
      stepNumber: currentStep.stepNumber,
      candidateText: reply.label,
      wasAnswer: reply.wasAnswer,
      pastTopic: currentStep.topicLabel,
      evaluation: reply.evaluation,
      checkComment: reply.checkComment,
      branch: reply.branch,
      finalAgent: reply.finalAgent,
      profileSnapshot: updatedProfile,
      nextTopic: reply.nextTopicLabel,
      nextDifficulty: reply.nextDifficulty,
      nextTopicReason: reply.nextTopicReason,
      nextExpectedAnswer:
        reply.nextExpectedAnswer ?? currentStep.expectedAnswer,
      finalAgentResponse: fullFinalAgentResponse,
    };

    // Sequential pipeline cascade: 0 -> 1 -> 2 -> 3 -> 4
    setCascadeStage(0);
    const t1 = window.setTimeout(() => setCascadeStage(1), 130);
    const t2 = window.setTimeout(() => setCascadeStage(2), 260);
    const t3 = window.setTimeout(() => {
      setCascadeStage(3);
      setProfile(updatedProfile);
      setTraces((prev) => [...prev, trace]);
      setSelectedTraceStep(trace.stepNumber);
      setHighlightTick((n) => n + 1);
      if (mobileTab === 'dialog') {
        setAgentsUpdatedBadge(true);
      }
    }, 390);
    const t4 = window.setTimeout(() => setCascadeStage(4), 520);
    const t5 = window.setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `agent-${currentStep.stepNumber}-${Date.now()}`,
        sender: 'agent',
        agentName: reply.finalAgent,
        text: fullFinalAgentResponse,
        stepNumber: currentStep.stepNumber,
        trace,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      setCascadeStage(-1);
      if (isLastStep) {
        setIsFinished(true);
      } else {
        setCurrentStepIndex((idx) => idx + 1);
      }
    }, 760);

    timersRef.current.push(t1, t2, t3, t4, t5);
  };

  const handleFreeTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = freeText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `free-${Date.now()}`,
      sender: 'candidate',
      text: trimmed,
    };

    const noticeMsg: ChatMessage = {
      id: `notice-${Date.now() + 1}`,
      sender: 'system',
      text: 'Это демо-стенд: показан заранее записанный сценарий работы системы. Живой экзамен проходит в полной версии.',
      showScenarioShortcuts: true,
    };

    setMessages((prev) => [...prev, userMsg, noticeMsg]);
    setFreeText('');
  };

  const activeTrace = useMemo(() => {
    if (traces.length === 0) return null;
    if (selectedTraceStep !== null) {
      const found = traces.find((t) => t.stepNumber === selectedTraceStep);
      if (found) return found;
    }
    return traces[traces.length - 1];
  }, [traces, selectedTraceStep]);

  const currentTopicDisplay = activeTrace
    ? activeTrace.nextTopic
    : scenario.initialTopic;
  const currentDifficultyDisplay = activeTrace
    ? activeTrace.nextDifficulty ?? '—'
    : scenario.initialDifficulty;
  const currentExpectedDisplay = activeTrace
    ? activeTrace.nextExpectedAnswer
    : scenario.initialExpectedAnswer;

  const statusColorClass =
    profile.status === 'сильный'
      ? 'text-emerald-700'
      : profile.status === 'средний'
        ? 'text-blue-700'
        : 'text-red-700';

  const completedStepsCount = traces.length;
  const currentDisplayStep = isFinished
    ? scenario.steps.length
    : currentStepIndex + 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Workspace Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Row 1: Navigation & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onBackToLanding}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>К сценариям</span>
              </button>
              <div className="hidden sm:block h-4 w-px bg-slate-200" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-900 truncate">
                  {scenario.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenKnowledgeBase}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5 text-blue-700" />
                <span>Меню и регламент</span>
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Пройти ещё раз</span>
              </button>
            </div>
          </div>

          {/* Row 2: Mini Agent Pipeline & Step Progress */}
          <div className="py-2.5">
            <AgentPipeline
              mode="compact"
              activeStageIndex={cascadeStage}
              activeFinalAgent={activeFinalAgent}
              completedStepsCount={completedStepsCount}
              totalSteps={scenario.steps.length}
              currentStepNumber={currentDisplayStep}
            />
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMobileTab('dialog')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              mobileTab === 'dialog'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Диалог</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('agents');
              setAgentsUpdatedBadge(false);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
              mobileTab === 'agents'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Агенты</span>
            {agentsUpdatedBadge && (
              <span className="font-mono text-[10px] font-semibold text-blue-700">
                (обновлено)
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6">
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* LEFT: Dialog Column */}
          <section
            aria-label="Диалог экзамена"
            className={`lg:col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs ${
              mobileTab === 'dialog' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Экзаменатор ↔ Вы (официант)
                </h2>
                <p className="text-xs text-slate-500">
                  Демо: сокращённый экзамен из 5 шагов. Полная версия — 8–12 вопросов
                </p>
              </div>
              <span className="hidden sm:inline font-mono text-xs font-medium text-slate-500 tabular-nums">
                {completedStepsCount}/{scenario.steps.length}
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 max-h-[54vh] min-h-[340px]">
              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div
                      key={msg.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-slate-800"
                    >
                      <p className="font-medium leading-relaxed">{msg.text}</p>
                      {msg.showScenarioShortcuts && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {allScenarios.map((sc) => (
                            <button
                              key={sc.id}
                              type="button"
                              onClick={() => onSwitchScenario(sc.id)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                                sc.id === scenario.id
                                  ? 'border-blue-600 bg-blue-700 text-white'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700'
                              }`}
                            >
                              {sc.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                const isCandidate = msg.sender === 'candidate';
                const isTraceOpen = !!expandedChatTraceIds[msg.id];

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCandidate ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span>
                        {isCandidate
                          ? 'Вы (официант)'
                          : `Агент: ${msg.agentName ?? 'Экзаменатор'}`}
                      </span>
                      {msg.stepNumber && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            Шаг {msg.stepNumber}
                          </span>
                        </>
                      )}
                    </div>

                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                        isCandidate
                          ? 'bg-blue-700 text-white shadow-xs'
                          : msg.agentName === 'Защита'
                            ? 'border border-indigo-200 bg-indigo-50/70 text-slate-900'
                            : msg.agentName === 'Консультант'
                              ? 'border border-sky-200 bg-sky-50/70 text-slate-900'
                              : msg.agentName === 'Завершение'
                                ? 'border border-emerald-200 bg-emerald-50/60 text-slate-900'
                                : 'border border-slate-200 bg-slate-50 text-slate-900'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Inline expandable trace toggle on step responses */}
                    {msg.trace && (
                      <div className="mt-1.5 max-w-[92%]">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedChatTraceIds((prev) => ({
                              ...prev,
                              [msg.id]: !prev[msg.id],
                            }));
                            setSelectedTraceStep(msg.trace!.stepNumber);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 transition-colors hover:text-blue-900"
                        >
                          <span>
                            {isTraceOpen
                              ? 'Скрыть работу агентов'
                              : 'Подробнее: как думали агенты'}
                          </span>
                          {isTraceOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {isTraceOpen && (
                          <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed text-slate-100 whitespace-pre-wrap">
                            {formatAgentTraceText(msg.trace)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="mb-1 text-[11px] font-semibold text-slate-500">
                    Агент: {activeFinalAgent}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">
                    печатает…
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Candidate Action Area (Reply Options OR Mission Summary CTA) */}
            <div className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-5 rounded-b-2xl space-y-4">
              {!isFinished && currentStep ? (
                <div>
                  <div className="mb-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Выберите реплику официанта (шаг {currentStep.stepNumber} из{' '}
                      {scenario.steps.length}):
                    </span>
                  </div>
                  <div className="space-y-2">
                    {currentStep.replies.map((reply) => (
                      <button
                        key={reply.id}
                        type="button"
                        disabled={isTyping}
                        onClick={() => handleSelectReply(reply)}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-2xs transition-all duration-150 hover:border-blue-500 hover:bg-blue-50/40 hover:text-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="leading-snug">{reply.label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : isFinished ? (
                <div className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Экзамен завершён · Балл: {profile.score}%
                    </div>
                    <p className="text-xs text-slate-600">
                      Профиль сформирован по всем проверенным темам
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCompleteMission(profile, traces)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Открыть итог миссии</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              {/* Free-text input (demonstrates honest demo boundary) */}
              <form
                onSubmit={handleFreeTextSubmit}
                className="flex items-center gap-2 border-t border-slate-200/80 pt-3"
              >
                <input
                  type="text"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Написать свой вариант ответа (режим проверки)…"
                  className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!freeText.trim() || isTyping}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-45 whitespace-nowrap shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Отправить</span>
                </button>
              </form>
            </div>
          </section>

          {/* RIGHT: Compact "How Agents Think" Panel */}
          <aside
            aria-label="Как думают агенты"
            className={`lg:col-span-5 flex flex-col gap-4 ${
              mobileTab === 'agents' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Compact Status Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Как думают агенты
                  </h2>
                  <p className="text-xs text-slate-500">
                    Обновляется в реальном времени на каждый выбор
                  </p>
                </div>
                {traces.length > 0 && (
                  <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                    Шаг {activeTrace?.stepNumber}
                  </span>
                )}
              </div>

              {/* 3 Key Live Fields with highlight flash on change */}
              <div
                key={highlightTick}
                className="mt-4 space-y-3"
              >
                <div
                  className={`rounded-xl border border-slate-100 bg-slate-50/70 p-3 ${
                    highlightTick > 0 ? 'animate-field-highlight' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Активный агент и ветка
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      {activeTrace?.branch === 'Защита' && (
                        <ShieldAlert className="h-3.5 w-3.5 text-indigo-600" />
                      )}
                      <span>
                        {activeTrace
                          ? `${activeTrace.finalAgent} · ${activeTrace.branch}`
                          : 'Экзаменатор · Экзаменация'}
                      </span>
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-xl border border-slate-100 bg-slate-50/70 p-3 ${
                    highlightTick > 0 ? 'animate-field-highlight' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Оценка прошлого ответа
                    </span>
                    {activeTrace ? (
                      <EvaluationBadge evaluation={activeTrace.evaluation} />
                    ) : (
                      <span className="text-xs text-slate-400">
                        Ожидание ответа
                      </span>
                    )}
                  </div>
                  {activeTrace && (
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {activeTrace.checkComment}
                    </p>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 gap-3 ${
                    highlightTick > 0 ? 'animate-field-highlight rounded-xl' : ''
                  }`}
                >
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="text-[11px] font-medium text-slate-500">
                      Текущая тема
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-900 leading-snug">
                      {currentTopicDisplay}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      Сложность: {currentDifficultyDisplay}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="text-[11px] font-medium text-slate-500">
                      Статус кандидата
                    </div>
                    <div
                      className={`mt-1 text-sm font-bold capitalize ${statusColorClass}`}
                    >
                      {profile.status}
                    </div>
                    <div className="mt-1 font-mono text-xs font-medium text-slate-600 tabular-nums">
                      Балл: {profile.score}% ({profile.evaluatedCount} оц.)
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Category Live Profile */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">
                    Профиль по 5 темам
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Проходной балл: 70%
                  </span>
                </div>

                <div className="space-y-2.5">
                  {CATEGORY_ORDER.map((key) => {
                    const cat = profile.categories[key];
                    if (key === 'confidence') {
                      return (
                        <div
                          key={key}
                          className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
                        >
                          <div className="text-xs font-semibold text-slate-800">
                            5. {cat.title}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
                            {cat.comment}
                          </p>
                        </div>
                      );
                    }

                    const pct = cat.percent;
                    const barColor =
                      pct === null
                        ? 'bg-slate-200'
                        : pct >= 80
                          ? 'bg-emerald-600'
                          : pct >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-600';

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-slate-700 truncate">
                            {cat.title}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600 tabular-nums whitespace-nowrap shrink-0">
                            {cat.questionsCount > 0
                              ? `${cat.questionsCount} вопр. · ${pct}%`
                              : 'не проверялось'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${pct ?? 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expected Answer Preview (demo superpower) */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="text-[11px] font-semibold text-slate-500">
                  Эталон для текущей проверки (EXPECTED ANSWER)
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {currentExpectedDisplay}
                </p>
              </div>

              {/* Expand Full Trace Button */}
              {activeTrace && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsTraceExpanded((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-50/60"
                  >
                    <span>
                      Подробнее: как думали агенты (шаг {activeTrace.stepNumber})
                    </span>
                    {isTraceExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>

                  {isTraceExpanded && (
                    <div className="mt-3 space-y-2">
                      {traces.length > 1 && (
                        <div className="flex flex-wrap gap-1.5">
                          {traces.map((t) => (
                            <button
                              key={t.stepNumber}
                              type="button"
                              onClick={() => setSelectedTraceStep(t.stepNumber)}
                              className={`rounded-md border px-2 py-1 font-mono text-[11px] font-medium tabular-nums transition-colors ${
                                activeTrace.stepNumber === t.stepNumber
                                  ? 'border-blue-600 bg-blue-700 text-white'
                                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Шаг {t.stepNumber}
                            </button>
                          ))}
                        </div>
                      )}
                      <pre className="max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-3.5 font-mono text-[11px] leading-relaxed text-slate-100 whitespace-pre-wrap">
                        {formatAgentTraceText(activeTrace)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
