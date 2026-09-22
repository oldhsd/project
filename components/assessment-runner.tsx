'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, RotateCcw, Trophy, Award, Sparkles } from 'lucide-react';
import { initialAssessments, Assessment } from '@/lib/data-service';

export function AssessmentRunner() {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment>(initialAssessments[0]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);

  const questions = selectedAssessment.questions;
  const score = answers.reduce((sum, a, i) => sum + (a === questions[i]?.correctIndex ? 1 : 0), 0);
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= selectedAssessment.passingScore;

  const handleSelectTrack = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setStep(0);
    setAnswers([]);
    setComplete(false);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setComplete(false);
  };

  if (complete) {
    return (
      <div className="apple-panel p-8 sm:p-10 rounded-2xl text-center space-y-5">
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${
          passed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
        }`}>
          {passed ? <CheckCircle2 className="h-8 w-8" /> : <Trophy className="h-8 w-8" />}
        </div>
        <div>
          <p className="apple-eyebrow">
            {passed ? 'ASSESSMENT PASSED' : 'SKILL BENCHMARK COMPLETE'}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)]">
            {score} / {questions.length} Correct ({percentage}%)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
            {passed
              ? `Demonstrated solid competency in ${selectedAssessment.title}. +${selectedAssessment.xpReward} XP has been added to your profile.`
              : `Review the syllabus modules and retake the test to meet the ${selectedAssessment.passingScore}% passing threshold.`}
          </p>
        </div>
        {/* Detailed Question Review with Explanations */}
        <div className="text-left space-y-3 pt-6 border-t border-[var(--line)]">
          <p className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
            Review & Explanations
          </p>
          {questions.map((q, idx) => {
            const isCorrect = answers[idx] === q.correctIndex;
            return (
              <div key={q.id} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--ink)]">Question {idx + 1}</span>
                  <span className={`font-semibold ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="mt-1 font-medium text-[var(--ink)]">{q.question}</p>
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                  <strong className="text-[var(--ink)]">Key Insight:</strong> {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
        <div className="pt-4 flex justify-center gap-3">
          <button onClick={handleReset} className="apple-btn-secondary h-10 px-5 rounded-xl text-xs flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[step];
  const selectedAnswer = answers[step];

  return (
    <div className="space-y-6">
      {/* Assessment Selector Tabs */}
      <div className="flex gap-2 pb-1 overflow-x-auto">
        {initialAssessments.map((a) => (
          <button
            key={a.id}
            onClick={() => handleSelectTrack(a)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition border ${
              selectedAssessment.id === a.id
                ? 'bg-[#0071e3] text-white border-transparent shadow-sm'
                : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
            }`}
          >
            {a.title}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <div className="apple-panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-2)]">
          <div>
            <span className="apple-eyebrow">{selectedAssessment.trackCategory}</span>
            <p className="text-xs font-bold text-[var(--ink)] mt-0.5">
              Question {step + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
            <Clock3 className="h-4 w-4 text-[#0071e3]" />
            <span>{selectedAssessment.duration}</span>
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-base sm:text-lg font-bold text-[var(--ink)] leading-snug">
            {currentQ.question}
          </h2>
          <div className="grid gap-2.5">
            {currentQ.options.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => {
                  const copy = [...answers];
                  copy[step] = idx;
                  setAnswers(copy);
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left text-xs font-medium transition ${
                  selectedAnswer === idx
                    ? 'border-[#0071e3] bg-[#0071e3]/10 text-[var(--ink)] font-semibold'
                    : 'border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--ink)]'
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-lg border text-[11px] font-bold ${
                  selectedAnswer === idx ? 'border-[#0071e3] bg-[#0071e3] text-white' : 'border-[var(--line)] bg-[var(--surface)]'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </button>
            ))}
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-[var(--line)]">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="apple-btn-secondary h-9 px-4 rounded-xl text-xs disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              disabled={selectedAnswer === undefined}
              onClick={() => {
                if (step === questions.length - 1) {
                  setComplete(true);
                } else {
                  setStep(step + 1);
                }
              }}
              className="apple-btn-primary h-9 px-5 rounded-xl text-xs disabled:opacity-40 flex items-center gap-1 font-semibold"
            >
              <span>{step === questions.length - 1 ? 'Submit Answers' : 'Next Question'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
