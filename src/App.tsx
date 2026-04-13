import React, { useState, useEffect, useCallback, useRef } from 'react'

type ExerciseType = 'основа' | 'подсобка'
type Intensity = 'тяжёлая' | 'средняя' | 'лёгкая'
type ThemeName = 'neon' | 'midnight' | 'twilight' | 'forest' | 'sunset' | 'rose' | 'amber' | 'ice'
type TabName = 'tracker' | 'settings'

interface Exercise {
  id: string
  name: string
  type: ExerciseType
  intensity: Intensity
  weight: number
  sets: number
  reps: number
  note: string
  showNote: boolean
  showHistory: boolean
}

interface DayConfig {
  id: string
  key: string
  label: string
  shortLabel: string
  subtitle: string
  exercises: Exercise[]
  editingName: boolean
  tempSubtitle: string
}

interface HistoryEntry {
  id: string
  date: string
  exerciseName: string
  dayKey: string
  weight: number
  sets: number
  reps: number
  note: string
}

interface CompletedDay {
  dayKey: string
  date: string
}

interface NewExerciseForm {
  name: string
  type: ExerciseType
  intensity: Intensity
  weight: number
  sets: number
  reps: number
}

// ── Темы: все тёмные, в стиле неона, не кислотные ──
const THEMES: Record<ThemeName, {
  name: string; bg: string; surface: string; surfaceAlt: string
  primary: string; primaryDark: string; text: string; textSec: string
  accent: string; border: string; cardBg: string; inputBg: string; shadow: string
}> = {
  neon: {
    name: 'Неон',
    bg: '#0a0a0f', surface: '#12121a', surfaceAlt: '#1a1a2e',
    primary: '#00f0ff', primaryDark: '#00b8c4',
    text: '#e8e8f0', textSec: '#8888aa',
    accent: '#ff006e', border: '#2a2a3e', cardBg: '#16162a', inputBg: '#1e1e32',
    shadow: 'rgba(0,240,255,0.15)'
  },
  midnight: {
    name: 'Полночь',
    bg: '#090c14', surface: '#101520', surfaceAlt: '#161e30',
    primary: '#4f9eff', primaryDark: '#2f7fe0',
    text: '#e0e8f8', textSec: '#7888aa',
    accent: '#7eb8ff', border: '#1e2a40', cardBg: '#121828', inputBg: '#1a2238',
    shadow: 'rgba(79,158,255,0.12)'
  },
  twilight: {
    name: 'Сумерки',
    bg: '#0c0a14', surface: '#141020', surfaceAlt: '#1c1630',
    primary: '#9d7fe8', primaryDark: '#7c5ec8',
    text: '#e8e4f8', textSec: '#8878aa',
    accent: '#c4a8ff', border: '#241e3a', cardBg: '#181228', inputBg: '#201838',
    shadow: 'rgba(157,127,232,0.12)'
  },
  forest: {
    name: 'Лес',
    bg: '#090e0c', surface: '#101814', surfaceAlt: '#16221c',
    primary: '#4eca8b', primaryDark: '#2eaa6a',
    text: '#e0f0e8', textSec: '#78a890',
    accent: '#80e0b0', border: '#1a2e24', cardBg: '#122018', inputBg: '#182a20',
    shadow: 'rgba(78,202,139,0.12)'
  },
  sunset: {
    name: 'Закат',
    bg: '#0e0a08', surface: '#1a1210', surfaceAlt: '#261a16',
    primary: '#f4845f', primaryDark: '#d4643e',
    text: '#f0e8e4', textSec: '#aa8878',
    accent: '#ffaa88', border: '#362018', cardBg: '#221410', inputBg: '#2c1c18',
    shadow: 'rgba(244,132,95,0.12)'
  },
  rose: {
    name: 'Роза',
    bg: '#0e090c', surface: '#1a1018', surfaceAlt: '#261624',
    primary: '#e87fa0', primaryDark: '#c85e80',
    text: '#f0e4ec', textSec: '#aa7890',
    accent: '#ffaacc', border: '#361828', cardBg: '#22101e', inputBg: '#2c1828',
    shadow: 'rgba(232,127,160,0.12)'
  },
  amber: {
    name: 'Янтарь',
    bg: '#0e0c08', surface: '#1a1810', surfaceAlt: '#262214',
    primary: '#d4a847', primaryDark: '#b48828',
    text: '#f0ecd8', textSec: '#aa9860',
    accent: '#e8cc80', border: '#362e14', cardBg: '#22200e', inputBg: '#2c2a18',
    shadow: 'rgba(212,168,71,0.12)'
  },
  ice: {
    name: 'Лёд',
    bg: '#08100e', surface: '#101a18', surfaceAlt: '#162422',
    primary: '#7ecfea', primaryDark: '#5eafc8',
    text: '#e0f0f4', textSec: '#78a0aa',
    accent: '#a8e8f8', border: '#1a2e30', cardBg: '#102020', inputBg: '#182c2e',
    shadow: 'rgba(126,207,234,0.12)'
  }
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

const makeExercise = (name: string, type: ExerciseType, intensity: Intensity, weight = 0, sets = 3, reps = 10): Exercise => ({
  id: uid(), name, type, intensity, weight, sets, reps,
  note: '', showNote: false, showHistory: false
})

const DEFAULT_DAYS: () => DayConfig[] = () => [
  {
    id: uid(), key: 'mon', label: 'Понедельник', shortLabel: 'ПН', subtitle: 'брусья',
    exercises: [
      makeExercise('Брусья', 'основа', 'тяжёлая'),
      makeExercise('Подтягивания', 'основа', 'средняя'),
      makeExercise('Приседания', 'подсобка', 'лёгкая'),
    ],
    editingName: false, tempSubtitle: 'брусья'
  },
  {
    id: uid(), key: 'wed', label: 'Среда', shortLabel: 'СР', subtitle: 'подтягивания',
    exercises: [
      makeExercise('Подтягивания', 'основа', 'тяжёлая'),
      makeExercise('Тяга нижнего блока', 'основа', 'средняя'),
      makeExercise('Молотки', 'подсобка', 'лёгкая'),
    ],
    editingName: false, tempSubtitle: 'подтягивания'
  },
  {
    id: uid(), key: 'fri', label: 'Пятница', shortLabel: 'ПТ', subtitle: 'присед',
    exercises: [
      makeExercise('Приседания', 'основа', 'тяжёлая'),
      makeExercise('Румынская тяга', 'основа', 'средняя'),
      makeExercise('Присед в раме', 'подсобка', 'средняя'),
      makeExercise('Подтягивания со своим весом', 'подсобка', 'лёгкая', 0, 2, 8),
      makeExercise('Брусья', 'подсобка', 'лёгкая', 0, 2, 12),
    ],
    editingName: false, tempSubtitle: 'присед'
  }
]

const LS = {
  get: <T,>(key: string, fallback: T): T => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
  },
  set: (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val))
}

const EMPTY_NEW_EX: NewExerciseForm = {
  name: '', type: 'подсобка', intensity: 'средняя', weight: 0, sets: 3, reps: 10
}

export default function App() {
  const [days, setDays] = useState<DayConfig[]>(() => LS.get('workout_days', DEFAULT_DAYS()))
  const [history, setHistory] = useState<HistoryEntry[]>(() => LS.get('workout_history', []))
  const [completed, setCompleted] = useState<CompletedDay[]>(() => LS.get('workout_completed', []))
  const [theme, setTheme] = useState<ThemeName>(() => LS.get('workout_theme', 'neon' as ThemeName))
  const [activeDay, setActiveDay] = useState(0)
  const [tab, setTab] = useState<TabName>('tracker')
  const [showFinishAnim, setShowFinishAnim] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ dayIdx: number; exIdx: number } | null>(null)
  const [resetModal, setResetModal] = useState(false)
  const [cycleModal, setCycleModal] = useState(false)
  const [editDayModal, setEditDayModal] = useState<{ dayIdx: number; value: string } | null>(null)
  const [addExModal, setAddExModal] = useState(false)
  const [newEx, setNewEx] = useState<NewExerciseForm>(EMPTY_NEW_EX)
  const [editingExercise, setEditingExercise] = useState<{ dayIdx: number; exIdx: number } | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; type: ExerciseType; intensity: Intensity }>({
    name: '', type: 'подсобка', intensity: 'средняя'
  })
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [now, setNow] = useState(new Date())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { LS.set('workout_days', days) }, [days])
  useEffect(() => { LS.set('workout_history', history) }, [history])
  useEffect(() => { LS.set('workout_completed', completed) }, [completed])
  useEffect(() => { LS.set('workout_theme', theme) }, [theme])

  useEffect(() => {
    const t = THEMES[theme]
    const r = document.documentElement.style
    r.setProperty('--bg', t.bg)
    r.setProperty('--surface', t.surface)
    r.setProperty('--surface-alt', t.surfaceAlt)
    r.setProperty('--primary', t.primary)
    r.setProperty('--primary-dark', t.primaryDark)
    r.setProperty('--text', t.text)
    r.setProperty('--text-sec', t.textSec)
    r.setProperty('--accent', t.accent)
    r.setProperty('--border', t.border)
    r.setProperty('--card-bg', t.cardBg)
    r.setProperty('--input-bg', t.inputBg)
    r.setProperty('--shadow', t.shadow)
  }, [theme])

  const todayStr = now.toLocaleDateString('ru-RU')
  const currentDay = days[activeDay]

  const isDayCompletedToday = useCallback((dayKey: string) =>
    completed.some(c => c.dayKey === dayKey && c.date === todayStr), [completed, todayStr])

  const allDaysCompleted = days.every(d => isDayCompletedToday(d.key))

  const updateExercise = (dayIdx: number, exIdx: number, patch: Partial<Exercise>) => {
    setDays(d => d.map((day, di) =>
      di === dayIdx
        ? { ...day, exercises: day.exercises.map((ex, ei) => ei === exIdx ? { ...ex, ...patch } : ex) }
        : day
    ))
  }

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays(d => d.map((day, di) =>
      di === dayIdx ? { ...day, exercises: day.exercises.filter((_, ei) => ei !== exIdx) } : day
    ))
    setDeleteModal(null)
  }

  const addExercise = () => {
    if (!newEx.name.trim()) return
    const ex = makeExercise(newEx.name.trim(), newEx.type, newEx.intensity, newEx.weight, newEx.sets, newEx.reps)
    setDays(d => d.map((day, di) =>
      di === activeDay ? { ...day, exercises: [...day.exercises, ex] } : day
    ))
    setNewEx(EMPTY_NEW_EX)
    setAddExModal(false)
  }

  const startEditExercise = (dayIdx: number, exIdx: number) => {
    const ex = days[dayIdx].exercises[exIdx]
    setEditForm({ name: ex.name, type: ex.type, intensity: ex.intensity })
    setEditingExercise({ dayIdx, exIdx })
  }

  const saveEditExercise = () => {
    if (!editingExercise) return
    updateExercise(editingExercise.dayIdx, editingExercise.exIdx, {
      name: editForm.name, type: editForm.type, intensity: editForm.intensity
    })
    setEditingExercise(null)
  }

  // ── Редактирование subtitle через модалку ──
  const openEditDayModal = (dayIdx: number) => {
    setEditDayModal({ dayIdx, value: days[dayIdx].subtitle })
  }

  const saveEditDayModal = () => {
    if (!editDayModal) return
    setDays(d => d.map((day, di) =>
      di === editDayModal.dayIdx
        ? { ...day, subtitle: editDayModal.value.trim() || day.subtitle }
        : day
    ))
    setEditDayModal(null)
  }

  const getLastEntry = (exerciseName: string, dayKey: string): HistoryEntry | undefined =>
    [...history].reverse().find(h => h.exerciseName === exerciseName && h.dayKey === dayKey)

  const getExerciseHistory = (exerciseName: string, dayKey: string): HistoryEntry[] =>
    history.filter(h => h.exerciseName === exerciseName && h.dayKey === dayKey).reverse()

  const removeHistoryEntry = (entryId: string) => setHistory(h => h.filter(e => e.id !== entryId))

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragEnd = () => setDragIdx(null)
  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); return }
    setDays(d => d.map((day, di) => {
      if (di !== activeDay) return day
      const exs = [...day.exercises]
      const [moved] = exs.splice(dragIdx, 1)
      exs.splice(dropIdx, 0, moved)
      return { ...day, exercises: exs }
    }))
    setDragIdx(null)
  }

  const finishWorkout = () => {
    const day = days[activeDay]
    const entries: HistoryEntry[] = day.exercises.map(ex => ({
      id: uid(), date: todayStr, exerciseName: ex.name, dayKey: day.key,
      weight: ex.weight, sets: ex.sets, reps: ex.reps, note: ex.note
    }))
    setHistory(h => [...h, ...entries])
    setCompleted(c => [
      ...c.filter(cc => !(cc.dayKey === day.key && cc.date === todayStr)),
      { dayKey: day.key, date: todayStr }
    ])
    setDays(d => d.map((dd, di) =>
      di === activeDay
        ? { ...dd, exercises: dd.exercises.map(ex => ({ ...ex, showNote: false })) }
        : dd
    ))
    setShowFinishAnim(true)
    setTimeout(() => setShowFinishAnim(false), 800)
  }

  const startNextCycle = () => {
    setCompleted([])
    setDays(d => d.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex, note: '', showNote: false, showHistory: false
      }))
    })))
    setActiveDay(0)
    setCycleModal(false)
  }

  const exportData = () => {
    const data = { workout_days: days, workout_history: history, workout_completed: completed, workout_theme: theme }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `workout_backup_${todayStr}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.workout_days) setDays(data.workout_days)
        if (data.workout_history) setHistory(data.workout_history)
        if (data.workout_completed) setCompleted(data.workout_completed)
        if (data.workout_theme) setTheme(data.workout_theme)
      } catch { /* ignore */ }
    }
    reader.readAsText(file); e.target.value = ''
  }

  const resetAll = () => {
    setDays(DEFAULT_DAYS()); setHistory([]); setCompleted([])
    setTheme('neon'); setResetModal(false); setActiveDay(0)
  }

  const adjustValue = (dayIdx: number, exIdx: number, field: 'weight' | 'sets' | 'reps', delta: number) => {
    const ex = days[dayIdx].exercises[exIdx]
    let val = ex[field] + delta
    if (field === 'weight') val = Math.max(0, Math.min(9999, parseFloat(val.toFixed(2))))
    else val = Math.max(0, Math.min(99, val))
    updateExercise(dayIdx, exIdx, { [field]: val })
  }

  const adjustNewEx = (field: 'weight' | 'sets' | 'reps', delta: number) => {
    setNewEx(f => {
      let val = f[field] + delta
      if (field === 'weight') val = Math.max(0, Math.min(9999, parseFloat(val.toFixed(2))))
      else val = Math.max(0, Math.min(99, val))
      return { ...f, [field]: val }
    })
  }

  const handleFieldInput = (dayIdx: number, exIdx: number, field: 'weight' | 'sets' | 'reps', raw: string) => {
    const cleaned = raw.slice(0, field === 'weight' ? 7 : 2)
    const num = parseFloat(cleaned)
    if (!isNaN(num)) updateExercise(dayIdx, exIdx, { [field]: num })
    else if (cleaned === '') updateExercise(dayIdx, exIdx, { [field]: 0 })
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const intensityColor = (i: Intensity) =>
    i === 'тяжёлая' ? '#ef4444' : i === 'средняя' ? '#eab308' : '#22c55e'
  const intensityBg = (i: Intensity) =>
    i === 'тяжёлая' ? 'rgba(239,68,68,0.15)' : i === 'средняя' ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)'

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="header">
        <h1 className="header-title">🏋️ Трекер тренировок</h1>
        <div className="header-date">{formatDate(now)}</div>
        <div className="header-time">{formatTime(now)}</div>
      </header>

      <main className="main">
        {tab === 'tracker' && (
          <>
            {/* ── Day tiles ── */}
            <div className="day-tiles">
              {days.map((day, di) => {
                const isCompleted = isDayCompletedToday(day.key)
                return (
                  <button
                    key={day.id}
                    className={`day-tile ${di === activeDay ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setActiveDay(di)}
                  >
                    {/* Карандаш — правый верхний угол */}
                    <button
                      className="day-tile-pencil"
                      onClick={e => { e.stopPropagation(); openEditDayModal(di) }}
                      title="Редактировать"
                    >✎</button>

                    <div className="day-tile-top">
                      <span className="day-tile-label">{day.shortLabel}</span>
                      {isCompleted && <span className="day-tile-done">✕</span>}
                    </div>
                    <div className="day-tile-sub">
                      <span className="day-sub-text">{day.subtitle}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── Exercises ── */}
            <div className="exercises-list">
              {currentDay.exercises.map((ex, ei) => {
                const isEditing = editingExercise?.dayIdx === activeDay && editingExercise?.exIdx === ei
                const lastEntry = getLastEntry(ex.name, currentDay.key)
                const histEntries = getExerciseHistory(ex.name, currentDay.key)
                const dayCompleted = isDayCompletedToday(currentDay.key)

                return (
                  <div
                    key={ex.id}
                    className={`exercise-card ${dragIdx === ei ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(ei)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(ei)}
                  >
                    <div className="ex-top-row">
                      <span className="ex-name">{ex.name}</span>
                      <div className="ex-actions">
                        {isEditing ? (
                          <button className="ex-action-btn save" onClick={saveEditExercise}>✅</button>
                        ) : (
                          <button className="ex-action-btn pencil" onClick={() => startEditExercise(activeDay, ei)}>✎</button>
                        )}
                        <span className="ex-action-btn move">⇅</span>
                        <button className="ex-action-btn del" onClick={() => setDeleteModal({ dayIdx: activeDay, exIdx: ei })}>✕</button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="ex-edit-form">
                        <div className="ex-edit-field">
                          <label className="ex-edit-label">Название упражнения</label>
                          <input
                            className="ex-edit-input"
                            value={editForm.name}
                            maxLength={40}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Например: Жим лёжа"
                          />
                        </div>
                        <div className="ex-edit-row2">
                          <div className="ex-edit-field half">
                            <label className="ex-edit-label">Приоритет</label>
                            <select className="ex-edit-select" value={editForm.type}
                              onChange={e => setEditForm(f => ({ ...f, type: e.target.value as ExerciseType }))}>
                              <option value="основа">основа</option>
                              <option value="подсобка">подсобка</option>
                            </select>
                          </div>
                          <div className="ex-edit-field half">
                            <label className="ex-edit-label">Интенсивность</label>
                            <select className="ex-edit-select" value={editForm.intensity}
                              onChange={e => setEditForm(f => ({ ...f, intensity: e.target.value as Intensity }))}>
                              <option value="тяжёлая">тяжёлая</option>
                              <option value="средняя">средняя</option>
                              <option value="лёгкая">лёгкая</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="ex-badges">
                      <span className="badge" style={
                        ex.type === 'основа'
                          ? { color: '#ef4444', background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)' }
                          : { color: '#94a3b8', background: 'rgba(148,163,184,0.1)', borderColor: 'rgba(148,163,184,0.25)' }
                      }>{ex.type}</span>
                      <span className="badge" style={{
                        color: intensityColor(ex.intensity),
                        background: intensityBg(ex.intensity),
                        borderColor: intensityColor(ex.intensity) + '55'
                      }}>{ex.intensity}</span>
                    </div>

                    <div className="ex-inputs">
                      {(['weight', 'sets', 'reps'] as const).map(field => (
                        <div key={field} className="input-group">
                          <label className="input-label">
                            {field === 'weight' ? 'Вес кг' : field === 'sets' ? 'Подходы' : 'Повторы'}
                          </label>
                          <div className="input-stepper">
                            <button className="stepper-btn"
                              onClick={() => adjustValue(activeDay, ei, field, field === 'weight' ? -1.25 : -1)}>−</button>
                            <input type="number" className="stepper-input"
                              value={ex[field] || ''}
                              onChange={e => handleFieldInput(activeDay, ei, field, e.target.value)}
                              placeholder="0" />
                            <button className="stepper-btn"
                              onClick={() => adjustValue(activeDay, ei, field, field === 'weight' ? 1.25 : 1)}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {lastEntry && (
                      <div className="ex-last">
                        Последний: {lastEntry.weight}кг × {lastEntry.sets}×{lastEntry.reps} ({lastEntry.date})
                      </div>
                    )}

                    <div className="ex-toggles">
                      <button
                        className={`toggle-btn ${ex.showNote ? 'active' : ''}`}
                        onClick={() => updateExercise(activeDay, ei, { showNote: !ex.showNote })}
                      >📝 Заметка</button>
                      <button
                        className={`toggle-btn ${ex.showHistory ? 'active' : ''}`}
                        onClick={() => updateExercise(activeDay, ei, { showHistory: !ex.showHistory })}
                      >📊 История</button>
                    </div>

                    {ex.showNote && (
                      <textarea
                        className="ex-note"
                        value={ex.note}
                        onChange={e => updateExercise(activeDay, ei, { note: e.target.value })}
                        placeholder="Комментарий к упражнению..."
                        rows={2}
                      />
                    )}
                    {!ex.showNote && ex.note && dayCompleted && (
                      <div className="ex-note-saved">💬 {ex.note}</div>
                    )}

                    {ex.showHistory && (
                      <div className="ex-history">
                        <div className="history-title">История: {ex.name}</div>
                        {histEntries.length === 0
                          ? <div className="history-empty">Нет записей</div>
                          : <div className="history-list">
                            {histEntries.map(h => (
                              <div key={h.id} className="history-item">
                                <div className="history-info">
                                  <span className="history-date">{h.date}</span>
                                  <span className="history-data">{h.weight}кг × {h.sets}×{h.reps}</span>
                                  {h.note && <span className="history-note">💬 {h.note}</span>}
                                </div>
                                <button className="history-del" onClick={() => removeHistoryEntry(h.id)}>✕</button>
                              </div>
                            ))}
                          </div>
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Кнопка добавить упражнение ── */}
            <button className="add-ex-btn" onClick={() => { setNewEx(EMPTY_NEW_EX); setAddExModal(true) }}>
              + Добавить упражнение
            </button>

            {/* ── Кнопка завершить ── */}
            <button
              className={`finish-btn ${isDayCompletedToday(currentDay.key) ? 'finished' : ''}`}
              onClick={finishWorkout}
            >
              🏁 Завершить тренировку
            </button>

            {/* ── Следующий цикл ── */}
            {allDaysCompleted && (
              <button className="cycle-btn" onClick={() => setCycleModal(true)}>
                🔁 Следующий цикл
              </button>
            )}
          </>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div className="settings">
            <h2 className="settings-title">⚙️ Настройки</h2>
            <div className="settings-section">
              <h3>🎨 Тема оформления</h3>
              <div className="theme-grid">
                {(Object.keys(THEMES) as ThemeName[]).map(tKey => (
                  <button
                    key={tKey}
                    className={`theme-btn ${theme === tKey ? 'active' : ''}`}
                    style={{
                      background: THEMES[tKey].surface,
                      borderColor: theme === tKey ? THEMES[tKey].primary : THEMES[tKey].border,
                      color: THEMES[tKey].text
                    }}
                    onClick={() => setTheme(tKey)}
                  >
                    <span className="theme-dot" style={{ background: THEMES[tKey].primary }} />
                    {THEMES[tKey].name}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-section">
              <h3>💾 Данные</h3>
              <div className="settings-btns">
                <button className="settings-action-btn" onClick={exportData}>📤 Экспорт (JSON)</button>
                <button className="settings-action-btn" onClick={() => fileInputRef.current?.click()}>📥 Импорт (JSON)</button>
                <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
                <button className="settings-action-btn danger" onClick={() => setResetModal(true)}>🗑️ Сброс всех данных</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom nav ── */}
      <nav className="bottom-nav">
        <button className={`nav-btn ${tab === 'tracker' ? 'active' : ''}`} onClick={() => setTab('tracker')}>
          <span className="nav-icon">🏋️</span>
          <span className="nav-label">Tracker</span>
        </button>
        <button className={`nav-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Настройки</span>
        </button>
      </nav>

      {/* ── Анимация галочки ── */}
      {showFinishAnim && (
        <div className="finish-overlay">
          <div className="finish-anim-wrap">
            <div className="finish-circle-green">
              <span className="finish-check-mark">✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: редактирование subtitle дня ── */}
      {editDayModal && (
        <div className="modal-overlay" onClick={() => setEditDayModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">✎</div>
            <div className="modal-title">Название тренировки</div>
            <div className="modal-text">Введите короткое название для дня</div>
            <input
              className="modal-input"
              value={editDayModal.value}
              maxLength={20}
              autoFocus
              onChange={e => setEditDayModal(m => m ? { ...m, value: e.target.value } : m)}
              onKeyDown={e => e.key === 'Enter' && saveEditDayModal()}
              placeholder="Например: жим, тяга, присед..."
            />
            <div className="modal-char-count">{editDayModal.value.length} / 20</div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={() => setEditDayModal(null)}>Отмена</button>
              <button className="modal-btn cycle" onClick={saveEditDayModal}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: добавить упражнение ── */}
      {addExModal && (
        <div className="modal-overlay" onClick={() => setAddExModal(false)}>
          <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">💪</div>
            <div className="modal-title">Новое упражнение</div>

            <div className="modal-form">
              {/* Название */}
              <div className="modal-field">
                <label className="modal-label">Название упражнения</label>
                <input
                  className="modal-input"
                  value={newEx.name}
                  maxLength={40}
                  autoFocus
                  onChange={e => setNewEx(f => ({ ...f, name: e.target.value }))}
                  placeholder="Например: Жим лёжа"
                />
              </div>

              {/* Приоритет + Интенсивность */}
              <div className="modal-row2">
                <div className="modal-field half">
                  <label className="modal-label">Приоритет</label>
                  <select className="modal-select" value={newEx.type}
                    onChange={e => setNewEx(f => ({ ...f, type: e.target.value as ExerciseType }))}>
                    <option value="основа">основа</option>
                    <option value="подсобка">подсобка</option>
                  </select>
                </div>
                <div className="modal-field half">
                  <label className="modal-label">Интенсивность</label>
                  <select className="modal-select" value={newEx.intensity}
                    onChange={e => setNewEx(f => ({ ...f, intensity: e.target.value as Intensity }))}>
                    <option value="тяжёлая">тяжёлая</option>
                    <option value="средняя">средняя</option>
                    <option value="лёгкая">лёгкая</option>
                  </select>
                </div>
              </div>

              {/* Степперы: вес / подходы / повторы */}
              <div className="modal-steppers">
                {(['weight', 'sets', 'reps'] as const).map(field => (
                  <div key={field} className="modal-stepper-group">
                    <label className="modal-label">
                      {field === 'weight' ? 'Вес кг' : field === 'sets' ? 'Подходы' : 'Повторы'}
                    </label>
                    <div className="input-stepper">
                      <button className="stepper-btn"
                        onClick={() => adjustNewEx(field, field === 'weight' ? -1.25 : -1)}>−</button>
                      <input
                        type="number"
                        className="stepper-input"
                        value={newEx[field] || ''}
                        onChange={e => {
                          const v = parseFloat(e.target.value)
                          setNewEx(f => ({ ...f, [field]: isNaN(v) ? 0 : v }))
                        }}
                        placeholder="0"
                      />
                      <button className="stepper-btn"
                        onClick={() => adjustNewEx(field, field === 'weight' ? 1.25 : 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-btns" style={{ marginTop: '16px' }}>
              <button className="modal-btn cancel" onClick={() => setAddExModal(false)}>Отмена</button>
              <button
                className="modal-btn cycle"
                onClick={addExercise}
                disabled={!newEx.name.trim()}
                style={{ opacity: newEx.name.trim() ? 1 : 0.4 }}
              >Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: следующий цикл ── */}
      {cycleModal && (
        <div className="modal-overlay" onClick={() => setCycleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🔁</div>
            <div className="modal-title">Следующий цикл?</div>
            <div className="modal-text">
              Все три тренировки завершены! История сохранится.
              Заметки сбросятся — веса и подходы останутся.
            </div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={() => setCycleModal(false)}>Отмена</button>
              <button className="modal-btn cycle" onClick={startNextCycle}>Новый цикл</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: удалить ── */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Удалить упражнение?</div>
            <div className="modal-text">
              «{days[deleteModal.dayIdx].exercises[deleteModal.exIdx]?.name}» будет удалено.
            </div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={() => setDeleteModal(null)}>Отмена</button>
              <button className="modal-btn confirm" onClick={() => removeExercise(deleteModal.dayIdx, deleteModal.exIdx)}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: сброс ── */}
      {resetModal && (
        <div className="modal-overlay" onClick={() => setResetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Сбросить все данные?</div>
            <div className="modal-text">Все тренировки, история и настройки будут удалены.</div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={() => setResetModal(false)}>Отмена</button>
              <button className="modal-btn confirm" onClick={resetAll}>Сбросить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}