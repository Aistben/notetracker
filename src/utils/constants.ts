export type ExerciseType = 'основа' | 'подсобка'
export type Intensity = 'тяжёлая' | 'средняя' | 'лёгкая'
export type ThemeName = 'neon' | 'moss' | 'sunset'
export type TabName = 'tracker' | 'settings'

export interface Exercise {
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

export interface DayConfig {
  id: string
  key: string
  label: string
  shortLabel: string
  subtitle: string
  exercises: Exercise[]
  editingName: boolean
  tempSubtitle: string
}

export interface HistoryEntry {
  id: string
  date: string
  exerciseName: string
  dayKey: string
  weight: number
  sets: number
  reps: number
  note: string
}

export interface NewExerciseForm {
  name: string
  type: ExerciseType | null
  intensity: Intensity | null
  weight: number
  sets: number
  reps: number
}

export interface ThemeConfig {
  name: string
  bg: string
  surface: string
  surfaceAlt: string
  primary: string
  primaryDark: string
  text: string
  textSec: string
  accent: string
  border: string
  cardBg: string
  inputBg: string
  shadow: string
}

export const EXERCISE_TYPES: { value: ExerciseType; label: string; color: string; bg: string; borderColor: string }[] = [
  { value: 'основа', label: 'основа', color: '#e05555', bg: 'rgba(224,85,85,0.10)', borderColor: 'rgba(224,85,85,0.30)' },
  { value: 'подсобка', label: 'подсобка', color: '#8090a8', bg: 'rgba(128,144,168,0.08)', borderColor: 'rgba(128,144,168,0.22)' }
]

export const INTENSITY_LEVELS: { value: Intensity; label: string; color: string; bg: string; borderColor: string }[] = [
  { value: 'тяжёлая', label: 'тяжёлая', color: '#e05555', bg: 'rgba(224,85,85,0.12)', borderColor: 'rgba(224,85,85,0.30)' },
  { value: 'средняя', label: 'средняя', color: '#c8a840', bg: 'rgba(200,168,64,0.12)', borderColor: 'rgba(200,168,64,0.30)' },
  { value: 'лёгкая', label: 'лёгкая', color: '#48a870', bg: 'rgba(72,168,112,0.12)', borderColor: 'rgba(72,168,112,0.30)' }
]

export const THEMES: Record<ThemeName, ThemeConfig> = {
  neon: {
    name: 'Неон', bg: '#0a0a0f', surface: '#12121a', surfaceAlt: '#1a1a2e',
    primary: '#00d4e8', primaryDark: '#0099aa', text: '#e8e8f0', textSec: '#7a7a9a',
    accent: '#cc005a', border: '#22223a', cardBg: '#14142a', inputBg: '#1c1c30',
    shadow: 'rgba(0,212,232,0.12)'
  },
  moss: {
    name: 'Космос', bg: '#0a0510', surface: '#120818', surfaceAlt: '#1a0f24',
    primary: '#a855f7', primaryDark: '#7c3aed', text: '#f3e8ff', textSec: '#9ca3af',
    accent: '#d8b4fe', border: '#2d1b4e', cardBg: '#1e1030', inputBg: '#241438',
    shadow: 'rgba(168,85,247,0.15)'
  },
  sunset: {
    name: 'Закат', bg: '#0b0608', surface: '#150d12', surfaceAlt: '#1f1218',
    primary: '#ff7a3c', primaryDark: '#e65f26', text: '#ffe9dc', textSec: '#c8a894',
    accent: '#ffb26b', border: '#3a2018', cardBg: '#1b1015', inputBg: '#27161d',
    shadow: 'rgba(255,122,60,0.22)'
  }
}
