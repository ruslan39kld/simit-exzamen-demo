import { useState } from 'react';
import { ExamWorkspace } from './components/ExamWorkspace';
import { HeroLanding } from './components/HeroLanding';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { MissionSummary } from './components/MissionSummary';
import { SCENARIOS } from './data/scenarios';
import { CandidateProfile, ScenarioData, StepTraceLog } from './types/exam';

type ScreenView = 'landing' | 'exam' | 'summary';

const HINT_STORAGE_KEY = 'stimit_waiter_exam_hint_seen';

function readHintState(): boolean {
  try {
    return window.localStorage.getItem(HINT_STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

function persistHintDismissed(): void {
  try {
    window.localStorage.setItem(HINT_STORAGE_KEY, '1');
  } catch {
    // Ignore storage errors in restricted iframes
  }
}

export default function App() {
  const [view, setView] = useState<ScreenView>('landing');
  const [activeScenarioId, setActiveScenarioId] =
    useState<ScenarioData['id']>('experienced');
  const [examSessionKey, setExamSessionKey] = useState(1);
  const [showFirstVisitHint, setShowFirstVisitHint] = useState<boolean>(() =>
    readHintState()
  );
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);

  const [finalResult, setFinalResult] = useState<{
    profile: CandidateProfile;
    traces: StepTraceLog[];
  } | null>(null);

  const activeScenario =
    SCENARIOS.find((s) => s.id === activeScenarioId) ?? SCENARIOS[0];

  const dismissHintOnce = () => {
    if (showFirstVisitHint) {
      setShowFirstVisitHint(false);
      persistHintDismissed();
    }
  };

  const handleStartScenario = (scenarioId: ScenarioData['id']) => {
    dismissHintOnce();
    setActiveScenarioId(scenarioId);
    setFinalResult(null);
    setExamSessionKey((k) => k + 1);
    setView('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteMission = (
    profile: CandidateProfile,
    traces: StepTraceLog[]
  ) => {
    setFinalResult({ profile, traces });
    setView('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenKnowledgeBase = () => {
    dismissHintOnce();
    setIsKnowledgeBaseOpen(true);
  };

  return (
    <>
      {view === 'landing' && (
        <HeroLanding
          scenarios={SCENARIOS}
          onStartScenario={handleStartScenario}
          onOpenKnowledgeBase={handleOpenKnowledgeBase}
          showFirstVisitHint={showFirstVisitHint}
          onDismissHint={dismissHintOnce}
        />
      )}

      {view === 'exam' && (
        <ExamWorkspace
          key={`${activeScenario.id}-${examSessionKey}`}
          scenario={activeScenario}
          allScenarios={SCENARIOS}
          onSwitchScenario={handleStartScenario}
          onBackToLanding={() => {
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenKnowledgeBase={handleOpenKnowledgeBase}
          onCompleteMission={handleCompleteMission}
        />
      )}

      {view === 'summary' && finalResult && (
        <MissionSummary
          scenario={activeScenario}
          profile={finalResult.profile}
          traces={finalResult.traces}
          onRetryScenario={() => handleStartScenario(activeScenario.id)}
          onOtherScenarios={() => {
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenKnowledgeBase={handleOpenKnowledgeBase}
        />
      )}

      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
      />
    </>
  );
}
