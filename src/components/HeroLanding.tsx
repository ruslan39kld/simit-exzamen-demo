import React from 'react';
import { ArrowRight, BookOpen, MessageSquareText, Play, ShieldAlert, UserCheck, X } from 'lucide-react';
import { ScenarioData } from '../types/exam';
import { AgentPipeline } from './AgentPipeline';

interface HeroLandingProps {
  scenarios: ScenarioData[];
  onStartScenario: (scenarioId: ScenarioData['id']) => void;
  onOpenKnowledgeBase: () => void;
  showFirstVisitHint: boolean;
  onDismissHint: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  scenarios,
  onStartScenario,
  onOpenKnowledgeBase,
  showFirstVisitHint,
  onDismissHint,
}) => {
  const otherScenarios = scenarios.filter((s) => s.id !== 'experienced');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Dark-blue gradient Hero block (#1B3A6B -> darker) */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            'linear-gradient(180deg, #1B3A6B 0%, #142C54 55%, #0B1933 100%)',
        }}
      >
        {/* Top Bar (3 zones) */}
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-8 border-b border-white/10 px-6 py-4">
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            STIMIT
          </a>

          <nav
            aria-label="Разделы страницы"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-blue-100/85"
          >
            <a
              href="#pipeline"
              className="transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              Конвейер агентов
            </a>
            <a
              href="#scenarios"
              className="transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              Сценарии
            </a>
            <a
              href="#grading"
              className="transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              Критерии оценки
            </a>
          </nav>

          <button
            type="button"
            onClick={onOpenKnowledgeBase}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Меню и регламент</span>
          </button>
        </header>

        {/* Hero Main Content */}
        <div
          id="top"
          className="mx-auto max-w-6xl px-6 pb-14 pt-12 sm:pt-14 sm:pb-16"
        >
          <div className="max-w-4xl">
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Сможет ли официант сдать экзамен у искусственного интеллекта?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-blue-100/90 sm:text-[17px]">
              Система из 8 агентов проверяет знание меню и регламента, ведёт профиль кандидата и выносит вердикт. Вы отвечаете за официанта.
            </p>
          </div>

          {/* 8-Agent Animated Pipeline */}
          <div id="pipeline" className="mt-10 rounded-2xl border border-white/15 bg-white/[0.04] p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-200/80">
              <span className="font-medium text-blue-100">
                Архитектура мультиагентного конвейера
              </span>
              <span>
                4 аналитических агента · 4 финальных агента ветвления
              </span>
            </div>
            <AgentPipeline mode="hero" />
          </div>

          {/* Primary CTA + First-visit Helper Bubble */}
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onStartScenario('experienced')}
              className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-950/30 transition-all duration-200 hover:bg-blue-500 active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Смотреть пример</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <span className="text-sm text-blue-200/85">
              Запустит сценарий «Опытный кандидат» · 5 шагов · без регистрации
            </span>
          </div>

          {showFirstVisitHint && (
            <div
              role="status"
              className="mt-5 inline-flex max-w-xl items-start gap-3 rounded-xl border border-sky-300/35 bg-[#122B55] px-4 py-3 text-sm text-sky-50 shadow-md"
            >
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
              <p className="leading-snug">
                Вы отвечаете за официанта — выбирайте реплики и смотрите, как думают агенты.
              </p>
              <button
                type="button"
                onClick={onDismissHint}
                className="ml-1 rounded-md p-1 text-blue-200 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Скрыть подсказку"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Light Content Workspace */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {/* Second Row: Other Scenarios */}
        <section id="scenarios" aria-labelledby="other-scenarios-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="other-scenarios-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Другие сценарии проверки
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Посмотрите, как система адаптирует сложность и защищается от обхода правил
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartScenario('experienced')}
              className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900 whitespace-nowrap"
            >
              Опытный кандидат (основной) →
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {otherScenarios.map((scenario) => {
              const isTrickster = scenario.id === 'trickster';
              return (
                <div
                  key={scenario.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {scenario.title}
                      </h3>
                      {isTrickster ? (
                        <ShieldAlert className="h-5 w-5 text-indigo-600 shrink-0" />
                      ) : (
                        <UserCheck className="h-5 w-5 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {scenario.subtitle}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-500">
                      {scenario.tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => onStartScenario(scenario.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
                    >
                      <span>Запустить</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How Grading & Knowledge Base Work */}
        <section
          id="grading"
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Как система оценивает официанта
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                На каждом шаге агенты сравнивают ответ с эталоном, пересчитывают профиль по 5 категориям и подбирают следующий вопрос по слабым зонам. Порог сдачи экзамена — 70%.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenKnowledgeBase}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-4 w-4 text-blue-700" />
              <span>Открыть меню и регламент</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
            <div>
              <div className="font-mono text-lg font-bold text-blue-700 tabular-nums">
                5 категорий
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Блюда и состав, регламент сервиса, работа с гостем, продажи и уверенность ответов.
              </p>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-blue-700 tabular-nums">
                10 блюд · 9 правил
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Встроенная база знаний с аллергенами, прожарками, остротой и стандартами работы с жалобой.
              </p>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-blue-700 tabular-nums">
                100% автономно
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Сокращённый демо-заезд из 5 шагов с ветками «Экзаменация», «Консультант» и «Защита».
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
