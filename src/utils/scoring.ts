import {
  AnswerEvaluation,
  CandidateProfile,
  CandidateStatus,
  CategoryStats,
  ProfileCategoryKey,
  ReplyOption,
  StepTraceLog,
} from '../types/exam';

export const CATEGORY_TITLES: Record<ProfileCategoryKey, string> = {
  dishes: 'Блюда и состав',
  regulation: 'Регламент сервиса',
  guest: 'Работа с гостем',
  sales: 'Продажи и рекомендации',
  confidence: 'Уверенность и логика ответов',
};

export const CATEGORY_ORDER: ProfileCategoryKey[] = [
  'dishes',
  'regulation',
  'guest',
  'sales',
  'confidence',
];

export function createInitialProfile(): CandidateProfile {
  return {
    categories: {
      dishes: {
        key: 'dishes',
        title: CATEGORY_TITLES.dishes,
        questionsCount: 0,
        scoreSum: 0,
        percent: null,
        comment: 'Ещё не проверялось',
      },
      regulation: {
        key: 'regulation',
        title: CATEGORY_TITLES.regulation,
        questionsCount: 0,
        scoreSum: 0,
        percent: null,
        comment: 'Ещё не проверялось',
      },
      guest: {
        key: 'guest',
        title: CATEGORY_TITLES.guest,
        questionsCount: 0,
        scoreSum: 0,
        percent: null,
        comment: 'Ещё не проверялось',
      },
      sales: {
        key: 'sales',
        title: CATEGORY_TITLES.sales,
        questionsCount: 0,
        scoreSum: 0,
        percent: null,
        comment: 'Ещё не проверялось',
      },
      confidence: {
        key: 'confidence',
        title: CATEGORY_TITLES.confidence,
        questionsCount: 0,
        scoreSum: 0,
        percent: null,
        comment: 'Оценивается по ходу диалога',
      },
    },
    evaluatedCount: 0,
    totalScoreSum: 0,
    score: 0,
    status: 'средний',
  };
}

export function getEvaluationWeight(evaluation?: AnswerEvaluation): number {
  if (evaluation === 'правильно') return 1;
  if (evaluation === 'частично правильно') return 0.5;
  return 0;
}

export function deriveStatus(score: number, evaluatedCount: number): CandidateStatus {
  if (evaluatedCount === 0) return 'средний';
  if (score >= 80) return 'сильный';
  if (score >= 50) return 'средний';
  return 'слабый';
}

function summarizeCategoryComment(percent: number, latestComment: string): string {
  if (percent === 100) return `Уверенное владение темой. ${latestComment}`;
  if (percent >= 50) return `Есть пробелы в деталях. ${latestComment}`;
  return `Требуется проработка. ${latestComment}`;
}

export function updateProfileWithReply(
  prev: CandidateProfile,
  reply: ReplyOption,
  stepCategory?: ProfileCategoryKey
): CandidateProfile {
  const nextCategories: Record<ProfileCategoryKey, CategoryStats> = {
    dishes: { ...prev.categories.dishes },
    regulation: { ...prev.categories.regulation },
    guest: { ...prev.categories.guest },
    sales: { ...prev.categories.sales },
    confidence: { ...prev.categories.confidence },
  };

  let evaluatedCount = prev.evaluatedCount;
  let totalScoreSum = prev.totalScoreSum;

  const targetCategory = reply.profileCategory ?? stepCategory;

  if (reply.wasAnswer && targetCategory && targetCategory !== 'confidence') {
    const weight = getEvaluationWeight(reply.evaluation);
    const current = nextCategories[targetCategory];
    const newCount = current.questionsCount + 1;
    const newSum = current.scoreSum + weight;
    const newPercent = Math.round((newSum / newCount) * 100);

    nextCategories[targetCategory] = {
      ...current,
      questionsCount: newCount,
      scoreSum: newSum,
      percent: newPercent,
      comment: summarizeCategoryComment(newPercent, reply.checkComment),
    };

    evaluatedCount += 1;
    totalScoreSum += weight;
  }

  const score =
    evaluatedCount > 0 ? Math.round((totalScoreSum / evaluatedCount) * 100) : prev.score;
  const status = deriveStatus(score, evaluatedCount);

  if (reply.confidenceNote) {
    const prevComment = nextCategories.confidence.comment;
    const base =
      prevComment === 'Оценивается по ходу диалога' ? '' : `${prevComment} `;
    nextCategories.confidence = {
      ...nextCategories.confidence,
      comment: `${base}${reply.confidenceNote}.`.trim(),
    };
  } else if (reply.wasAnswer) {
    if (score >= 80) {
      nextCategories.confidence = {
        ...nextCategories.confidence,
        comment:
          nextCategories.confidence.comment.includes('Попытка')
            ? nextCategories.confidence.comment
            : 'Ответы чёткие, последовательные, правила экзамена соблюдаются.',
      };
    } else if (score >= 50) {
      nextCategories.confidence = {
        ...nextCategories.confidence,
        comment:
          nextCategories.confidence.comment.includes('Попытка')
            ? nextCategories.confidence.comment
            : 'Отвечает по делу, но местами теряет важные детали под давлением.',
      };
    } else {
      nextCategories.confidence = {
        ...nextCategories.confidence,
        comment:
          nextCategories.confidence.comment.includes('Попытка')
            ? nextCategories.confidence.comment
            : 'Заметна неуверенность, допускает серьёзные пропуски в базе.',
      };
    }
  }

  return {
    categories: nextCategories,
    evaluatedCount,
    totalScoreSum,
    score,
    status,
  };
}

export function extractStrengthsAndWeaknesses(profile: CandidateProfile): {
  strengths: string[];
  weaknesses: string[];
} {
  const scoredKeys: ProfileCategoryKey[] = ['dishes', 'regulation', 'guest', 'sales'];
  const tested = scoredKeys
    .map((k) => profile.categories[k])
    .filter((c) => c.questionsCount > 0 && c.percent !== null);

  if (tested.length === 0) {
    return {
      strengths: ['Диалог поддержан до завершения'],
      weaknesses: ['Недостаточно оценённых ответов по меню и регламенту'],
    };
  }

  const maxPercent = Math.max(...tested.map((c) => c.percent ?? 0));
  const minPercent = Math.min(...tested.map((c) => c.percent ?? 0));

  const strengths = tested
    .filter((c) => (c.percent ?? 0) >= 75 || (maxPercent >= 50 && c.percent === maxPercent))
    .map((c) => `${c.title} — ${c.percent}% (${c.questionsCount} вопр.)`);

  const weaknesses = tested
    .filter((c) => (c.percent ?? 0) < 75 || (minPercent < 100 && c.percent === minPercent && (c.percent ?? 0) < 100))
    .map((c) => `${c.title} — ${c.percent}% (${c.questionsCount} вопр.)`);

  if (strengths.length === 0) {
    strengths.push('Готовность отвечать на вопросы экзаменатора до конца');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Критичных пробелов не выявлено — все проверенные темы на 100%');
  }

  return { strengths, weaknesses };
}

export function formatAgentTraceText(trace: StepTraceLog): string {
  const p = trace.profileSnapshot;
  const catLines = CATEGORY_ORDER.map((key, idx) => {
    const c = p.categories[key];
    if (key === 'confidence') {
      return `${idx + 1}) ${c.title}: ${c.comment}`;
    }
    const pctStr = c.percent === null ? '—' : `${c.percent}%`;
    return `${idx + 1}) ${c.title}: Вопросов: ${c.questionsCount}, Правильных: ${pctStr}, ${c.comment}`;
  }).join('\n');

  return [
    'AGENT ANSWER CHECK',
    `Был ли ответ на вопрос: ${trace.wasAnswer ? 'да' : 'нет'}`,
    `Тема прошлого вопроса: ${trace.pastTopic}`,
    `Оценка ответа: ${trace.evaluation ?? 'не оценивается (служебный шаг)'}`,
    `Комментарий: ${trace.checkComment}`,
    '',
    'AGENT BRANCH',
    `Текущая ветка: ${trace.branch}`,
    '',
    'AGENT PROFILE',
    catLines,
    `Общий статус: ${p.status} кандидат (текущий балл: ${p.score}%)`,
    '',
    'AGENT TOPIC ANALYZER',
    `Текущая тема: ${trace.nextTopic}`,
    `Сложность: ${trace.nextDifficulty ?? '—'}`,
    `Причина выбора: ${trace.nextTopicReason}`,
    '',
    'EXPECTED ANSWER',
    trace.nextExpectedAnswer,
    '',
    'FINAL AGENT RESPONSE',
    trace.finalAgentResponse,
  ].join('\n');
}
