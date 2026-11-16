import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { PIPELINE_AGENTS } from '../data/knowledgeBase';
import { FinalAgentName } from '../types/exam';

interface HeroPipelineProps {
  mode: 'hero';
}

interface CompactPipelineProps {
  mode: 'compact';
  activeStageIndex: number; // -1 = awaiting candidate, 0..4 = sequential cascade
  activeFinalAgent: FinalAgentName;
  completedStepsCount: number;
  totalSteps: number;
  currentStepNumber: number;
}

type AgentPipelineProps = HeroPipelineProps | CompactPipelineProps;

export const AgentPipeline: React.FC<AgentPipelineProps> = (props) => {
  if (props.mode === 'hero') {
    return (
      <div className="relative w-full py-2">
        {/* Desktop horizontal animated track */}
        <div className="relative hidden lg:block">
          {/* Connecting baseline with traveling signal dot */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-8 right-8 top-6 h-px bg-blue-300/25 overflow-hidden"
          >
            <div className="animate-signal-travel absolute inset-y-0 left-0 w-24">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-sky-300 to-transparent" />
            </div>
          </div>

          <div className="relative grid grid-cols-8 gap-2">
            {PIPELINE_AGENTS.map((agent, idx) => (
              <div
                key={agent.id}
                className="group relative flex flex-col items-center text-center"
              >
                <div
                  className="animate-node-pulse relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200/30 bg-[#132C56] text-xs font-mono font-semibold text-sky-100 shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-300/60"
                  style={{ animationDelay: `${idx * 260}ms` }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <span className="mt-2.5 text-xs font-medium leading-tight text-blue-50">
                  {agent.label}
                </span>
                <span className="mt-1 hidden xl:block text-[11px] leading-snug text-blue-200/75 px-1">
                  {agent.shortLabel === 'Сравнение'
                    ? 'Сверка с эталоном'
                    : agent.shortLabel === 'Ветка'
                      ? 'Выбор маршрута'
                      : agent.shortLabel === 'Профайлер'
                        ? 'Профиль по 5 темам'
                        : agent.shortLabel === 'Тема'
                          ? 'Следующий вопрос'
                          : agent.shortLabel === 'Экзаменатор'
                            ? 'Ведёт интервью'
                            : agent.shortLabel === 'Консультант'
                              ? 'Справка по меню'
                              : agent.shortLabel === 'Завершение'
                                ? 'Итоговый вердикт'
                                : 'Защита правил'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tablet & Mobile horizontal scroll / clean grid */}
        <div className="relative lg:hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PIPELINE_AGENTS.map((agent, idx) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 rounded-lg border border-blue-200/20 bg-[#132C56]/80 px-3 py-2"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-400/15 font-mono text-[11px] font-semibold text-sky-200 tabular-nums">
                  {idx + 1}
                </span>
                <span className="text-xs font-medium text-blue-50 truncate">
                  {agent.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {
    activeStageIndex,
    activeFinalAgent,
    completedStepsCount,
    totalSteps,
    currentStepNumber,
  } = props;

  const cascadeStages = [
    { id: 'answer_check', label: 'Сравнение ответа' },
    { id: 'branch', label: 'Ветка' },
    { id: 'profiler', label: 'Профайлер' },
    { id: 'topic_analyzer', label: 'Выбор темы' },
    { id: 'final', label: activeFinalAgent },
  ];

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
      {/* Agent cascade nodes */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0"
        aria-label="Конвейер агентов текущего шага"
      >
        {cascadeStages.map((stage, idx) => {
          const isCompleted =
            activeStageIndex > idx ||
            (activeStageIndex === -1 && completedStepsCount > 0 && idx < 4);
          const isActive = activeStageIndex === idx;
          const isFinalIdleHighlight =
            activeStageIndex === -1 && idx === 4;

          return (
            <React.Fragment key={stage.id}>
              <div
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm animate-node-pulse'
                    : isFinalIdleHighlight
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      isActive
                        ? 'text-blue-100'
                        : isFinalIdleHighlight
                          ? 'text-blue-600'
                          : 'text-slate-400'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                )}
                <span>{stage.label}</span>
              </div>
              {idx < cascadeStages.length - 1 && (
                <ArrowRight
                  className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    isCompleted || isActive ? 'text-blue-500' : 'text-slate-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepIdx = idx + 1;
            const done = stepIdx <= completedStepsCount;
            const current = stepIdx === currentStepNumber && completedStepsCount < totalSteps;
            return (
              <span
                key={stepIdx}
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-mono font-medium tabular-nums transition-colors ${
                  done
                    ? 'bg-emerald-600 text-white'
                    : current
                      ? 'border border-blue-600 bg-blue-50 text-blue-700'
                      : 'border border-slate-200 bg-white text-slate-400'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : stepIdx}
              </span>
            );
          })}
        </div>
        <span className="text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap">
          Шаг {Math.min(currentStepNumber, totalSteps)} из {totalSteps}
        </span>
      </div>
    </div>
  );
};
