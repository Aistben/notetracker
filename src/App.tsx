import React, { useState, useEffect, useCallback, useRef } from 'react'

type ExerciseType = 'основа' | 'подсобка'
type Intensity = 'тяжёлая' | 'средняя' | 'лёгкая'
type ThemeName = 'neon' | 'violet' | 'emerald' | 'sunset' | 'magenta' | 'lemon' | 'cobalt' | 'terracotta'
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

const THEMES: Record<ThemeName, {
  name: string; bg: string; surface: string; surfaceAlt: string
  primary: string; primaryDark: string; text: string; textSec: string
  accent: string; border: string; cardBg: string; inputBg: string; shadow: string
}> = {
  neon: {
    name: 'Неон', bg: '#0a0a0f', surface: '#12121a', surfaceAlt: '#1a1a2e',
    primary: '#00f0ff', primaryDark: '#00b8c4', text: '#e8e8f0', textSec: '#8888aa',
    accent: '#ff006e', border: '#2a2a3e', cardBg: '#16162a', inputBg: '#1e1e32', shadow: 'rgba(0,240,255,0.15)'
  },
  violet: {
    name: 'Фиолет', bg: '#0d0b1a', surface: '#151228', surfaceAlt: '#1e1a38',
    primary: '#a855f7', primaryDark: '#7c3aed', text: '#e8e4f0', textSec: '#9088aa',
    accent: '#f472b6', border: '#2d2848', cardBg: '#1a1630', inputBg: '#221e3a', shadow: 'rgba(168,85,247,0.15)'
  },
  emerald: {
    name: 'Изумруд', bg: '#0a0f0d', surface: '#101a16', surfaceAlt: '#162e24',
    primary: '#34d399', primaryDark: '#059669', text: '#e0f0e8', textSec: '#80aa90',
    accent: '#fbbf24', border: '#1e3e2e', cardBg: '#142a20', inputBg: '#1a3228', shadow: 'rgba(52,211,153,0.15)'
  },
  sunset: {
    name: 'Закат', bg: '#120c08', surface: '#1a1210', surfaceAlt: '#2e1a14',
    primary: '#f97316', primaryDark: '#ea580c', text: '#f0e8e0', textSec: '#aa9080',
    accent: '#fb7185', border: '#3e2a1e', cardBg: '#2a1810', inputBg: '#321e16', shadow: 'rgba(249,115,22,0.15)'
  },
  magenta: {
    name: 'Маджента', bg: '#120a10', surface: '#1a1018', surfaceAlt: '#2e1828',
    primary: '#e879f9', primaryDark: '#c026d3', text: '#f0e4f0', textSec: '#aa80a8',
    accent: '#38bdf8', border: '#3e1e38', cardBg: '#2a1428', inputBg: '#321a30', shadow: 'rgba(232,121,249,0.15)'
  },
  lemon: {
    name: 'Лимон', bg: '#0e0e08', surface: '#181810', surfaceAlt: '#28281a',
    primary: '#eab308', primaryDark: '#ca8a04', text: '#f0f0e0', textSec: '#a8a880',
    accent: '#22d3ee', border: '#38381e', cardBg: '#222210', inputBg: '#2a2a18', shadow: 'rgba(234,179,8,0.15)'
  },
  cobalt: {
    name: 'Кобальт', bg: '#080a12', surface: '#10121a', surfaceAlt: '#181e30',
    primary: '#3b82f6', primaryDark: '#2563eb', text: '#e0e8f0', textSec: '#8090aa',
    accent: '#f472b6', border: '#1e2e48', cardBg: '#141a2e', inputBg: '#1a2238', shadow: 'rgba(59,130,246,0.15)'
  },
  terracotta: {
    name: 'Терракота', bg: '#100a08', surface: '#181010', surfaceAlt: '#2a1818',
    primary: '#dc6843', primaryDark: '#b84c2e', text: '#f0e4e0', textSec: '#aa8880',
    accent: '#4ade80', border: '#3a2220', cardBg: '#241414', inputBg: '#2c1a1a', shadow: 'rgba(220,104,67,0.15)'
  }
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

const makeExercise = (name: string, type: ExerciseType, intensity: Intensity): Exercise => ({
  id: uid(), name, type, intensity,
  weight: 0, sets: 3, reps: 10,
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
      { ...makeExercise('Подтягивания со своим весом', 'подсобка', 'лёгкая'), sets: 2, reps: 8 },
      { ...makeExercise('Брусья', 'подсобка', 'лёгкая'), sets: 2, reps: 12 },
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

  // Все 3 дня завершены сегодня → показываем кнопку цикла
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

  const startEditDayName = (dayIdx: number) => {
    setDays(d => d.map((day, di) =>
      di === dayIdx ? { ...day, editingName: true, tempSubtitle: day.subtitle } : day
    ))
  }

  const saveDayName = (dayIdx: number) => {
    setDays(d => d.map((day, di) =>
      di === dayIdx ? { ...day, subtitle: day.tempSubtitle, editingName: false } : day
    ))
  }

  const getLastEntry = (exerciseName: string, dayKey: string): HistoryEntry | undefined =>
    [...history].reverse().find(h => h.exerciseName === exerciseName && h.dayKey === dayKey)

  const getExerciseHistory = (exerciseName: string, dayKey: string): HistoryEntry[] =>
    history.filter(h => h.exerciseName === exerciseName && h.dayKey === dayKey).reverse()

  const removeHistoryEntry = (entryId: string) => setHistory(h => h.filter(e => e.id !== entryId))

  // ── Drag & drop с фиксом залипания ──
  const handleDragStart = (idx: number) => setDragIdx(idx)

  // onDragEnd срабатывает ВСЕГДА — даже если drop был за пределами
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
    // Скрываем панель заметки но не очищаем текст
    setDays(d => d.map((dd, di) =>
      di === activeDay
        ? { ...dd, exercises: dd.exercises.map(ex => ({ ...ex, showNote: false })) }
        : dd
    ))
    setShowFinishAnim(true)
    setTimeout(() => setShowFinishAnim(false), 800) // 0.8с
  }

  // ── Следующий цикл ──
  const startNextCycle = () => {
    // Очищаем completed — плитки снова открыты
    setCompleted([])
    // Очищаем заметки и скрываем панели, вес/подходы/повторы остаются
    setDays(d => d.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        note: '',
        showNote: false,
        showHistory: false
      }))
    })))
    setActiveDay(0)
    setCycleModal(false)
  }

  const exportData = () => {
    const data = { workout_days: days, workout_history: history, workout_completed: completed, workout_theme: theme }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `workout_backup_${todayStr}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
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
    reader.readAsText(file)
    e.target.value = ''
  }

  const resetAll = () => {
    setDays(DEFAULT_DAYS())
    setHistory([])
    setCompleted([])   // ← очищаем completed при сбросе
    setTheme('neon')
    setResetModal(false)
    setActiveDay(0)
  }

  const adjustValue = (dayIdx: number, exIdx: number, field: 'weight' | 'sets' | 'reps', delta: number) => {
    const ex = days[dayIdx].exercises[exIdx]
    let val = ex[field] + delta
    if (field === 'weight') val = Math.max(0, Math.min(9999, parseFloat(val.toFixed(2))))
    else val = Math.max(0, Math.min(99, val))
    updateExercise(dayIdx, exIdx, { [field]: val })
  }

  const handleFieldInput = (dayIdx: number, exIdx: number, field: 'weight' | 'sets' | 'reps', raw: string) => {
    const maxLen = field === 'weight' ? 7 : 2
    const cleaned = raw.slice(0, maxLen)
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
              {days.map((day, di) => (
                <button
                  key={day.id}
                  className={`day-tile ${di === activeDay ? 'active' : ''} ${isDayCompletedToday(day.key) ? 'completed' : ''}`}
                  onClick={() => setActiveDay(di)}
                >
                  <div className="day-tile-top">
                    <span className="day-tile-label">{day.shortLabel}</span>
                    {isDayCompletedToday(day.key) && (
                      <span className="day-tile-done">✕</span>
                    )}
                  </div>
                  <div className="day-tile-sub">
                    {day.editingName ? (
                      <div className="day-edit-row" onClick={e => e.stopPropagation()}>
                        <input
                          className="day-edit-input"
                          value={day.tempSubtitle}
                          maxLength={12}
                          onChange={e => setDays(d => d.map((dd, ddi) =>
                            ddi === di ? { ...dd, tempSubtitle: e.target.value } : dd
                          ))}
                          onKeyDown={e => e.key === 'Enter' && saveDayName(di)}
                          autoFocus
                        />
                        <button className="day-edit-save" onClick={() => saveDayName(di)}>✅</button>
                      </div>
                    ) : (
                      <div className="day-sub-row">
                        <span className="day-sub-text">{day.subtitle}</span>
                        <button
                          className="day-edit-btn"
                          onClick={e => { e.stopPropagation(); startEditDayName(di) }}
                        >✎</button>
                      </div>
                    )}
                  </div>
                </button>
              ))}
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
                    onDragEnd={handleDragEnd}          // ← фикс залипания
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(ei)}
                  >
                    {/* Top row */}
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

                    {/* Edit form */}
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
                            <select
                              className="ex-edit-select"
                              value={editForm.type}
                              onChange={e => setEditForm(f => ({ ...f, type: e.target.value as ExerciseType }))}
                            >
                              <option value="основа">основа</option>
                              <option value="подсобка">подсобка</option>
                            </select>
                          </div>
                          <div className="ex-edit-field half">
                            <label className="ex-edit-label">Интенсивность</label>
                            <select
                              className="ex-edit-select"
                              value={editForm.intensity}
                              onChange={e => setEditForm(f => ({ ...f, intensity: e.target.value as Intensity }))}
                            >
                              <option value="тяжёлая">тяжёлая</option>
                              <option value="средняя">средняя</option>
                              <option value="лёгкая">лёгкая</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Badges */}
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

                    {/* Inputs */}
                    <div className="ex-inputs">
                      {(['weight', 'sets', 'reps'] as const).map(field => (
                        <div key={field} className="input-group">
                          <label className="input-label">
                            {field === 'weight' ? 'Вес кг' : field === 'sets' ? 'Подходы' : 'Повторы'}
                          </label>
                          <div className="input-stepper">
                            <button
                              className="stepper-btn"
                              onClick={() => adjustValue(activeDay, ei, field, field === 'weight' ? -1.25 : -1)}
                            >−</button>
                            <input
                              type="number"
                              className="stepper-input"
                              value={ex[field] || ''}
                              onChange={e => handleFieldInput(activeDay, ei, field, e.target.value)}
                              placeholder="0"
                            />
                            <button
                              className="stepper-btn"
                              onClick={() => adjustValue(activeDay, ei, field, field === 'weight' ? 1.25 : 1)}
                            >+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Last entry */}
                    {lastEntry && (
                      <div className="ex-last">
                        Последний: {lastEntry.weight}кг × {lastEntry.sets}×{lastEntry.reps} ({lastEntry.date})
                      </div>
                    )}

                    {/* Toggles */}
                    <div className="ex-toggles">
                      {/* Заметка — показываем всегда, редактируемая даже после завершения */}
                      <button
                        className={`toggle-btn ${ex.showNote ? 'active' : ''}`}
                        onClick={() => updateExercise(activeDay, ei, { showNote: !ex.showNote })}
                      >📝 Заметка</button>
                      <button
                        className={`toggle-btn ${ex.showHistory ? 'active' : ''}`}
                        onClick={() => updateExercise(activeDay, ei, { showHistory: !ex.showHistory })}
                      >📊 История</button>
                    </div>

                    {/* Заметка — редактируемая ВСЕГДА (даже после завершения) */}
                    {ex.showNote && (
                      <textarea
                        className="ex-note"
                        value={ex.note}
                        onChange={e => updateExercise(activeDay, ei, { note: e.target.value })}
                        placeholder="Комментарий к упражнению..."
                        rows={2}
                      />
                    )}

                    {/* Сохранённая заметка когда панель скрыта */}
                    {!ex.showNote && ex.note && dayCompleted && (
                      <div className="ex-note-saved">💬 {ex.note}</div>
                    )}

                    {/* History */}
                    {ex.showHistory && (
                      <div className="ex-history">
                        <div className="history-title">История: {ex.name}</div>
                        {histEntries.length === 0 ? (
                          <div className="history-empty">Нет записей</div>
                        ) : (
                          <div className="history-list">
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
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Finish button ── */}
            <button
              className={`finish-btn ${isDayCompletedToday(currentDay.key) ? 'finished' : ''}`}
              onClick={finishWorkout}
            >
              🏁 Завершить тренировку
            </button>

            {/* ── Кнопка "Следующий цикл" — только когда все 3 дня завершены ── */}
            {allDaysCompleted && (
              <button
                className="cycle-btn"
                onClick={() => setCycleModal(true)}
              >
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

      {/* ── Анимация: зелёная галочка 0.8с ── */}
      {showFinishAnim && (
        <div className="finish-overlay">
          <div className="finish-anim-wrap">
            <div className="finish-circle-green">
              <span className="finish-check-mark">✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: следующий цикл ── */}
      {cycleModal && (
        <div className="modal-overlay" onClick={() => setCycleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🔁</div>
            <div className="modal-title">Начать следующий цикл?</div>
            <div className="modal-text">
              Все три тренировки завершены! История сохранится.
              Заметки и статусы дней сбросятся — веса и подходы останутся.
            </div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={() => setCycleModal(false)}>Отмена</button>
              <button className="modal-btn cycle" onClick={startNextCycle}>Новый цикл</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: удалить упражнение ── */}
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

      {/* ── Модал: сброс данных ── */}
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