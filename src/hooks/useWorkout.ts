import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DayConfig, HistoryEntry } from '../utils/constants'
import { uid, formatDate } from '../utils/helpers'

export function useWorkout(days: DayConfig[], setDays: (fn: (d: DayConfig[]) => DayConfig[]) => void, setHistory: (fn: (h: HistoryEntry[]) => HistoryEntry[]) => void) {
  const [history, setHistoryState] = useLocalStorage<HistoryEntry[]>('workout_history', [])
  const [completed, setCompleted] = useLocalStorage<string[]>('workout_completed', [])

  const todayStr = new Date().toLocaleDateString('ru-RU')

  // Сброс completed при первой загрузке
  useEffect(() => {
    setCompleted([])
  }, [])

  // Также сброс при измении дней
  useEffect(() => {
    if (Array.isArray(days) && days.length > 0) {
      setCompleted([])
    }
  }, [days])

  const isDayCompleted = useCallback((dayKey: string) => {
    return Array.isArray(completed) && completed.includes(dayKey)
  }, [completed])

  const getNextUncompletedDayIdx = useCallback((fromIdx: number) => {
    if (!Array.isArray(days) || days.length === 0) return 0
    for (let step = 1; step <= days.length; step++) {
      const idx = (fromIdx + step) % days.length
      if (!isDayCompleted(days[idx].key)) return idx
    }
    return fromIdx
  }, [days, isDayCompleted])

  const allDaysCompleted = Array.isArray(days) && days.every(d => isDayCompleted(d.key))

  const finishWorkout = useCallback((activeDay: number) => {
    const day = days[activeDay]
    if (!day) return false

    const hasData = day.exercises.some(ex => ex.weight > 0 || ex.sets > 0 || ex.reps > 0)
    if (!hasData) return false

    const newHistory: HistoryEntry[] = day.exercises.map(ex => ({
      id: uid(),
      date: todayStr,
      exerciseName: ex.name,
      dayKey: day.key,
      weight: ex.weight,
      sets: ex.sets,
      reps: ex.reps,
      note: ex.note
    }))

    setHistoryState(h => [...(Array.isArray(h) ? h : []), ...newHistory])

    setCompleted(prev => {
      if (Array.isArray(prev) && prev.includes(day.key)) return prev
      return [...(Array.isArray(prev) ? prev : []), day.key]
    })

    setDays(d => d.map((dd, di) => di !== activeDay ? dd : {
      ...dd,
      exercises: dd.exercises.map(ex => ({ ...ex, showNote: false }))
    }))

    return true
  }, [days, setHistory, setCompleted, setDays, todayStr])

  const startNextCycle = useCallback(() => {
    setCompleted([])

    setDays(d => d.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => {
        const lastEntry = [...(Array.isArray(history) ? history : [])].reverse()
          .find(h => h.exerciseName === ex.name && h.dayKey === day.key)

        if (lastEntry) {
          return {
            ...ex,
            weight: lastEntry.weight,
            sets: lastEntry.sets,
            reps: lastEntry.reps,
            note: '',
            showNote: false,
            showHistory: false
          }
        }
        return { ...ex, weight: 0, sets: 3, reps: 10, note: '', showNote: false, showHistory: false }
      })
    })))
  }, [history, setCompleted, setDays])

  const removeHistoryEntry = useCallback((id: string) => {
    setHistoryState(h => Array.isArray(h) ? h.filter(e => e.id !== id) : [])
  }, [setHistoryState])

  return {
    history: setHistoryState,
    setHistory: setHistoryState,
    completed,
    setCompleted,
    isDayCompleted,
    allDaysCompleted,
    getNextUncompletedDayIdx,
    finishWorkout,
    startNextCycle,
    removeHistoryEntry
  }
}
