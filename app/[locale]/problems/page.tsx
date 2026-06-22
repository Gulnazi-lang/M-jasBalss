'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import { Plus, ThumbsUp, Camera } from 'lucide-react'
import { FAB } from '@/components/ui/FAB'
import { toast } from 'sonner'
import { getDemoProblems, saveDemoProblems, addDemoProblem, voteUrgency, DemoProblem } from '@/lib/demo-store'

export default function ProblemsPage() {
  const t = useTranslations('problems')
  const tCommon = useTranslations('common')

  const [problems, setProblems] = useState<DemoProblem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress'>('all')

  const [newProblem, setNewProblem] = useState({
    title: '', description: '', category: 'other', priority: 'medium' as const,
  })
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    setProblems(getDemoProblems())
  }, [])

  function refreshProblems(updated?: DemoProblem[]) {
    const fresh = updated || getDemoProblems()
    setProblems(fresh)
  }

  function submitNewProblem(e: React.FormEvent) {
    e.preventDefault()
    if (!newProblem.title.trim()) return

    const created = addDemoProblem({
      title: newProblem.title,
      description: newProblem.description,
      category: newProblem.category,
      priority: newProblem.priority,
      status: 'open',
      photos,
    })

    refreshProblems([created, ...problems])
    setShowForm(false)
    setNewProblem({ title: '', description: '', category: 'other', priority: 'medium' })
    setPhotos([])
    toast.success(t('problemCreated'))
  }

  function handleUrgencyVote(id: string) {
    const updated = voteUrgency(id)
    refreshProblems(updated)
  }

  const filtered = problems.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> {t('newProblem')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(['all', 'open', 'in_progress'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-4 py-1.5 rounded-2xl text-sm font-medium whitespace-nowrap transition ${filter === f ? 'bg-accent text-white' : 'bg-accent-soft text-muted'}`}
          >
            {f === 'all' ? 'Visas' : t(`status.${f}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center py-10 text-muted">{t('empty')}</p>}

      <div className="space-y-4">
        {filtered.map(problem => (
          <Card key={problem.id} className="overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="font-semibold text-[17px] leading-tight">{problem.title}</div>
                  <div className="text-xs text-muted mt-0.5">{problem.createdAt} • {t(`categories.${problem.category}`)}</div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div className={`badge badge-${problem.status}`}>{t(`status.${problem.status}`)}</div>
                  <div className={`badge badge-${problem.priority}`}>{t(`priority.${problem.priority}`)}</div>
                </div>
              </div>

              {problem.description && <p className="text-sm mt-2 text-ink/90">{problem.description}</p>}

              {/* Photos gallery */}
              {problem.photos.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {problem.photos.map((src, idx) => (
                    <img key={idx} src={src} className="h-28 w-28 rounded-2xl object-cover border border-line flex-shrink-0" alt="photo" />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-1.5 text-sm">
                  <ThumbsUp className="h-4 w-4 text-accent" />
                  <span className="font-semibold tabular-nums">{problem.urgencyVotes}</span>
                  <span className="text-xs text-muted">{t('votes')}</span>
                </div>

                <Button size="sm" variant="outline" onClick={() => handleUrgencyVote(problem.id)}>
                  {t('urgencyVote')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <FAB onClick={() => setShowForm(true)} label={t('newProblem')} />

      {/* Create Problem Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={t('newProblem')}>
        <form onSubmit={submitNewProblem} className="space-y-4">
          <input className="input" placeholder={t('fields.title')} value={newProblem.title} onChange={e => setNewProblem({...newProblem, title: e.target.value})} required />
          <textarea className="input min-h-20" placeholder={t('fields.description')} value={newProblem.description} onChange={e => setNewProblem({...newProblem, description: e.target.value})} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select className="input" value={newProblem.category} onChange={e => setNewProblem({...newProblem, category: e.target.value})}>
              {Object.keys(t.raw('categories')).map(k => <option key={k} value={k}>{(t as any)(`categories.${k}`)}</option>)}
            </select>
            <select className="input" value={newProblem.priority} onChange={e => setNewProblem({...newProblem, priority: e.target.value as any})}>
              <option value="high">{t('priority.high')}</option>
              <option value="medium">{t('priority.medium')}</option>
              <option value="low">{t('priority.low')}</option>
            </select>
          </div>

          <div>
            <div className="font-medium text-sm mb-2 flex items-center gap-1.5"><Camera className="h-4 w-4" /> {t('addPhotos')}</div>
            <PhotoUpload onPhotosChange={setPhotos} maxPhotos={5} />
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="submit" className="flex-1">{t('submitProblem')}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>{tCommon('cancel')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
