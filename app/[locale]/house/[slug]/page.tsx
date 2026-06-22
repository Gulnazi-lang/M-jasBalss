'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import {
  Users, AlertTriangle, BarChart2, Plus, CheckCircle, Clock,
  Camera, ThumbsUp, ArrowLeft, MapPin,
} from 'lucide-react'
import { FAB } from '@/components/ui/FAB'
import { toast } from 'sonner'
import {
  getDemoProblems, voteUrgency, addDemoProblem, getDemoPolls, voteOnPoll,
  isVerified, setVerified, generateInviteCode, createDemoPoll, DemoProblem, DemoPoll,
} from '@/lib/demo-store'
import { getDemoHouseBySlug, type House } from '@/lib/houses'

export default function HouseDashboard() {
  const params = useParams()
  const locale = useLocale()
  const slug = params.slug as string

  const [house, setHouse] = useState<House | null>(getDemoHouseBySlug(slug) ?? null)
  const [houseLoading, setHouseLoading] = useState(!getDemoHouseBySlug(slug))

  const t = useTranslations('house')
  const tProb = useTranslations('problems')
  const tPoll = useTranslations('polls')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')

  const [problems, setProblems] = useState<DemoProblem[]>([])
  const [polls, setPolls] = useState<DemoPoll[]>([])
  const [verified, setVerifiedState] = useState(false)

  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [enteredCode, setEnteredCode] = useState('')
  const [verifyApartment, setVerifyApartment] = useState('')

  const [showProblemModal, setShowProblemModal] = useState(false)
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium' as const,
  })
  const [problemPhotos, setProblemPhotos] = useState<string[]>([])

  const [showPollModal, setShowPollModal] = useState(false)
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['Jā', 'Nē'],
    endDate: '2026-07-20',
  })

  useEffect(() => {
    setProblems(getDemoProblems().slice(0, 4))
    setPolls(getDemoPolls())
    setVerifiedState(isVerified())
  }, [])

  useEffect(() => {
    if (getDemoHouseBySlug(slug)) return

    setHouseLoading(true)
    fetch(`/api/houses/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.house) setHouse(data.house)
      })
      .finally(() => setHouseLoading(false))
  }, [slug])

  if (houseLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-muted">
        Ielādē…
      </div>
    )
  }

  if (!house) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-semibold mb-2">Māja nav atrasta</h1>
        <p className="text-sm text-muted mb-6">Pārbaudiet adresi vai meklējiet kartē.</p>
        <Link href={`/${locale}`} className="btn btn-primary inline-flex">
          <MapPin className="h-4 w-4" /> Atpakaļ uz karti
        </Link>
      </div>
    )
  }

  const withLocale = (path: string) => `/${locale}${path}`

  function handleVerify() {
    if (!verifyApartment.trim()) {
      toast.error('Lūdzu, ievadiet dzīvokļa numuru')
      return
    }
    setVerified(true)
    setVerifiedState(true)
    setShowVerifyModal(false)
    setVerifyApartment('')
    toast.success('Paldies! Jūsu verifikācijas pieprasījums pieņemts. Dzīvoklis ' + verifyApartment)
  }

  function handleJoinWithCode() {
    if (enteredCode.trim().length > 3) {
      setVerified(true)
      setVerifiedState(true)
      setShowVerifyModal(false)
      setEnteredCode('')
      toast.success('Laipni lūdzam mājā! Statuss verificēts.')
    } else {
      toast.error('Nederīgs kods')
    }
  }

  function handleGenerateInvite() {
    const code = generateInviteCode()
    setInviteCode(code)
  }

  function openNewProblem() {
    setNewProblem({ title: '', description: '', category: 'other', priority: 'medium' })
    setProblemPhotos([])
    setShowProblemModal(true)
  }

  function submitProblem(e: React.FormEvent) {
    e.preventDefault()
    if (!newProblem.title.trim()) return

    const created = addDemoProblem({
      title: newProblem.title,
      description: newProblem.description,
      category: newProblem.category,
      priority: newProblem.priority,
      status: 'open',
      photos: problemPhotos,
    })

    setProblems([created, ...problems])
    setShowProblemModal(false)
    toast.success(tProb('problemCreated'))
  }

  function handleUrgencyVote(problemId: string) {
    if (!verified) {
      setShowVerifyModal(true)
      return
    }
    const updated = voteUrgency(problemId)
    setProblems(updated.filter((_, i) => i < 4))
  }

  function submitPoll(e: React.FormEvent) {
    e.preventDefault()
    if (!newPoll.title.trim()) return

    const created = createDemoPoll({
      title: newPoll.title,
      description: newPoll.description,
      options: newPoll.options.filter(Boolean),
      endDate: newPoll.endDate,
    })

    setPolls([created, ...polls])
    setShowPollModal(false)
  }

  function handleVotePoll(pollId: string, optionId: string) {
    if (!verified) {
      setShowVerifyModal(true)
      return
    }
    const updated = voteOnPoll(pollId, optionId)
    setPolls(updated)
    toast.success(tPoll('voteSubmitted'))
  }

  const activePolls = polls.filter(p => p.status === 'active').slice(0, 1)
  const openProblemsCount = problems.filter(p => p.status === 'open').length

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24 md:pb-10">
      <Link
        href={withLocale('/')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent mt-4 mb-2 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {tCommon('back')}
      </Link>

      <div className="house-header rounded-3xl p-6 md:p-9 mb-8 text-white mt-2 md:mt-4 shadow">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="text-xs tracking-[3px] opacity-80 mb-1.5">
              MĀJA • {house.district.toUpperCase()}
            </div>
            <h1 className="text-3xl md:text-[42px] font-semibold tracking-[-1.5px] leading-[1.05]">
              {house.address}
            </h1>
            <p className="mt-1.5 text-lg text-white/90">{house.apartmentCount} dzīvokļi</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="bg-white text-ink hover:bg-white/90"
              onClick={openNewProblem}
            >
              <Plus className="h-4 w-4" /> {t('reportProblem')}
            </Button>
            <Button onClick={() => setShowPollModal(true)}>
              <BarChart2 className="h-4 w-4" /> {tPoll('createPoll')}
            </Button>
          </div>
        </div>
      </div>

      <div className={`mb-6 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border ${verified ? 'bg-emerald-50 border-emerald-200' : 'bg-accent-soft border-line'}`}>
        <div className="flex items-center gap-3">
          {verified ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <Clock className="h-5 w-5 text-accent" />
          )}
          <div>
            <div className="font-medium">{t('myStatus')}</div>
            <div className="text-sm text-muted">
              {verified ? t('verified') : t('pendingVerification')}
            </div>
          </div>
        </div>
        {!verified && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowVerifyModal(true)}>
              {t('verifyNow')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowInviteModal(true)}>
              {t('enterInviteCode')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link href={withLocale('/residents')} className="card p-5 text-center active:scale-[0.985] transition">
          <div className="text-4xl font-semibold text-accent">42</div>
          <div className="text-xs text-muted mt-1">{t('stats.residents')}</div>
        </Link>
        <Link href={withLocale('/problems')} className="card p-5 text-center active:scale-[0.985] transition">
          <div className="text-4xl font-semibold text-accent">{openProblemsCount}</div>
          <div className="text-xs text-muted mt-1">{t('stats.openProblems')}</div>
        </Link>
        <Link href={withLocale('/polls')} className="card p-5 text-center active:scale-[0.985] transition">
          <div className="text-4xl font-semibold text-accent">{activePolls.length}</div>
          <div className="text-xs text-muted mt-1">{t('stats.activePolls')}</div>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Informācija par māju</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
          <div>
            <span className="text-muted">{t('info.fullAddress')}:</span><br />
            <span className="font-medium">{house.address}</span>
          </div>
          <div>
            <span className="text-muted">{t('info.district')}:</span><br />
            <span className="font-medium">{house.district}, {house.city}</span>
          </div>
          <div>
            <span className="text-muted">{t('info.apartments')}:</span><br />
            <span className="font-medium">{house.apartmentCount}</span>
          </div>
          {house.entranceCount && (
            <div>
              <span className="text-muted">{t('info.entrances')}:</span><br />
              <span className="font-medium">{house.entranceCount}</span>
            </div>
          )}
          {house.floors && (
            <div>
              <span className="text-muted">{t('info.floors')}:</span><br />
              <span className="font-medium">{house.floors}</span>
            </div>
          )}
          {house.yearBuilt && (
            <div>
              <span className="text-muted">{t('info.yearBuilt')}:</span><br />
              <span className="font-medium">{house.yearBuilt}</span>
            </div>
          )}
          <div>
            <span className="text-muted">{t('info.manager')}:</span><br />
            <span className="font-medium">SIA &quot;Mājas Balss&quot;</span>
          </div>
          <div className="md:col-span-2 text-xs text-muted pt-2 border-t">
            Šī ir galvenā mājas lapa. Iedzīvotāji var ziņot problēmas, balsot un apstiprināt savu dalību.
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-xl tracking-tight">{tNav('problems')}</h2>
          </div>
          <Link href={withLocale('/problems')} className="text-sm font-medium text-accent">Visas →</Link>
        </div>

        {problems.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted">{tProb('empty')}</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {problems.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="p-4 md:p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-base leading-tight mb-1">{p.title}</div>
                      {p.description && <p className="text-sm text-muted line-clamp-2">{p.description}</p>}
                      {p.photos?.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {p.photos.slice(0, 3).map((src, i) => (
                            <img key={i} src={src} alt="" className="h-16 w-16 rounded-xl object-cover border border-line flex-shrink-0" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`badge badge-${p.status}`}>{tProb(`status.${p.status}`)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <ThumbsUp className="h-4 w-4 text-accent" />
                      <span className="font-medium text-ink">{p.urgencyVotes} {tProb('votes')}</span>
                      <span className="text-xs text-muted">— {tProb('urgency')}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleUrgencyVote(p.id)}>
                      {tProb('urgencyVote')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <button onClick={openNewProblem} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-accent/60 py-3 text-sm font-medium text-accent active:bg-accent-soft">
          <Plus className="h-4 w-4" /> {tProb('newProblem')}
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-xl tracking-tight">{tNav('polls')}</h2>
          </div>
          <Link href={withLocale('/polls')} className="text-sm font-medium text-accent">Visi →</Link>
        </div>

        {activePolls.length === 0 ? (
          <Card><CardContent className="py-7 text-center text-sm">{tPoll('noActive')}</CardContent></Card>
        ) : (
          activePolls.map((poll) => {
            const total = poll.options.reduce((sum, o) => sum + o.votes, 0)
            return (
              <Card key={poll.id} className="mb-3">
                <CardHeader>
                  <CardTitle>{poll.title}</CardTitle>
                  <p className="text-sm text-muted">{poll.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {poll.options.map(opt => {
                      const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0
                      const isVoted = poll.votedOptionId === opt.id
                      return (
                        <div key={opt.id}>
                          <button
                            disabled={!!poll.votedOptionId}
                            onClick={() => handleVotePoll(poll.id, opt.id)}
                            className={`w-full text-left rounded-2xl border px-4 py-3 transition active:scale-[0.985] ${isVoted ? 'border-accent bg-accent-soft' : 'border-line hover:bg-accent-soft'}`}
                          >
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium">{opt.label}</span>
                              <span className="tabular-nums text-muted">{opt.votes} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-line rounded-full overflow-hidden">
                              <div className="h-2 bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 text-xs text-muted">Beidzas {poll.endDate} • {total} balsis kopā</div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <p className="mt-10 text-center text-xs text-muted/60">Demo — dati saglabājas pārlūkā. Pievienojiet Supabase, lai sinhronizētu starp ierīcēm.</p>

      <FAB onClick={openNewProblem} label={t('reportProblem')} />

      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title={t('myStatus')}>
        <div className="space-y-4">
          <p className="text-sm text-muted">{t('verificationNote')}</p>
          <div>
            <label className="text-xs font-medium block mb-1 text-muted">Dzīvokļa numurs</label>
            <input
              className="input"
              placeholder="12 vai 5A"
              value={verifyApartment}
              onChange={e => setVerifyApartment(e.target.value)}
            />
          </div>
          <Button onClick={handleVerify} className="w-full">
            {t('verifyNow')} (pievienoties mājai)
          </Button>
          <div className="pt-2 border-t">
            <div className="text-xs font-medium mb-2 text-muted">{t('enterInviteCode')}</div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="ABCD1234"
                value={enteredCode}
                onChange={e => setEnteredCode(e.target.value.toUpperCase())}
              />
              <Button variant="secondary" onClick={handleJoinWithCode}>Pievienoties</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showInviteModal} onClose={() => { setShowInviteModal(false); setInviteCode('') }} title={t('inviteResidents')}>
        <div className="space-y-4">
          <p className="text-sm">Ģenerējiet kodu un nosūtiet to kaimiņiem.</p>
          <Button onClick={handleGenerateInvite} variant="secondary" className="w-full">
            {t('generateCode')}
          </Button>
          {inviteCode && (
            <div className="rounded-2xl bg-accent-soft p-4 text-center font-mono text-xl tracking-widest text-ink">
              {inviteCode}
            </div>
          )}
          <p className="text-xs text-muted">Kods derīgs 7 dienas (demo)</p>
        </div>
      </Modal>

      <Modal isOpen={showProblemModal} onClose={() => setShowProblemModal(false)} title={tProb('newProblem')}>
        <form onSubmit={submitProblem} className="space-y-4">
          <input
            className="input"
            placeholder={tProb('fields.title')}
            value={newProblem.title}
            onChange={e => setNewProblem({ ...newProblem, title: e.target.value })}
            required
          />
          <textarea
            className="input min-h-[88px]"
            placeholder={tProb('fields.description')}
            value={newProblem.description}
            onChange={e => setNewProblem({ ...newProblem, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={newProblem.category} onChange={e => setNewProblem({...newProblem, category: e.target.value})}>
              {Object.keys(tProb.raw('categories')).map(k => (
                <option key={k} value={k}>{(tProb as any)(`categories.${k}`)}</option>
              ))}
            </select>
            <select className="input" value={newProblem.priority} onChange={e => setNewProblem({...newProblem, priority: e.target.value as any})}>
              <option value="high">{tProb('priority.high')}</option>
              <option value="medium">{tProb('priority.medium')}</option>
              <option value="low">{tProb('priority.low')}</option>
            </select>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">{tProb('addPhotos')}</div>
            <PhotoUpload onPhotosChange={setProblemPhotos} maxPhotos={4} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{tProb('submitProblem')}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowProblemModal(false)}>{tCommon('cancel')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPollModal} onClose={() => setShowPollModal(false)} title={tPoll('createPoll')}>
        <form onSubmit={submitPoll} className="space-y-4">
          <input
            className="input"
            placeholder={tPoll('pollTitle')}
            value={newPoll.title}
            onChange={e => setNewPoll({...newPoll, title: e.target.value})}
            required
          />
          <textarea
            className="input"
            placeholder={tPoll('pollDescription')}
            value={newPoll.description}
            onChange={e => setNewPoll({...newPoll, description: e.target.value})}
          />
          <div>
            <div className="text-sm mb-1.5 font-medium">Varianti</div>
            {newPoll.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input className="input" value={opt} onChange={e => {
                  const opts = [...newPoll.options]
                  opts[idx] = e.target.value
                  setNewPoll({...newPoll, options: opts})
                }} />
                {newPoll.options.length > 2 && (
                  <button type="button" className="text-red-600" onClick={() => {
                    const opts = newPoll.options.filter((_, i) => i !== idx)
                    setNewPoll({...newPoll, options: opts})
                  }}>×</button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}>
              + {tPoll('addOption')}
            </Button>
          </div>
          <input type="date" className="input" value={newPoll.endDate} onChange={e => setNewPoll({...newPoll, endDate: e.target.value})} />
          <div className="pt-1 flex gap-3">
            <Button type="submit" className="flex-1">{tPoll('create')}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowPollModal(false)}>{tCommon('cancel')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}