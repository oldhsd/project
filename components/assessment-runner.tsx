'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { api, announceContentChange } from '@/lib/client';
import { type Row, text, number } from '@/lib/content-schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/primitives';
export function AssessmentRunner({ assessment }: { assessment: Row }) {
  const { status } = useSession();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Row | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const questions = assessment.questions as { question: string; options: string[] }[];
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const token = requestId || crypto.randomUUID();
    setRequestId(token);
    try {
      const response = await api<{ item: Row }>(`/api/assessments/${assessment.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          version: assessment.version,
          answers: questions.map((_, i) => answers[i]),
          requestId: token,
        }),
      });
      setResult(response.item);
      announceContentChange();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <Card className="p-6 sm:p-8">
        <p className="text-sm font-medium">
          {result.passed ? 'Assessment passed' : 'Assessment completed'}
        </p>
        <h2 className="mt-3 text-3xl font-semibold">{number(result, 'percentage')}%</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {number(result, 'score')} of {number(result, 'total')} answers correct. This result has
          been saved to your account.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setAnswers({});
              setResult(null);
              setRequestId(null);
            }}
          >
            Take again
          </Button>
          <Button asChild>
            <Link href="/dashboard">View my progress</Link>
          </Button>
        </div>
      </Card>
    );
  if (!Array.isArray(questions) || !questions.length)
    return <p className="text-sm text-muted-foreground">No questions are currently available.</p>;
  if (status !== 'authenticated')
    return (
      <Button asChild>
        <Link href={`/login?next=/assessments/${assessment.id}`}>
          Sign in to take this assessment
        </Link>
      </Button>
    );
  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="p-5 text-sm text-muted-foreground">
        {questions.length} questions · Suggested duration: {number(assessment, 'durationMinutes')}{' '}
        minutes · Pass mark: {number(assessment, 'passingScore')}%. This is an untimed knowledge
        check.
      </Card>
      {questions.map((question, index) => (
        <fieldset key={index} disabled={busy} className="rounded-lg border bg-card p-6">
          <legend className="px-1 text-sm font-medium">Question {index + 1}</legend>
          <p className="mb-5 text-base font-medium leading-7">{question.question}</p>
          <div className="space-y-3">
            {question.options.map((option, choice) => (
              <label
                key={choice}
                className="flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-sm leading-6 hover:bg-accent"
              >
                <input
                  type="radio"
                  name={`answer-${index}`}
                  required
                  className="mt-1 size-4 shrink-0"
                  checked={answers[index] === choice}
                  onChange={() => setAnswers((old) => ({ ...old, [index]: choice }))}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button disabled={busy || Object.keys(answers).length !== questions.length}>
        {busy ? 'Submitting answers…' : 'Submit answers'}
      </Button>
    </form>
  );
}
