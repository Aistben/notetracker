import { DayConfig, Exercise, ExerciseType, Intensity, NewExerciseForm } from './constants'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const makeExercise = (
  name: string,
  type: ExerciseType,
  intensity: Intensity,
  weight = 0,
  sets = 3,
  reps = 10
): Exercise => ({
  id: uid(),
  name,
  type,
  intensity,
  weight,
  sets,
  reps,
  note: '',
  showNote: false,
  showHistory: false
})

export const DEFAULT_DAYS = (): DayConfig[] => [
  {
    id: uid(), key: 'mon', label: 'Понедельник', shortLabel: 'ПН', subtitle: 'брусья',
    exercises: [
      makeExercise('Брусья', 'основа', 'тяжёлая'),
      makeExercise('Подтягивания', 'основа', 'средняя'),
      makeExercise('Приседания', 'подсобка', 'лёгкая')
    ],
    editingName: false, tempSubtitle: 'брусья'
  },
  {
    id: uid(), key: 'wed', label: 'Среда', shortLabel: 'СР', subtitle: 'подтягивания',
    exercises: [
      makeExercise('Подтягивания', 'основа', 'тяжёлая'),
      makeExercise('Тяга нижнего блока', 'основа', 'средняя'),
      makeExercise('Молотки', 'подсобка', 'лёгкая')
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
      makeExercise('Брусья', 'подсобка', 'лёгкая', 0, 2, 12)
    ],
    editingName: false, tempSubtitle: 'присед'
  }
]

export const EMPTY_NEW_EX: NewExerciseForm = {
  name: '',
  type: 'подсобка',
  intensity: 'средняя',
  weight: 0,
  sets: 3,
  reps: 10
}

export const clampWeight = (v: number) => Math.max(0, Math.min(500, parseFloat(v.toFixed(2))))
export const clampSets = (v: number) => Math.max(0, Math.min(50, Math.round(v)))
export const clampReps = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

export const formatDate = (d: Date) =>
  d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const formatTime = (d: Date) =>
  d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const intensityColor = (i: Intensity) =>
  i === 'тяжёлая' ? '#e05555' : i === 'средняя' ? '#c8a840' : '#48a870'

export const intensityBg = (i: Intensity) =>
  i === 'тяжёлая' ? 'rgba(224,85,85,0.12)' : i === 'средняя' ? 'rgba(200,168,64,0.12)' : 'rgba(72,168,112,0.12)'
