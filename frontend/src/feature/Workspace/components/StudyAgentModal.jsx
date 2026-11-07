import React, { useState, useEffect } from 'react';
import { runStudyAgentSynthesis } from '../services/studyAgentService';
import RichMathMarkdown from './RichMathMarkdown';
import { X, Sparkles, Check, ChevronRight } from './WorkspaceIcons';
import { PremiumBadge } from './PremiumModals';

/**
 * ==============================================================================
 * ZERO-LOAD AUTONOMOUS AI STUDY AGENT MODAL (StudyAgentModal.jsx)
 * - Pure Clean-White Notion Theme
 * - Tabs: Executive Digest, Gap Detector, Recall Cards, Diagnostic Quiz
 * - 1-Click "Insert Digest into Note"
 * - 0 Background CPU load when idle
 * ==============================================================================
 */
export default function StudyAgentModal({
  isOpen,
  onClose,
  pages = [],
  activePage,
  onInsertDigest,
}) {
  const [activeTab, setActiveTab] = useState('digest'); // 'digest' | 'gaps' | 'recall' | 'quiz'
  const [loading, setLoading] = useState(false);
  const [sprintSchedule, setSprintSchedule] = useState('demand'); // 'demand' | 'nightly' | 'exam'
  const [agentData, setAgentData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleRunSynthesis();
    }
  }, [isOpen, activePage?.id]);

  const handleRunSynthesis = async () => {
    setLoading(true);
    try {
      const data = await runStudyAgentSynthesis(pages, {
        focusPageId: activePage?.id,
        sprintMode: sprintSchedule,
      });
      setAgentData(data);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleQuizOptionClick = (quizId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [quizId]: optionIndex,
    }));
  };

  const handleInsertIntoNote = () => {
    if (!agentData || !onInsertDigest) return;
    const summaryText = agentData.executiveSummary
      .map((sec) => `### 📌 ${sec.topic}\n` + sec.points.map((p) => `- ${p}`).join('\n'))
      .join('\n\n');

    const content = `\n\n---\n## 🤖 Autonomous AI Study Digest (${new Date().toLocaleDateString()})\n\n${summaryText}\n`;
    onInsertDigest(content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs select-none">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden text-gray-800 font-sans animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs text-base">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">Autonomous AI Study Agent</h2>
                <PremiumBadge />
              </div>
              <p className="text-[11px] text-gray-500">
                Self-driving study synthesis, blindspot detection & spaced repetition queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Schedule Selector */}
            <select
              value={sprintSchedule}
              onChange={(e) => setSprintSchedule(e.target.value)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <option value="demand">⚡ On-Demand</option>
              <option value="nightly">🌙 Nightly (9:00 PM)</option>
              <option value="exam">🔥 Pre-Exam Sprint</option>
            </select>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
              title="Close Study Agent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemetry Summary Strip */}
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>
              📄 Pages Analyzed: <strong>{agentData?.totalAnalyzedPages || 0}</strong>
            </span>
            <span>
              ∑ Math Formulas: <strong>{agentData?.formulaCount || 0}</strong>
            </span>
            <span>
              📝 Total Words: <strong>{agentData?.totalWords || 0}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunSynthesis}
            disabled={loading}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Synthesizing...' : '⚡ Re-Synthesize'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-5 border-b border-gray-200 bg-white gap-2 flex-shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('digest')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'digest'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>📑</span>
            <span>Executive Digest</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gaps')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'gaps'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>⚠️</span>
            <span>Concept Gaps ({agentData?.blindspots?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recall')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'recall'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🗂️</span>
            <span>Spaced Recall Queue ({agentData?.recallQueue?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🎯</span>
            <span>Diagnostic Quiz</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: EXECUTIVE DIGEST */}
          {activeTab === 'digest' && (
            <div className="space-y-4">
              {agentData?.executiveSummary?.map((section, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="text-blue-600">●</span>
                      <span>{section.topic}</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Readiness: {section.readinessScore}%
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-gray-700">
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <RichMathMarkdown content={pt} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: CONCEPT GAPS */}
          {activeTab === 'gaps' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                The agent scans for missing mathematical prerequisites and unproven statements:
              </p>
              {agentData?.blindspots?.map((blindspot, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{blindspot.concept}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      {blindspot.severity} Priority
                    </span>
                  </div>

                  <div className="text-xs text-amber-800 leading-relaxed">
                    <RichMathMarkdown content={blindspot.recommendation} />
                  </div>

                  <div className="text-[11px] font-semibold text-blue-700 bg-white/80 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                    <span>💡 Action: {blindspot.suggestedAction}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onInsertDigest) {
                          onInsertDigest(`\n\n> ⚠️ **Focus Action**: ${blindspot.suggestedAction}\n`);
                          setCopiedNotification(true);
                          setTimeout(() => setCopiedNotification(false), 2000);
                        }
                      }}
                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      + Add Todo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RECALL QUEUE */}
          {activeTab === 'recall' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Self-scheduled SuperMemo SM-2 flashcard intervals generated from current notes:
              </p>
              {agentData?.recallQueue?.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>❓</span>
                      <span>{item.question}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Repeat in {item.intervalDays}d
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <RichMathMarkdown content={item.answer} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: DIAGNOSTIC QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {agentData?.diagnosticQuiz?.map((quiz, qIdx) => {
                const userChoice = selectedAnswers[quiz.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === quiz.correctIndex;

                return (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-3 text-left"
                  >
                    <p className="text-xs font-bold text-gray-900">
                      Q{qIdx + 1}. <RichMathMarkdown content={quiz.question} />
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quiz.options.map((option, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        let btnStyle = 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';

                        if (isAnswered) {
                          if (optIdx === quiz.correctIndex) {
                            btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-red-50 border-red-300 text-red-900';
                          } else {
                            btnStyle = 'bg-gray-50/50 border-gray-200 text-gray-400';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleQuizOptionClick(quiz.id, optIdx)}
                            className={`p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <RichMathMarkdown content={option} />
                            {isAnswered && optIdx === quiz.correctIndex && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div
                        className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <strong>{isCorrect ? '✅ Correct!' : '💡 Explanation:'}</strong>{' '}
                        <RichMathMarkdown content={quiz.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50/90 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-gray-500 font-medium">
            Autonomous agent cycle complete • 0 background overhead
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInsertIntoNote}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Inserted!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Insert Digest into Note</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
