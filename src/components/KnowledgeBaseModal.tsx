import React, { useEffect, useState } from 'react';
import { BookOpen, UtensilsCrossed, X, AlertTriangle } from 'lucide-react';
import { MENU_ITEMS, REGULATION_RULES } from '../data/knowledgeBase';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'regulation'>('menu');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kb-modal-title"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="kb-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              База знаний: меню и регламент
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Эталонные данные, по которым агенты формируют вопросы и проверяют ответы кандидата
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label="Закрыть базу знаний"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Segmented tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'menu'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Меню (10 позиций)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('regulation')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'regulation'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Регламент официанта (9 пунктов)</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'menu' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {MENU_ITEMS.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        {String(item.id).padStart(2, '0')}. {item.name}
                      </h3>
                      <span className="font-mono text-sm font-semibold text-blue-700 tabular-nums whitespace-nowrap shrink-0">
                        {item.price}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {item.ingredients}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Аллергены: </span>
                      {item.allergens.length > 0
                        ? item.allergens.join(' · ')
                        : 'не указаны'}
                    </div>
                    {item.note && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-800">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                        <span>{item.note}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {REGULATION_RULES.map((rule) => (
                <div key={rule.id} className="p-4 sm:px-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                      {String(rule.id).padStart(2, '0')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {rule.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 pl-7 text-sm leading-relaxed text-slate-600">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            Используется агентами «Экзаменатор», «Консультант» и «Сравнение ответа»
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
          >
            Вернуться к стенду
          </button>
        </div>
      </div>
    </div>
  );
};
