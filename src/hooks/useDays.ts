import { useCallback } from 'react'
import { DayConfig, Exercise, ExerciseType, Intensity } from '../utils/constants'
import { uid, makeExercise } from '../utils/helpers'

export interface NewExerciseForm {
  name: string
  type: ExerciseType | null
  intensity: Intensity | null
  weight: number
  sets: number
  reps: number
}

export function useDays(
  days: DayConfig[],
  setDays: (fn: (d: DayConfig[]) => DayConfig[]) => void
) {
  const updateExercise = useCallback((dayIdx: number, exIdx: number, patch: Partial<Exercise>) => {
    setDays(d => d.map((day, di) => di !== dayIdx ? day : {
      ...day,
      exercises: day.exercises.map((ex, ei) => ei !== exIdx ? ex : { ...ex, ...patch })
    }))
  }, [setDays])

  const addExercise = useCallback((activeDay: number, form: NewExerciseForm) => {
    if (!form.name.trim()) return
    const ex = makeExercise(form.name.trim(), form.type || 'подсобка', form.intensity || 'средняя', form.weight, form.sets, form.reps)
    setDays(d => d.map((day, di) => di !== activeDay ? day : { ...day, exercises: [...day.exercises, ex] }))
  }, [setDays])

  const removeExercise = useCallback((dayIdx: number, exIdx: number) => {
    setDays(d => d.map((day, di) => di !== dayIdx ? day : {
      ...day,
      exercises: day.exercises.filter((_, ei) => ei !== exIdx)
    }))
  }, [setDays])

  const moveExercise = useCallback((activeDay: number, dragIdx: number, dropIdx: number) => {
    if (dragIdx === dropIdx) return
    setDays(d => d.map((day, di) => {
      if (di !== activeDay) return day
      const exs = [...day.exercises]
      const [moved] = exs.splice(dragIdx, 1)
      exs.splice(dropIdx, 0, moved)
      return { ...day, exercises: exs }
    }))
  }, [setDays])

  const startEditExercise = useCallback((dayIdx: number, exIdx: number) => {
    const ex = days[dayIdx]?.exercises[exIdx]
    if (!ex) return null
    return {
      dayIdx,
      exIdx,
      name: ex.name,
      type: ex.type,
      intensity: ex.intensity
    }
  }, [days])

  const saveEditExercise = useCallback((
    editingExercise: { dayIdx: number; exIdx: number } | null,
    editForm: { name: string; type: ExerciseType; intensity: Intensity }
  ) => {
    if (!editingExercise) return
    setDays(d => d.map((day, di) => di !== editingExercise.dayIdx ? day : {
      ...day,
      exercises: day.exercises.map((ex, ei) => ei !== editingExercise.exIdx ? ex : {
        ...ex,
        name: editForm.name,
        type: editForm.type,
        intensity: editForm.intensity
      })
    }))
  }, [setDays])

  const adjustValue = useCallback((
    dayIdx: number,
    exIdx: number,
    field: 'weight' | 'sets' | 'reps',
    delta: number
  ) => {
    setDays(d => d.map((day, di) => {
      if (di !== dayIdx) return day
      const ex = day.exercises[exIdx]
      const current = ex[field] || 0
      const newValue = current + delta

      const clamped = field === 'weight'
        ? Math.max(0, Math.min(500, newValue))
        : field === 'sets'
          ? Math.max(1, Math.min(100, newValue))
          : Math.max(1, Math.min(200, newValue))

      return {
        ...day,
        exercises: day.exercises.map((e, ei) => ei !== exIdx ? e : { ...e, [field]: clamped })
      }
    }))
  }, [setDays])

  const handleFieldInput = useCallback((
    dayIdx: number,
    exIdx: number,
    field: 'weight' | 'sets' | 'reps',
    raw: string
  ) => {
    const num = parseFloat(raw)
    const value = isNaN(num) ? 0 : num
    const clamped = field === 'weight'
      ? Math.max(0, Math.min(500, value))
      : field === 'sets'
        ? Math.max(1, Math.min(100, value))
        : Math.max(1, Math.min(200, value))

    setDays(d => d.map((day, di) => di !== dayIdx ? day : {
      ...day,
      exercises: day.exercises.map((ex, ei) => ei !== exIdx ? ex : { ...ex, [field]: clamped })
    }))
  }, [setDays])

  return {
    updateExercise,
    addExercise,
    removeExercise,
    moveExercise,
    startEditExercise,
    saveEditExercise,
    adjustValue,
    handleFieldInput
  }
}
