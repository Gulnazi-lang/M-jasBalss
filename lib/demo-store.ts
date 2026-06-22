// Simple localStorage-backed demo store for interactive features
// Keeps the experience realistic across reloads without a backend.

export type DemoProblem = {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  photos: string[]   // data URLs
  urgencyVotes: number
  createdAt: string
}

export type DemoPoll = {
  id: string
  title: string
  description: string
  options: { id: string; label: string; votes: number }[]
  endDate: string
  status: 'active' | 'closed'
  votedOptionId?: string | null
  createdAt: string
}

const PROBLEMS_KEY = 'majasbalss_problems'
const POLLS_KEY = 'majasbalss_polls'
const VERIFIED_KEY = 'majasbalss_verified'

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// PROBLEMS
export function getDemoProblems(): DemoProblem[] {
  const initial: DemoProblem[] = [
    {
      id: 'p1',
      title: 'Протечка в подъезде 2 этаж',
      description: 'На 2-м этаже течет потолок после дождя. Нужно срочно.',
      category: 'roof',
      priority: 'high',
      status: 'open',
      photos: [],
      urgencyVotes: 7,
      createdAt: '2026-06-10',
    },
    {
      id: 'p2',
      title: 'Не работает домофон',
      description: 'Домофон не реагирует уже несколько дней.',
      category: 'other',
      priority: 'medium',
      status: 'in_progress',
      photos: [],
      urgencyVotes: 3,
      createdAt: '2026-06-08',
    },
  ]
  const stored = load<DemoProblem[]>(PROBLEMS_KEY, initial)
  return stored
}

export function saveDemoProblems(problems: DemoProblem[]) {
  save(PROBLEMS_KEY, problems)
}

export function addDemoProblem(problem: Omit<DemoProblem, 'id' | 'urgencyVotes' | 'createdAt'>): DemoProblem {
  const problems = getDemoProblems()
  const newProblem: DemoProblem = {
    ...problem,
    id: 'p' + Date.now(),
    urgencyVotes: 1,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  const updated = [newProblem, ...problems]
  saveDemoProblems(updated)
  return newProblem
}

export function voteUrgency(problemId: string): DemoProblem[] {
  const problems = getDemoProblems()
  const updated = problems.map(p =>
    p.id === problemId ? { ...p, urgencyVotes: p.urgencyVotes + 1 } : p
  )
  saveDemoProblems(updated)
  return updated
}

// POLLS
export function getDemoPolls(): DemoPoll[] {
  const initial: DemoPoll[] = [
    {
      id: 'poll1',
      title: 'Установка видеонаблюдения во дворе',
      description: 'Предлагаем установить 4 камеры. Стоимость ~€35 на квартиру.',
      options: [
        { id: 'yes', label: 'Jā / Поддерживаю', votes: 19 },
        { id: 'no', label: 'Nē / Против', votes: 4 },
        { id: 'abstain', label: 'Atturēties', votes: 3 },
      ],
      endDate: '2026-07-02',
      status: 'active',
      votedOptionId: null,
      createdAt: '2026-06-10',
    },
  ]
  return load<DemoPoll[]>(POLLS_KEY, initial)
}

export function saveDemoPolls(polls: DemoPoll[]) {
  save(POLLS_KEY, polls)
}

export function createDemoPoll(data: { title: string; description: string; options: string[]; endDate: string }): DemoPoll {
  const polls = getDemoPolls()
  const newPoll: DemoPoll = {
    id: 'poll' + Date.now(),
    title: data.title,
    description: data.description,
    options: data.options.map((label, i) => ({ id: 'opt' + i, label, votes: 0 })),
    endDate: data.endDate,
    status: 'active',
    votedOptionId: null,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  const updated = [newPoll, ...polls]
  saveDemoPolls(updated)
  return newPoll
}

export function voteOnPoll(pollId: string, optionId: string): DemoPoll[] {
  const polls = getDemoPolls()
  const updated = polls.map(poll => {
    if (poll.id !== pollId || poll.votedOptionId) return poll

    const newOptions = poll.options.map(opt =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    )
    return { ...poll, options: newOptions, votedOptionId: optionId }
  })
  saveDemoPolls(updated)
  return updated
}

// VERIFICATION (demo)
export function isVerified(): boolean {
  return load<boolean>(VERIFIED_KEY, false)
}

export function setVerified(value: boolean) {
  save(VERIFIED_KEY, value)
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
