import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  LayoutGrid,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  CandidateProfile,
  ScenarioData,
  StepTraceLog,
} from '../types/exam';
import {
  CATEGORY_ORDER,
  extractStrengthsAndWeaknesses,
} from '../utils/scoring';

interface MissionSummaryProps {
  scenario: ScenarioData;
  profile: CandidateProfile;
  traces: StepTraceLog[];
  onRetryScenario: () => void;
  onOtherScenarios: () => void;
  onOpenKnowledgeBase: () => void;
}

export const MissionSummary: React.FC<MissionSummaryProps> = ({
  scenario,
  profile,
  traces,
  onRetryScenario,
  onOtherScenarios,
  onOpenKnowledgeBase,
}) => {
  const passed = profile.score >= 70;
  const { strengths, weaknesses } = extractStrengthsAndWeaknesses(profile);
  const summaryText = passed
    ? scenario.passSummaryText
    : scenario.failSummaryText;
  const recommendationText = passed
    ? scenario.passRecommendation
    : scenario.failRecommendation;

  const [animatedScore, setAnimatedScore] = useState(0);
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setAnimatedScore(profile.score);
      setRevealStep(3);
      return;
    }

    setAnimatedScore(0);
    setRevealStep(0);

    const duration = 850;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * profile.score));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    const t1 = window.setTimeout(() => setRevealStep(1), 450);
    const t2 = window.setTimeout(() => setRevealStep(2), 850);
    const t3 = window.setTimeout(() => setRevealStep(3), 1250);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [profile.score]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOtherScenarios}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>К сценариям</span>
            </button>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Сценарий: {scenario.title}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenKnowledgeBase}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 whitespace-nowrap"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-700" />
            <span>Меню и регламент</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 sm:py-10 space-y-6">
        {/* Verdict Hero Card */}
        <section
          className="overflow-hidden rounded-2xl text-white shadow-lg"
          style={{
            background:
              'linear-gradient(180deg, #1B3A6B 0%, #12294F 65%, #0B1933 100%)',
          }}
        >
          <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="text-xs font-semibold tracking-wide text-blue-200">
                Итог миссии · Агент Завершения
              </div>

              <div className="mt-3 flex items-center gap-3">
                {passed ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-rose-400 shrink-0" />
                )}
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Вердикт: {passed ? 'СДАЛ' : 'НЕ СДАЛ'}
                </h1>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-blue-100/90 sm:text-base">
                {summaryText}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-blue-200">
                <span>Сценарий: {scenario.title}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">Статус: {profile.status} кандидат</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  Оценено вопросов: {profile.evaluatedCount} (шагов пройдено: {traces.length})
                </span>
              </div>
            </div>

            {/* Animated Score Counter */}
            <div className="flex flex-col items-start md:items-end shrink-0 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-5">
              <span className="text-xs font-medium text-blue-200">
                Итоговый балл
              </span>
              <div className="mt-1 font-mono text-5xl font-bold tracking-tight text-white tabular-nums">
                {animatedScore}%
              </div>
              <span className="mt-1.5 text-xs text-blue-200/80 tabular-nums">
                Порог прохождения: 70%
              </span>
            </div>
          </div>
        </section>

        {/* Sequential Reveal: Strengths, Weaknesses, Recommendation */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* 1. Strengths */}
          <div
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 ${
              revealStep >= 1
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <h2>Сильные стороны</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {strengths.map((item) => (
                <li key={item} className="leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Weaknesses */}
          <div
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 ${
              revealStep >= 2
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <h2>Слабые стороны</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {weaknesses.map((item) => (
                <li key={item} className="leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Recommendation */}
          <div
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 ${
              revealStep >= 3
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
              <ClipboardCheck className="h-4 w-4 text-blue-700 shrink-0" />
              <h2>Рекомендация</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {recommendationText}
            </p>
          </div>
        </section>

        {/* Full 5-Category Profile Breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">
            Итоговый профиль кандидата по 5 категориям
          </h2>
          <div className="mt-4 divide-y divide-slate-100">
            {CATEGORY_ORDER.map((key, idx) => {
              const cat = profile.categories[key];
              return (
                <div
                  key={key}
                  className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="max-w-xl">
                    <div className="text-sm font-semibold text-slate-900">
                      {idx + 1}. {cat.title}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {cat.comment}
                    </p>
                  </div>

                  {key !== 'confidence' ? (
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-500 tabular-nums">
                        Вопросов: {cat.questionsCount}
                      </span>
                      <span
                        className={`font-mono text-sm font-bold tabular-nums ${
                          cat.percent === null
                            ? 'text-slate-400'
                            : cat.percent >= 80
                              ? 'text-emerald-700'
                              : cat.percent >= 50
                                ? 'text-amber-700'
                                : 'text-red-700'
                        }`}
                      >
                        {cat.percent === null ? '—' : `${cat.percent}%`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 shrink-0">
                      Качественная оценка
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRetryScenario}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Пройти ещё раз</span>
            </button>

            <button
              type="button"
              onClick={onOtherScenarios}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-400 hover:bg-blue-50/40 whitespace-nowrap"
            >
              <LayoutGrid className="h-4 w-4 text-blue-700" />
              <span>Другие сценарии</span>
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Демо-стенд STIMIT · Все вычисления выполнены локально
          </span>
        </section>
      </main>
    </div>
  );
};
