import { useState, useCallback, type ChangeEvent } from 'react'
import { useLocalStorage, getRawLocalStorage, setRawLocalStorage, removeLocalStorage } from './useLocalStorage'
import { DayConfig, HistoryEntry, ThemeName } from '../utils/constants'
import { useTheme } from './useTheme'

interface ImportData {
  workout_days?: DayConfig[]
  workout_history?: HistoryEntry[]
  workout_completed?: string[]
  workout_theme?: ThemeName
}

export function useImportExport(
  theme: ThemeName,
  setTheme: (t: ThemeName) => void,
  setDays: (fn: (d: DayConfig[]) => DayConfig[]) => void,
  setHistory: (fn: (h: HistoryEntry[]) => HistoryEntry[]) => void,
  setCompleted: (fn: (c: string[]) => string[]) => void
) {
  const [wallpaper, setWallpaper] = useState<string | null>(() => getRawLocalStorage('workout_wallpaper'))
  const [wallpaperOpacity, setWallpaperOpacity] = useLocalStorage<number>('workout_wp_opacity', 0.85)

  const todayStr = new Date().toLocaleDateString('ru-RU')

  const handleWallpaperUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const b64 = ev.target?.result as string
      setWallpaper(b64)
      setRawLocalStorage('workout_wallpaper', b64)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [setWallpaper])

  const removeWallpaper = useCallback(() => {
    setWallpaper(null)
    removeLocalStorage('workout_wallpaper')
  }, [setWallpaper])

  const exportData = useCallback(() => {
    const data = {
      workout_days: [],
      workout_history: [],
      workout_completed: [],
      workout_theme: theme
    }
    // Получаем актуальные данные из localStorage
    const storedDays = getRawLocalStorage('workout_days')
    const storedHistory = getRawLocalStorage('workout_history')
    const storedCompleted = getRawLocalStorage('workout_completed')

    if (storedDays) data.workout_days = JSON.parse(storedDays)
    if (storedHistory) data.workout_history = JSON.parse(storedHistory)
    if (storedCompleted) data.workout_completed = JSON.parse(storedCompleted)

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `workout_backup_${todayStr}.json`
    a.click()
  }, [theme, todayStr])

  const importData = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data: ImportData = JSON.parse(ev.target?.result as string)

        if (data.workout_days && Array.isArray(data.workout_days)) {
          setDays(() => data.workout_days!)
        }
        if (data.workout_history && Array.isArray(data.workout_history)) {
          setHistory(() => data.workout_history!)
        }
        if (data.workout_completed && Array.isArray(data.workout_completed)) {
          setCompleted(() => data.workout_completed!)
        }
        if (data.workout_theme && typeof data.workout_theme === 'string') {
          setTheme(data.workout_theme as ThemeName)
        }
      } catch (err) {
        alert('❌ Не удалось импортировать данные: неверный формат файла.\n' + (err instanceof Error ? err.message : 'Ошибка парсинга'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [setDays, setHistory, setCompleted, setTheme])

  return {
    wallpaper,
    wallpaperOpacity,
    setWallpaperOpacity,
    handleWallpaperUpload,
    removeWallpaper,
    exportData,
    importData
  }
}
