import { useEffect } from 'react'
import { ThemeName, THEMES } from '../utils/constants'
import { useLocalStorage } from './useLocalStorage'

export function useTheme(defaultTheme: ThemeName = 'neon') {
  const [theme, setTheme] = useLocalStorage<ThemeName>('workout_theme', defaultTheme)

  useEffect(() => {
    const t = THEMES[theme]
    if (!t) {
      setTheme(defaultTheme)
      return
    }
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
  }, [defaultTheme, setTheme, theme])

  return { theme, setTheme, themes: THEMES }
}
