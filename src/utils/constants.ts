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
  type: ExerciseType
  intensity: Intensity
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
