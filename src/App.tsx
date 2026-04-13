import React, { useState, useEffect, useCallback, useRef } from 'react'

type ExerciseType = 'основа' | 'подсобка'
type Intensity = 'тяжёлая' | 'средняя' | 'лёгкая'
type ThemeName = 'neon' | 'midnight' | 'ice' | 'deep' | 'steel' | 'moss' | 'wine' | 'smoke'
type TabName = 'tracker' | 'settings'

interface Exercise {
  id: string; name: string; type: ExerciseType; intensity: Intensity
  weight: number; sets: number; reps: number
  note: string; showNote: boolean; showHistory: boolean
}
interface DayConfig {
  id: string; key: string; label: string; shortLabel: string
  subtitle: string; exercises: Exercise[]
  editingName: boolean; tempSubtitle: string
}
interface HistoryEntry {
  id: string; date: string; exerciseName: string; dayKey: string
  weight: number; sets: number; reps: number; note: string
}
interface CompletedDay { dayKey: string; date: string }
interface NewExerciseForm {
  name: string; type: ExerciseType; intensity: Intensity
  weight: number; sets: number; reps: number
}

const THEMES: Record<ThemeName, {
  name: string; bg: string; surface: string; surfaceAlt: string
  primary: string; primaryDark: string; text: string; textSec: string
  accent: string; border: string; cardBg: string; inputBg: string; shadow: string
}> = {
  neon: {
    name: 'Неон', bg: '#0a0a0f', surface: '#12121a', surfaceAlt: '#1a1a2e',
    primary: '#00d4e8', primaryDark: '#0099aa', text: '#e8e8f0', textSec: '#7a7a9a',
    accent: '#cc005a', border: '#22223a', cardBg: '#14142a', inputBg: '#1c1c30',
    shadow: 'rgba(0,212,232,0.12)'
  },
  midnight: {
    name: 'Полночь', bg: '#08090f', surface: '#0f1018', surfaceAlt: '#151828',
    primary: '#4a8fd4', primaryDark: '#2a6faa', text: '#dce4f0', textSec: '#6878a0',
    accent: '#6aaae0', border: '#1c2038', cardBg: '#111422', inputBg: '#181c30',
    shadow: 'rgba(74,143,212,0.10)'
  },
  ice: {
    name: 'Лёд', bg: '#080e0f', surface: '#0f1618', surfaceAlt: '#152022',
    primary: '#6ab8cc', primaryDark: '#4a98ac', text: '#dceef2', textSec: '#6090a0',
    accent: '#88d0e0', border: '#182830', cardBg: '#101e22', inputBg: '#16262c',
    shadow: 'rgba(106,184,204,0.10)'
  },
  deep: {
    name: 'Глубина', bg: '#06080f', surface: '#0c0e18', surfaceAlt: '#121620',
    primary: '#5a7ab8', primaryDark: '#3a5a98', text: '#d8ddf0', textSec: '#5868a0',
    accent: '#7898d0', border: '#181c30', cardBg: '#0e1020', inputBg: '#141828',
    shadow: 'rgba(90,122,184,0.10)'
  },
  steel: {
    name: 'Сталь', bg: '#090a0c', surface: '#111418', surfaceAlt: '#181c22',
    primary: '#7898b0', primaryDark: '#5878a0', text: '#d8e0e8', textSec: '#607080',
    accent: '#90b0c8', border: '#1e2430', cardBg: '#131820', inputBg: '#1a2028',
    shadow: 'rgba(120,152,176,0.10)'
  },
  moss: {
    name: 'Мох', bg: '#080c0a', surface: '#101610', surfaceAlt: '#162018',
    primary: '#5a9870', primaryDark: '#3a7850', text: '#d8eadc', textSec: '#5a8068',
    accent: '#78b888', border: '#1a2c20', cardBg: '#101e14', inputBg: '#16261a',
    shadow: 'rgba(90,152,112,0.10)'
  },
  wine: {
    name: 'Гранат', bg: '#0c0808', surface: '#180e0e', surfaceAlt: '#221416',
    primary: '#a05870', primaryDark: '#804058', text: '#ecdcd8', textSec: '#906070',
    accent: '#c07888', border: '#2c1820', cardBg: '#1a1010', inputBg: '#221618',
    shadow: 'rgba(160,88,112,0.10)'
  },
  smoke: {
    name: 'Дым', bg: '#0a0a0a', surface: '#141414', surfaceAlt: '#1c1c1c',
    primary: '#8898a8', primaryDark: '#6878a0', text: '#e0e4e8', textSec: '#686878',
    accent: '#a0b0c0', border: '#242428', cardBg: '#161618', inputBg: '#1e2024',
    shadow: 'rgba(136,152,168,0.10)'
  }
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

const makeExercise = (
  name: string, type: ExerciseType, intensity: Intensity,
  weight = 0, sets = 3, reps = 10
): Exercise => ({
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
  get:    <T,>(key: string, fallback: T): T => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } },
  set:    (key: string, val: unknown) => localStorage.setItem(key, JSON.stringify(val)),
  setRaw: (key: string, val: string)  => localStorage.setItem(key, val),
  getRaw: (key: string)               => localStorage.getItem(key),
  remove: (key: string)               => localStorage.removeItem(key)
}

const EMPTY_NEW_EX: NewExerciseForm = { name: '', type: 'подсобка', intensity: 'средняя', weight: 0, sets: 3, reps: 10 }
const clampWeight = (v: number) => Math.max(0, Math.min(500, parseFloat(v.toFixed(2))))
const clampSets   = (v: number) => Math.max(0, Math.min(50,  Math.round(v)))
const clampReps   = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

export default function App() {
  const [days,      setDays]      = useState<DayConfig[]>  (() => LS.get('workout_days',      DEFAULT_DAYS()))
  const [history,   setHistory]   = useState<HistoryEntry[]>(() => LS.get('workout_history',   []))
  const [completed, setCompleted] = useState<CompletedDay[]>(() => LS.get('workout_completed', []))
  const [theme,     setTheme]     = useState<ThemeName>     (() => LS.get('workout_theme',     'neon' as ThemeName))
  const [wallpaper, setWallpaper] = useState<string | null> (() => LS.getRaw('workout_wallpaper'))
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(() => LS.get('workout_wp_opacity', 0.65))

  const [activeDay,      setActiveDay]      = useState(0)
  const [tab,            setTab]            = useState<TabName>('tracker')
  const [showFinishAnim, setShowFinishAnim] = useState(false)
  const [finishError,    setFinishError]    = useState(false)

  const [deleteModal,  setDeleteModal]  = useState<{ dayIdx: number; exIdx: number } | null>(null)
  const [resetModal,   setResetModal]   = useState(false)
  const [cycleModal,   setCycleModal]   = useState(false)
  const [editDayModal, setEditDayModal] = useState<{ dayIdx: number; value: string } | null>(null)
  const [addExModal,   setAddExModal]   = useState(false)
  const [newEx,        setNewEx]        = useState<NewExerciseForm>(EMPTY_NEW_EX)

  const [editingExercise, setEditingExercise] = useState<{ dayIdx: number; exIdx: number } | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; type: ExerciseType; intensity: Intensity }>({
    name: '', type: 'подсобка', intensity: 'средняя'
  })

  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [now,     setNow]     = useState(new Date())

  const fileInputRef    = useRef<HTMLInputElement>(null)
  const wallpaperRef    = useRef<HTMLInputElement>(null)

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { LS.set('workout_days',      days)            }, [days])
  useEffect(() => { LS.set('workout_history',   history)         }, [history])
  useEffect(() => { LS.set('workout_completed', completed)       }, [completed])
  useEffect(() => { LS.set('workout_theme',     theme)           }, [theme])
  useEffect(() => { LS.set('workout_wp_opacity', wallpaperOpacity) }, [wallpaperOpacity])

  useEffect(() => {
    const t = THEMES[theme], r = document.documentElement.style
    r.setProperty('--bg',           t.bg)
    r.setProperty('--surface',      t.surface)
    r.setProperty('--surface-alt',  t.surfaceAlt)
    r.setProperty('--primary',      t.primary)
    r.setProperty('--primary-dark', t.primaryDark)
    r.setProperty('--text',         t.text)
    r.setProperty('--text-sec',     t.textSec)
    r.setProperty('--accent',       t.accent)
    r.setProperty('--border',       t.border)
    r.setProperty('--card-bg',      t.cardBg)
    r.setProperty('--input-bg',     t.inputBg)
    r.setProperty('--shadow',       t.shadow)
  }, [theme])

  const todayStr   = now.toLocaleDateString('ru-RU')
  const currentDay = days[activeDay]

  const isDayCompletedToday = useCallback((dayKey: string) =>
    completed.some(c => c.dayKey === dayKey && c.date === todayStr), [completed, todayStr])

  const allDaysCompleted = days.every(d => isDayCompletedToday(d.key))

  const updateExercise = (dayIdx: number, exIdx: number, patch: Partial<Exercise>) =>
    setDays(d => d.map((day, di) => di !== dayIdx ? day : {
      ...day, exercises: day.exercises.map((ex, ei) => ei !== exIdx ? ex : { ...ex, ...patch })
    }))

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays(d => d.map((day, di) => di !== dayIdx ? day : { ...day, exercises: day.exercises.filter((_, ei) => ei !== exIdx) }))
    setDeleteModal(null)
  }

  const addExercise = () => {
    if (!newEx.name.trim()) return
    const ex = makeExercise(newEx.name.trim(), newEx.type, newEx.intensity, newEx.weight, newEx.sets, newEx.reps)
    setDays(d => d.map((day, di) => di !== activeDay ? day : { ...day, exercises: [...day.exercises, ex] }))
    setNewEx(EMPTY_NEW_EX); setAddExModal(false)
  }

  const startEditExercise = (dayIdx: number, exIdx: number) => {
    const ex = days[dayIdx].exercises[exIdx]
    setEditForm({ name: ex.name, type: ex.type, intensity: ex.intensity })
    setEditingExercise({ dayIdx, exIdx })
  }

  const saveEditExercise = () => {
    if (!editingExercise) return
    updateExercise(editingExercise.dayIdx, editingExercise.exIdx, { name: editForm.name, type: editForm.type, intensity: editForm.intensity })
    setEditingExercise(null)
  }

  const openEditDayModal = (dayIdx: number) => setEditDayModal({ dayIdx, value: days[dayIdx].subtitle })
  const saveEditDayModal = () => {
    if (!editDayModal) return
    setDays(d => d.map((day, di) => di !== editDayModal.dayIdx ? day : { ...day, subtitle: editDayModal.value.trim() || day.subtitle }))
    setEditDayModal(null)
  }

  const getLastEntry      = (name: string, dayKey: string) => [...history].reverse().find(h => h.exerciseName === name && h.dayKey === dayKey)
  const getExerciseHistory = (name: string, dayKey: string) => history.filter(h => h.exerciseName === name && h.dayKey === dayKey).reverse()
  const removeHistoryEntry = (id: string) => setHistory(h => h.filter(e => e.id !== id))

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragEnd   = () => setDragIdx(null)
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
    const hasData = day.exercises.some(ex => ex.weight > 0 || ex.sets > 0 || ex.reps > 0)
    if (!hasData) { setFinishError(true); setTimeout(() => setFinishError(false), 3000); return }
    setHistory(h => [...h, ...day.exercises.map(ex => ({
      id: uid(), date: todayStr, exerciseName: ex.name, dayKey: day.key,
      weight: ex.weight, sets: ex.sets, reps: ex.reps, note: ex.note
    }))])
    setCompleted(c => [...c.filter(cc => !(cc.dayKey === day.key && cc.date === todayStr)), { dayKey: day.key, date: todayStr }])
    setDays(d => d.map((dd, di) => di !== activeDay ? dd : { ...dd, exercises: dd.exercises.map(ex => ({ ...ex, showNote: false })) }))
    setFinishError(false); setShowFinishAnim(true)
    setTimeout(() => setShowFinishAnim(false), 800)
  }

  const startNextCycle = () => {
    setCompleted([])
    setDays(d => d.map(day => ({ ...day, exercises: day.exercises.map(ex => ({ ...ex, note: '', showNote: false, showHistory: false })) })))
    setActiveDay(0); setCycleModal(false)
  }

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { const b64 = ev.target?.result as string; setWallpaper(b64); LS.setRaw('workout_wallpaper', b64) }
    reader.readAsDataURL(file); e.target.value = ''
  }

  const removeWallpaper = () => { setWallpaper(null); LS.remove('workout_wallpaper') }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ workout_days: days, workout_history: history, workout_completed: completed, workout_theme: theme }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `workout_backup_${todayStr}.json`; a.click()
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.workout_days)      setDays(data.workout_days)
        if (data.workout_history)   setHistory(data.workout_history)
        if (data.workout_completed) setCompleted(data.workout_completed)
        if (data.workout_theme)     setTheme(data.workout_theme)
      } catch { /* ignore */ }
    }
    reader.readAsText(file); e.target.value = ''
  }

  const resetAll = () => { setDays(DEFAULT_DAYS()); setHistory([]); setCompleted([]); setTheme('neon'); setActiveDay(0); setResetModal(false) }

  const adjustValue = (dayIdx: number, exIdx: number, field: 'weight'|'sets'|'reps', delta: number) => {
    const raw = days[dayIdx].exercises[exIdx][field] + delta
    updateExercise(dayIdx, exIdx, { [field]: field === 'weight' ? clampWeight(raw) : field === 'sets' ? clampSets(raw) : clampReps(raw) })
  }

  const handleFieldInput = (dayIdx: number, exIdx: number, field: 'weight'|'sets'|'reps', raw: string) => {
    const num = parseFloat(raw)
    updateExercise(dayIdx, exIdx, { [field]: isNaN(num) ? 0 : field === 'weight' ? clampWeight(num) : field === 'sets' ? clampSets(num) : clampReps(num) })
  }

  const adjustNewEx = (field: 'weight'|'sets'|'reps', delta: number) =>
    setNewEx(f => { const raw = f[field] + delta; return { ...f, [field]: field === 'weight' ? clampWeight(raw) : field === 'sets' ? clampSets(raw) : clampReps(raw) } })

  const formatDate = (d: Date) => d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formatTime = (d: Date) => d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const intensityColor = (i: Intensity) => i === 'тяжёлая' ? '#e05555' : i === 'средняя' ? '#c8a840' : '#48a870'
  const intensityBg   = (i: Intensity) => i === 'тяжёлая' ? 'rgba(224,85,85,0.12)' : i === 'средняя' ? 'rgba(200,168,64,0.12)' : 'rgba(72,168,112,0.12)'

    return (
    <>
      {wallpaper && (
        <div
          className="wallpaper-bg"
          style={{
            backgroundImage: `url(${wallpaper})`,
            opacity: wallpaperOpacity
          }}
        />
      )}

      <div className={`app ${wallpaper ? 'has-wallpaper' : ''}`}>

        <header className="header">
          <h1 className="header-title">
            {tab === 'settings' ? '⚙️ Настройки' : '🏋️ Трекер тренировок'}
          </h1>
          <div className="header-date">{formatDate(now)}</div>
          <div className="header-time">{formatTime(now)}</div>
        </header>

        <main className="main">
          {tab === 'tracker' && (
            <>
              <div className="day-tiles">
                {days.map((day, di) => {
                  const isCompleted = isDayCompletedToday(day.key)
                  return (
                    <button key={day.id}
                      className={`day-tile ${di === activeDay ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => setActiveDay(di)}>
                      <button className="day-tile-pencil"
                        onClick={e => { e.stopPropagation(); openEditDayModal(di) }}>✎</button>
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

              <div className="exercises-list">
                {currentDay.exercises.map((ex, ei) => {
                  const isEditing = editingExercise?.dayIdx === activeDay && editingExercise?.exIdx === ei
                  const lastEntry = getLastEntry(ex.name, currentDay.key)
                  const histEntries = getExerciseHistory(ex.name, currentDay.key)
                  const dayCompleted = isDayCompletedToday(currentDay.key)
                  return (
                    <div key={ex.id}
                      className={`exercise-card ${dragIdx === ei ? 'dragging' : ''}`}
                      draggable onDragStart={() => handleDragStart(ei)}
                      onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(ei)}>

                      <div className="ex-top-row">
                        <span className="ex-name">{ex.name}</span>
                        <div className="ex-actions">
                          {isEditing
                            ? <button className="ex-action-btn save" onClick={saveEditExercise}>✅</button>
                            : <button className="ex-action-btn pencil" onClick={() => startEditExercise(activeDay, ei)}>✎</button>}
                          <span className="ex-action-btn move">⇅</span>
                          <button className="ex-action-btn del" onClick={() => setDeleteModal({ dayIdx: activeDay, exIdx: ei })}>✕</button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="ex-edit-form">
                          <div className="ex-edit-field">
                            <label className="ex-edit-label">Название упражнения</label>
                            <input className="ex-edit-input" value={editForm.name} maxLength={40}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              placeholder="Например: Жим лёжа" />
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
                        <span className="badge" style={ex.type === 'основа'
                          ? { color: '#e05555', background: 'rgba(224,85,85,0.10)', borderColor: 'rgba(224,85,85,0.30)' }
                          : { color: '#8090a8', background: 'rgba(128,144,168,0.08)', borderColor: 'rgba(128,144,168,0.22)' }
                        }>{ex.type}</span>
                        <span className="badge" style={{ color: intensityColor(ex.intensity), background: intensityBg(ex.intensity), borderColor: intensityColor(ex.intensity) + '44' }}>{ex.intensity}</span>
                      </div>

                      <div className="ex-inputs">
                        {(['weight', 'sets', 'reps'] as const).map(field => (
                          <div key={field} className="input-group">
                            <label className="input-label">{field === 'weight' ? 'Вес кг' : field === 'sets' ? 'Подходы' : 'Повторы'}</label>
                            <div className="input-stepper">
                              <button className="stepper-btn" onClick={() => adjustValue(activeDay, ei, field, field === 'weight' ? -1.25 : -1)}>−</button>
                              <input type="number" className="stepper-input" value={ex[field] || ''} placeholder="0"
                                onChange={e => handleFieldInput(activeDay, ei, field, e.target.value)} />
                              <button className="stepper-btn" onClick={() => adjustValue(activeDay, ei, field, field === 'weight' ? 1.25 : 1)}>+</button>
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
                        <button className={`toggle-btn ${ex.showNote ? 'active' : ''}`}
                          onClick={() => updateExercise(activeDay, ei, { showNote: !ex.showNote })}>📝 Заметка</button>
                        <button className={`toggle-btn ${ex.showHistory ? 'active' : ''}`}
                          onClick={() => updateExercise(activeDay, ei, { showHistory: !ex.showHistory })}>📊 История</button>
                      </div>

                      {ex.showNote && (
                        <textarea className="ex-note" value={ex.note} rows={2}
                          onChange={e => updateExercise(activeDay, ei, { note: e.target.value })}
                          placeholder="Комментарий к упражнению..." />
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

              <button className="add-ex-btn" onClick={() => { setNewEx(EMPTY_NEW_EX); setAddExModal(true) }}>
                + Добавить упражнение
              </button>

              {finishError && (
                <div className="finish-error">⚠️ Введите данные хотя бы в одном упражнении</div>
              )}

              <button
                className={`finish-btn ${isDayCompletedToday(currentDay.key) ? 'finished' : ''} ${finishError ? 'error-shake' : ''}`}
                onClick={finishWorkout}>
                🏁 Завершить тренировку
              </button>

              {allDaysCompleted && (
                <button className="cycle-btn" onClick={() => setCycleModal(true)}>🔁 Следующий цикл</button>
              )}
            </>
          )}

          {tab === 'settings' && (
            <div className="settings">
              <div className="settings-section">
                <h3>🎨 Тема оформления</h3>
                <div className="theme-grid">
                  {(Object.keys(THEMES) as ThemeName[]).map(tKey => (
                    <button key={tKey}
                      className={`theme-btn ${theme === tKey ? 'active' : ''}`}
                      style={{ background: THEMES[tKey].surface, borderColor: theme === tKey ? THEMES[tKey].primary : THEMES[tKey].border, color: THEMES[tKey].text }}
                      onClick={() => setTheme(tKey)}>
                      <span className="theme-dot" style={{ background: THEMES[tKey].primary }} />
                      {THEMES[tKey].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-section">
                <h3>🖼️ Обои</h3>
                {wallpaper && (
                  <div className="wp-opacity-row">
                    <label className="wp-slider-label">
                      Яркость обоев: {Math.round(wallpaperOpacity * 100)}%
                    </label>
                    <input type="range" min="0.3" max="1.0" step="0.05"
                      value={wallpaperOpacity}
                      onChange={e => setWallpaperOpacity(parseFloat(e.target.value))}
                      className="wp-slider" />
                  </div>
                )}
                <div className="settings-btns">
                  <button className="settings-action-btn" onClick={() => wallpaperRef.current?.click()}>
                    📷 {wallpaper ? 'Сменить обои' : 'Загрузить обои'}
                  </button>
                  {wallpaper && (
                    <button className="settings-action-btn danger" onClick={removeWallpaper}>
                      🗑️ Убрать обои
                    </button>
                  )}
                  <input ref={wallpaperRef} type="file" accept="image/*"
                    style={{ display: 'none' }} onChange={handleWallpaperUpload} />
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

        {showFinishAnim && (
          <div className="finish-overlay">
            <div className="finish-anim-wrap">
              <div className="finish-circle-green">
                <span className="finish-check-mark">✓</span>
              </div>
            </div>
          </div>
        )}

        {editDayModal && (
          <div className="modal-overlay" onClick={() => setEditDayModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">✎</div>
              <div className="modal-title">Название тренировки</div>
              <div className="modal-text">Короткое описание дня (до 20 символов)</div>
              <input className="modal-input" value={editDayModal.value} maxLength={20} autoFocus
                onChange={e => setEditDayModal(m => m ? { ...m, value: e.target.value } : m)}
                onKeyDown={e => e.key === 'Enter' && saveEditDayModal()}
                placeholder="Например: жим, тяга, присед..." />
              <div className="modal-char-count">{editDayModal.value.length} / 20</div>
              <div className="modal-btns">
                <button className="modal-btn cancel" onClick={() => setEditDayModal(null)}>Отмена</button>
                <button className="modal-btn primary-btn" onClick={saveEditDayModal}>Сохранить</button>
              </div>
            </div>
          </div>
        )}

        {addExModal && (
          <div className="modal-overlay" onClick={() => setAddExModal(false)}>
            <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">💪</div>
              <div className="modal-title">Новое упражнение</div>
              <div className="modal-form">
                <div className="modal-field">
                  <label className="modal-label">Название упражнения</label>
                  <input className="modal-input" value={newEx.name} maxLength={40} autoFocus
                    onChange={e => setNewEx(f => ({ ...f, name: e.target.value }))}
                    placeholder="Например: Жим лёжа" />
                </div>
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
                <div className="modal-steppers">
                  {(['weight', 'sets', 'reps'] as const).map(field => (
                    <div key={field} className="modal-stepper-group">
                      <label className="modal-label">{field === 'weight' ? 'Вес кг' : field === 'sets' ? 'Подходы' : 'Повторы'}</label>
                      <div className="input-stepper">
                        <button className="stepper-btn" onClick={() => adjustNewEx(field, field === 'weight' ? -1.25 : -1)}>−</button>
                        <input type="number" className="stepper-input" value={newEx[field] || ''} placeholder="0"
                          onChange={e => { const v = parseFloat(e.target.value); setNewEx(f => ({ ...f, [field]: isNaN(v) ? 0 : field === 'weight' ? clampWeight(v) : field === 'sets' ? clampSets(v) : clampReps(v) })) }} />
                        <button className="stepper-btn" onClick={() => adjustNewEx(field, field === 'weight' ? 1.25 : 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-btns" style={{ marginTop: '16px' }}>
                <button className="modal-btn cancel" onClick={() => setAddExModal(false)}>Отмена</button>
                <button className="modal-btn primary-btn" onClick={addExercise}
                  disabled={!newEx.name.trim()} style={{ opacity: newEx.name.trim() ? 1 : 0.4 }}>Добавить</button>
              </div>
            </div>
          </div>
        )}

        {cycleModal && (
          <div className="modal-overlay" onClick={() => setCycleModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">🔁</div>
              <div className="modal-title">Следующий цикл?</div>
              <div className="modal-text">История сохранится. Заметки сбросятся — веса и подходы останутся.</div>
              <div className="modal-btns">
                <button className="modal-btn cancel" onClick={() => setCycleModal(false)}>Отмена</button>
                <button className="modal-btn cycle" onClick={startNextCycle}>Новый цикл</button>
              </div>
            </div>
          </div>
        )}

        {deleteModal && (
          <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Удалить упражнение?</div>
              <div className="modal-text">«{days[deleteModal.dayIdx].exercises[deleteModal.exIdx]?.name}» будет удалено.</div>
              <div className="modal-btns">
                <button className="modal-btn cancel" onClick={() => setDeleteModal(null)}>Отмена</button>
                <button className="modal-btn confirm" onClick={() => removeExercise(deleteModal.dayIdx, deleteModal.exIdx)}>Удалить</button>
              </div>
            </div>
          </div>
        )}

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
    </>
  )
}