'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getDemoPolls, voteOnPoll, createDemoPoll, DemoPoll } from '@/lib/demo-store'

export default function PollsPage() {
  const t = useTranslations('polls')
  const tCommon = useTranslations('common')

  const [polls, setPolls] = useState<DemoPoll[]>([])
  const [showCreate, setShowCreate] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    options: ['Jā', 'Nē'],
    endDate: '2026-07-15',
  })

  useEffect(() => {
    setPolls(getDemoPolls())
  }, [])

  function refresh() {
    setPolls(getDemoPolls())
  }

  function handleVote(pollId: string, optionId: string) {
    const updated = voteOnPoll(pollId, optionId)
    setPolls(updated)
    toast.success(t('voteSubmitted'))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || form.options.length < 2) return

    const created = createDemoPoll({
      title: form.title,
      description: form.description,
      options: form.options.filter(o => o.trim()),
      endDate: form.endDate,
    })

    setPolls([created, ...polls])
    setShowCreate(false)
    setForm({ title: '', description: '', options: ['Jā', 'Nē'], endDate: '2026-07-15' })
  }

  function addOptionField() {
    setForm({ ...form, options: [...form.options, ''] })
  }

  const active = polls.filter(p => p.status === 'active')
  const past = polls.filter(p => p.status !== 'active')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> {t('createPoll')}
        </Button>
      </div>

      {/* Active Polls */}
      <div className="mb-8">
        <div className="text-sm font-semibold text-muted mb-3 pl-1">{t('active')}</div>
        {active.length === 0 && <p className="text-sm pl-1">{t('noActive')}</p>}

        {active.map(poll => {
          const total = poll.options.reduce((a, b) => a + b.votes, 0)
          return (
            <Card key={poll.id} className="mb-5">
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <p className="text-sm mt-1 text-muted">{poll.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poll.options.map(opt => {
                    const pct = total > 0 ? Math.round(opt.votes / total * 100) : 0
                    const voted = poll.votedOptionId === opt.id
                    return (
                      <div key={opt.id}>
                        <button
                          onClick={() => handleVote(poll.id, opt.id)}
                          disabled={!!poll.votedOptionId}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${voted ? 'border-accent bg-accent-soft' : 'border-line hover:bg-accent-soft active:bg-accent-soft'}`}
                        >
                          <div className="flex justify-between text-sm mb-1.5 font-medium">
                            <span>{opt.label}</span>
                            <span className="font-mono text-xs tabular-nums text-muted">{opt.votes} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-line rounded-full overflow-hidden">
                            <div className="h-2.5 bg-accent transition-all" style={{ width: pct + '%' }} />
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 text-xs text-muted">Kopā balsis: {total} • Beidzas {poll.endDate}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-muted mb-3 pl-1">{t('past')}</div>
          {past.map(p => (
            <Card key={p.id} className="mb-3 opacity-75">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted">Balsojums noslēdzies • {p.endDate}</CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Poll Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('createPoll')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <input className="input" placeholder={t('pollTitle')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" placeholder={t('pollDescription')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <div>
            <div className="mb-1.5 text-sm font-medium">{t('options')}</div>
            {form.options.map((val, i) => (
              <input key={i} className="input mb-2" placeholder={t('optionPlaceholder')} value={val} onChange={e => {
                const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts })
              }} />
            ))}
            <button type="button" onClick={addOptionField} className="text-sm text-accent font-medium">+ {t('addOption')}</button>
          </div>

          <div>
            <div className="text-xs text-muted mb-1">{t('endDate')}</div>
            <input type="date" className="input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>

          <div className="pt-2 flex gap-3">
            <Button type="submit" className="flex-1">{t('create')}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>{tCommon('cancel')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
