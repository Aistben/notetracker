export type ExerciseType = 'основа' | 'подсобка'
export type Intensity = 'тяжёлая' | 'средняя' | 'лёгкая'
export type ThemeName = 'neon' | 'midnight' | 'ice' | 'deep' | 'steel' | 'moss' | 'wine' | 'smoke'
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
    name: 'Космос', bg: '#0a0510', surface: '#120818', surfaceAlt: '#1a0f24',
    primary: '#a855f7', primaryDark: '#7c3aed', text: '#f3e8ff', textSec: '#9ca3af',
    accent: '#d8b4fe', border: '#2d1b4e', cardBg: '#1e1030', inputBg: '#241438',
    shadow: 'rgba(168,85,247,0.15)'
  },
  wine: {
    name: 'Бирюзовый', bg: '#080c0e', surface: '#0f1416', surfaceAlt: '#151a1c',
    primary: '#08e8de', primaryDark: '#06b8af', text: '#e0f8f8', textSec: '#588088',
    accent: '#28f0e0', border: '#1a2428', cardBg: '#0e1416', inputBg: '#141a1c',
    shadow: 'rgba(8,232,222,0.12)'
  },
  smoke: {
    name: 'Индиго', bg: '#060810', surface: '#0e1018', surfaceAlt: '#141824',
    primary: '#6366f1', primaryDark: '#4f46e5', text: '#eff2ff', textSec: '#94a3b8',
    accent: '#818cf8', border: '#1a1c30', cardBg: '#171928', inputBg: '#1e2030',
    shadow: 'rgba(99,102,241,0.15)'
  },
}
