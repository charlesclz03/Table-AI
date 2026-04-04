'use client'

import { useMemo, useState } from 'react'
import { Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { type AdminQuizAnswers } from '@/lib/admin/types'

interface QuizEditorProps {
  initialAnswers: AdminQuizAnswers
  restaurantName: string
}

const questions = [
  {
    key: 'signature_dish',
    label: '1. Signature dish',
    placeholder: "What's your signature dish?",
  },
  {
    key: 'recommendation',
    label: '2. Top recommendation',
    placeholder: 'What do you always recommend first?',
  },
  {
    key: 'wine_pairing',
    label: '3. Wine pairing',
    placeholder: 'Which wine pairing should the AI suggest?',
  },
  {
    key: 'secret_dish',
    label: '4. Secret dish',
    placeholder: 'Which underrated dish should tourists discover?',
  },
  {
    key: 'allergen_notes',
    label: '5. Allergen notes',
    placeholder: 'Which allergens should the concierge mention carefully?',
  },
  {
    key: 'story',
    label: '6. Restaurant story',
    placeholder: 'What should guests know about the restaurant story?',
  },
] as const

export function QuizEditor({
  initialAnswers,
  restaurantName,
}: QuizEditorProps) {
  const [answers, setAnswers] = useState(initialAnswers)
  const [previewPrompt, setPreviewPrompt] = useState(
    'What should I order if this is my first visit?'
  )
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function updateAnswer<Key extends keyof AdminQuizAnswers>(
    key: Key,
    value: AdminQuizAnswers[Key]
  ) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const previewReply = useMemo(() => {
    const prompt = previewPrompt.toLowerCase()

    if (prompt.includes('wine')) {
      return (
        answers.wine_pairing ||
        'Add a wine pairing answer to preview this response.'
      )
    }

    if (prompt.includes('story') || prompt.includes('history')) {
      return (
        answers.story || 'Add your restaurant story to preview this response.'
      )
    }

    if (prompt.includes('allergen')) {
      return (
        answers.allergen_notes ||
        "I don't have complete allergen notes yet. Add them here so the concierge stays safe."
      )
    }

    if (prompt.includes('tourist') || prompt.includes('secret')) {
      return (
        answers.secret_dish || 'Add a secret dish to preview this response.'
      )
    }

    if (
      prompt.includes('recommend') ||
      prompt.includes('first') ||
      prompt.includes('order')
    ) {
      return (
        answers.recommendation ||
        'Add a top recommendation to preview this response.'
      )
    }

    if (prompt.includes('signature')) {
      return (
        answers.signature_dish ||
        'Add a signature dish to preview this response.'
      )
    }

    const faqAnswer =
      answers.faq_1 ||
      answers.faq_2 ||
      answers.faq_3 ||
      answers.faq_4 ||
      answers.faq_5

    return faqAnswer || 'Add FAQ answers to preview the concierge voice.'
  }, [answers, previewPrompt])

  async function saveQuiz() {
    setIsSaving(true)
    setStatus('')

    try {
      const response = await fetch('/api/admin/quiz', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      })

      const payload = (await response.json()) as {
        quizAnswers?: AdminQuizAnswers
        error?: string
      }

      if (!response.ok || !payload.quizAnswers) {
        throw new Error(payload.error || 'Unable to save quiz answers.')
      }

      setAnswers(payload.quizAnswers)
      setStatus('Quiz answers saved.')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Unable to save quiz answers.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-4">
        {questions.map((question) => (
          <label
            key={question.key}
            className="block rounded-[28px] border border-white/10 bg-white/6 p-5 text-sm text-white/75 backdrop-blur"
          >
            <span className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              {question.label}
            </span>
            <textarea
              value={answers[question.key]}
              onChange={(event) =>
                updateAnswer(question.key, event.target.value)
              }
              rows={4}
              className="mt-3 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
              placeholder={question.placeholder}
            />
          </label>
        ))}

        <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            7. Top 5 FAQs
          </p>
          <div className="mt-4 space-y-3">
            {(['faq_1', 'faq_2', 'faq_3', 'faq_4', 'faq_5'] as const).map(
              (key, index) => (
                <input
                  key={key}
                  value={answers[key]}
                  onChange={(event) => updateAnswer(key, event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
                  placeholder={`FAQ ${index + 1}`}
                />
              )
            )}
          </div>
        </section>
      </section>

      <aside className="space-y-5">
        <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Save Progress
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Keep {restaurantName}&apos;s concierge aligned
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/70">
            These answers become the owner-specific memory for recommendations,
            wine pairing, story, and FAQ handling.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Button variant="brand" onClick={saveQuiz} isLoading={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save quiz answers
            </Button>
            {status ? (
              <p className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                {status}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 p-3 text-amber-100">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                AI Preview
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                How the concierge would answer
              </h3>
            </div>
          </div>

          <label className="mt-4 block text-sm text-white/75">
            Preview question
            <textarea
              value={previewPrompt}
              onChange={(event) => setPreviewPrompt(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
            />
          </label>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Concierge reply
            </p>
            <p className="mt-3 text-sm leading-7 text-white/80">
              {previewReply}
            </p>
          </div>
        </section>
      </aside>
    </div>
  )
}
