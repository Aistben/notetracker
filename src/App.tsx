import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import DayTabs from './components/DayTabs'
import ExerciseCard from './components/ExerciseCard'
import Modals from './components/Modals'
import SettingsPanel from './components/SettingsPanel'
import { useLocalStorage, getRawLocalStorage, setRawLocalStorage, removeLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import {
  DayConfig,
  Exercise,
  ExerciseType,
  HistoryEntry,
  Intensity,
  NewExerciseForm,
  TabName
} from './utils/constants'
import {
  clampReps,
  clampSets,
  clampWeight,
  DEFAULT_DAYS,
  EMPTY_NEW_EX,
  formatDate,
  formatTime,
  makeExercise,
  uid
} from './utils/helpers'
import './App.css'

export default function App() {
  const [days, setDays] = useLocalStorage<DayConfig[]>('workout_days', DEFAULT_DAYS())
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('workout_history', [])
  const [completed, setCompleted] = useLocalStorage<string[]>('workout_completed', [])
  const { theme, setTheme, themes } = useTheme('neon')
  const [wallpaperOpacity, setWallpaperOpacity] = useLocalStorage<number>('workout_wp_opacity', 0.65)
  const [wallpaper, setWallpaper] = useState<string | null>(() => getRawLocalStorage('workout_wallpaper'))

  const [activeDay, setActiveDay] = useLocalStorage<number>('workout_active_day', 0)
  const [tab, setTab] = useLocalStorage<TabName>('workout_tab', 'tracker')
  const [showFinishAnim, setShowFinishAnim] = useState(false)
  const [finishError, setFinishError] = useState(false)

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
  const manualDayOverrideRef = useRef(false)
  const didAutoAdvanceRef = useRef<string | null>(null)

  // Ref для Swiper
  const swiperRef = useRef<any>(null)

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  const currentDay = days[activeDay]

  useEffect(() => {
    if (!Array.isArray(days) || days.length === 0) {
      setDays(DEFAULT_DAYS())
      setActiveDay(0)
      return
    }
    if (!Number.isFinite(activeDay) || activeDay < 0 || activeDay >= days.length) {
      setActiveDay(0)
    }
  }, [activeDay, days, setDays])

  useEffect(() => {
    if (!Array.isArray(completed)) setCompleted([])
  }, [completed, setCompleted])

  useEffect(() => {
    if (!Array.isArray(history)) setHistory([])
  }, [history, setHistory])

  const safeCompleted = Array.isArray(completed) ? completed : []
  const safeHistory = Array.isArray(history) ? history : []

  const isDayCompleted = useCallback((dayKey: string) =>
    safeCompleted.includes(dayKey), [safeCompleted])

  const allDaysCompleted = days.every(d => isDayCompleted(d.key))

  const getNextUncompletedDayIdx = useCallback((fromIdx: number) => {
    if (!Array.isArray(days) || days.length === 0) return 0
    for (let step = 1; step <= days.length; step++) {
      const idx = (fromIdx + step) % days.length
      if (!isDayCompleted(days[idx].key)) return idx
    }
    return fromIdx
  }, [days, isDayCompleted])

  useEffect(() => {
    if (didAutoAdvanceRef.current === todayStr) return
    didAutoAdvanceRef.current = todayStr
    if (manualDayOverrideRef.current) return
    if (!Array.isArray(days) || days.length === 0) return
    const day = days[activeDay]
    if (!day) return
    if (isDayCompleted(day.key) && !allDaysCompleted) {
      const nextIdx = getNextUncompletedDayIdx(activeDay)
      if (nextIdx !== activeDay) setActiveDay(nextIdx)
    }
  }, [activeDay, allDaysCompleted, days, getNextUncompletedDayIdx, isDayCompleted, setActiveDay])

  const handleSelectDay = (idx: number) => {
    manualDayOverrideRef.current = true
    setActiveDay(idx)
  }

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

  const getLastEntry      = (name: string, dayKey: string) => [...safeHistory].reverse().find(h => h.exerciseName === name && h.dayKey === dayKey)
  const getExerciseHistory = (name: string, dayKey: string) => safeHistory.filter(h => h.exerciseName === name && h.dayKey === dayKey).reverse()
  const removeHistoryEntry = (id: string) => setHistory(h => (Array.isArray(h) ? h.filter(e => e.id !== id) : []))

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

  const todayStr = new Date().toLocaleDateString('ru-RU')

  const handleSlideChangeTransitionEnd = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.updateAutoHeight()
    }
  }

  const finishWorkout = () => {
    const day = days[activeDay]
    const hasData = day.exercises.some(ex => ex.weight > 0 || ex.sets > 0 || ex.reps > 0)
    if (!hasData) { setFinishError(true); setTimeout(() => setFinishError(false), 3000); return }
    setHistory(h => [...h, ...day.exercises.map(ex => ({
      id: uid(), date: todayStr, exerciseName: ex.name, dayKey: day.key,
      weight: ex.weight, sets: ex.sets, reps: ex.reps, note: ex.note
    }))])
    setCompleted(prev => {
      if (prev.includes(day.key)) return prev
      return [...prev, day.key]
    })
    setDays(d => d.map((dd, di) => di !== activeDay ? dd : { ...dd, exercises: dd.exercises.map(ex => ({ ...ex, showNote: false })) }))
    setFinishError(false); setShowFinishAnim(true)
    setTimeout(() => setShowFinishAnim(false), 800)
    if (!allDaysCompleted) {
      const nextIdx = getNextUncompletedDayIdx(activeDay)
      if (nextIdx !== activeDay) setActiveDay(nextIdx)
    }
  }

  const startNextCycle = () => {
    setCompleted([])
    setDays(d => d.map(day => ({ ...day, exercises: day.exercises.map(ex => ({ ...ex, weight: 0, sets: 3, reps: 10, note: '', showNote: false, showHistory: false })) })))
    setActiveDay(0); setCycleModal(false)
  }

  const handleWallpaperUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { const b64 = ev.target?.result as string; setWallpaper(b64); setRawLocalStorage('workout_wallpaper', b64) }
    reader.readAsDataURL(file); e.target.value = ''
  }

  const removeWallpaper = () => { setWallpaper(null); removeLocalStorage('workout_wallpaper') }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ workout_days: days, workout_history: history, workout_completed: completed, workout_theme: theme }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `workout_backup_${todayStr}.json`; a.click()
  }

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
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

  const parseNewExField = (field: 'weight'|'sets'|'reps', raw: string) => {
    const value = parseFloat(raw)
    if (isNaN(value)) return 0
    if (field === 'weight') return clampWeight(value)
    if (field === 'sets') return clampSets(value)
    return clampReps(value)
  }

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
          {tab === 'settings' ? (
            <button className="back-btn" onClick={() => setTab('tracker')}>
              ←
            </button>
          ) : (
            <button className="settings-btn" onClick={() => setTab('settings')}>
              ⚙️
            </button>
          )}
        </header>

        <main className="main">
          {tab === 'tracker' && (
            <>
              <DayTabs
                days={days}
                activeDay={activeDay}
                isDayCompleted={isDayCompleted}
                onSelectDay={handleSelectDay}
                onEditDay={openEditDayModal}
              />

             <Swiper
  ref={swiperRef}
  spaceBetween={16}
  slidesPerView={1}
  onSlideChange={(swiper) => setActiveDay(swiper.activeIndex)}
  onSlideChangeTransitionStart={() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.updateAutoHeight()
    }
  }}
  onSlideChangeTransitionEnd={() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.updateAutoHeight()
    }
  }}
  initialSlide={activeDay}
  speed={400}
  style={{ width: '100%', overflow: 'hidden' }}
>
  {days.map((day) => (
    <SwiperSlide key={day.key} style={{ height: '100%', overflowY: 'auto' }}>
      <div className="exercises-list">
        {day.exercises.map((ex, ei) => {
          const isEditing = editingExercise?.dayIdx === activeDay && editingExercise?.exIdx === ei
          const lastEntry = getLastEntry(ex.name, day.key)
          const histEntries = getExerciseHistory(ex.name, day.key)
          const dayCompleted = isDayCompleted(day.key)
          return (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              exIdx={ei}
              activeDay={activeDay}
              dragIdx={dragIdx}
              isEditing={isEditing}
              editForm={editForm}
              lastEntry={lastEntry}
              histEntries={histEntries}
              dayCompleted={dayCompleted}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onSaveEdit={saveEditExercise}
              onStartEdit={startEditExercise}
              onRequestDelete={(dayIdx, exIdx) => setDeleteModal({ dayIdx, exIdx })}
              onAddExercise={() => { setNewEx(EMPTY_NEW_EX); setAddExModal(true) }}
              onEditFormChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
              onAdjustValue={adjustValue}
              onFieldInput={handleFieldInput}
              onUpdateExercise={updateExercise}
              onRemoveHistoryEntry={removeHistoryEntry}
            />
          )
        })}
      </div>
    </SwiperSlide>
  ))}
</Swiper>

          {/* Фиксированный футер вне Swiper */}
          {tab === 'tracker' && (
            <div className="fixed-footer">
              {finishError && (
                <div className="finish-error">⚠️ Введите данные хотя бы в одном упражнении</div>
              )}

              <button
                className={`finish-btn ${isDayCompleted(days[activeDay]?.key) ? 'finished' : ''} ${finishError ? 'error-shake' : ''}`}
                onClick={finishWorkout}>
                🏁 Завершить тренировку
              </button>

              {allDaysCompleted && (
                <button className="cycle-btn" onClick={() => setCycleModal(true)}>🔁 Следующий цикл</button>
              )}
            </div>
          )}
            </>
          )}

          {tab === 'settings' && (
            <SettingsPanel
              theme={theme}
              themes={themes}
              wallpaper={wallpaper}
              wallpaperOpacity={wallpaperOpacity}
              fileInputRef={fileInputRef}
              wallpaperRef={wallpaperRef}
              onSetTheme={setTheme}
              onSetWallpaperOpacity={setWallpaperOpacity}
              onRemoveWallpaper={removeWallpaper}
              onWallpaperUpload={handleWallpaperUpload}
              onExportData={exportData}
              onImportData={importData}
              onOpenResetModal={() => setResetModal(true)}
            />
          )}
        </main>

        {showFinishAnim && (
          <div className="finish-overlay">
            <div className="finish-anim-wrap">
              <div className="finish-circle-green">
                <span className="finish-check-mark">✓</span>
              </div>
            </div>
          </div>
        )}

        <Modals
          days={days}
          editDayModal={editDayModal}
          addExModal={addExModal}
          cycleModal={cycleModal}
          deleteModal={deleteModal}
          resetModal={resetModal}
          newEx={newEx}
          onCloseEditDay={() => setEditDayModal(null)}
          onSaveEditDay={saveEditDayModal}
          onEditDayValue={(value) => setEditDayModal((m) => (m ? { ...m, value } : m))}
          onCloseAddEx={() => setAddExModal(false)}
          onAddExercise={addExercise}
          onSetNewEx={setNewEx}
          onAdjustNewEx={adjustNewEx}
          onParseNewExField={parseNewExField}
          onCloseCycle={() => setCycleModal(false)}
          onStartNextCycle={startNextCycle}
          onCloseDelete={() => setDeleteModal(null)}
          onConfirmDelete={removeExercise}
          onCloseReset={() => setResetModal(false)}
          onResetAll={resetAll}
        />
      </div>
    </>
  )
}