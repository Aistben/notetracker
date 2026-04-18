import type { ChangeEvent, RefObject } from 'react'
import { ThemeName } from '../utils/constants'
import './SettingsPanel.css'

interface ThemeEntry {
  name: string
  surface: string
  border: string
  text: string
  primary: string
}

interface SettingsPanelProps {
  theme: ThemeName
  themes: Record<ThemeName, ThemeEntry>
  wallpaper: string | null
  wallpaperOpacity: number
  fileInputRef: RefObject<HTMLInputElement>
  wallpaperRef: RefObject<HTMLInputElement>
  onSetTheme: (theme: ThemeName) => void
  onSetWallpaperOpacity: (value: number) => void
  onRemoveWallpaper: () => void
  onWallpaperUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onExportData: () => void
  onImportData: (e: ChangeEvent<HTMLInputElement>) => void
  onOpenResetModal: () => void
  onBack: () => void
}

export default function SettingsPanel({
  theme,
  themes,
  wallpaper,
  wallpaperOpacity,
  fileInputRef,
  wallpaperRef,
  onSetTheme,
  onSetWallpaperOpacity,
  onRemoveWallpaper,
  onWallpaperUpload,
  onExportData,
  onImportData,
  onOpenResetModal,
  onBack
}: SettingsPanelProps) {
  return (
    <div className="settings">
      <button className="back-btn" onClick={onBack}>
        ← Назад
      </button>
      <div className="settings-section">
        <h3>🎨 Тема оформления</h3>
        <div className="theme-grid">
          {(Object.keys(themes) as ThemeName[]).map((tKey) => (
            <button
              key={tKey}
              className={`theme-btn ${theme === tKey ? 'active' : ''}`}
              style={{
                background: themes[tKey].surface,
                borderColor: theme === tKey ? themes[tKey].primary : themes[tKey].border,
                color: themes[tKey].text
              }}
              onClick={() => onSetTheme(tKey)}
            >
              <span className="theme-dot" style={{ background: themes[tKey].primary }} />
              {themes[tKey].name}
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
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={wallpaperOpacity}
              onChange={(e) => onSetWallpaperOpacity(parseFloat(e.target.value))}
              className="wp-slider"
            />
          </div>
        )}
        <div className="settings-btns">
          <button className="settings-action-btn" onClick={() => wallpaperRef.current?.click()}>
            📷 {wallpaper ? 'Сменить обои' : 'Загрузить обои'}
          </button>
          {wallpaper && (
            <button className="settings-action-btn danger" onClick={onRemoveWallpaper}>
              🗑️ Убрать обои
            </button>
          )}
          <input ref={wallpaperRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onWallpaperUpload} />
        </div>
      </div>

      <div className="settings-section">
        <h3>💾 Данные</h3>
        <div className="settings-btns">
          <button className="settings-action-btn" onClick={onExportData}>📤 Экспорт (JSON)</button>
          <button className="settings-action-btn" onClick={() => fileInputRef.current?.click()}>📥 Импорт (JSON)</button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={onImportData} />
          <button className="settings-action-btn danger" onClick={onOpenResetModal}>🗑️ Сброс всех данных</button>
        </div>
      </div>
    </div>
  )
}
