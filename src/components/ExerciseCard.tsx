import { Exercise, ExerciseType, HistoryEntry, Intensity } from '../utils/constants'
import { intensityBg, intensityColor } from '../utils/helpers'
import './ExerciseCard.css'
import { useState, useEffect, useRef } from 'react'

interface BadgeSelectProps {
  value: string
  options: { value: string; label: string; color: string; bg: string; borderColor: string }[]
  onChange: (value: string) => void
}

function BadgeSelect({ value, options, onChange }: BadgeSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="ex-badge-select">
      <button className="ex-badge-selected" onClick={() => setOpen(!open)}>
        {selected?.label}
      </button>
      {open && (
        <div className="ex-badge-dropdown">
          {options.map(opt => (
            <button
              key={opt.value}
              className={`ex-badge-option ${value === opt.value ? 'active' : ''}`}
              style={{ color: opt.color, background: opt.bg, borderColor: opt.borderColor }}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ExerciseCardProps {
  ex: Exercise
  exIdx: number
  activeDay: number
  dragIdx: number | null
  isEditing: boolean
  editForm: { name: string; type: ExerciseType; intensity: Intensity }
  lastEntry?: HistoryEntry
  histEntries: HistoryEntry[]
  dayCompleted: boolean
  onDragStart: (idx: number) => void
  onDragEnd: () => void
  onDrop: (idx: number) => void
  onSaveEdit: () => void
  onStartEdit: (dayIdx: number, exIdx: number) => void
  onRequestDelete: (dayIdx: number, exIdx: number) => void
  onAddExercise: () => void
  onEditFormChange: (patch: Partial<{ name: string; type: ExerciseType; intensity: Intensity }>) => void
  onAdjustValue: (dayIdx: number, exIdx: number, field: 'weight' | 'sets' | 'reps', delta: number) => void
  onFieldInput: (dayIdx: number, exIdx: number, field: 'weight' | 'sets' | 'reps', raw: string) => void
  onUpdateExercise: (dayIdx: number, exIdx: number, patch: Partial<Exercise>) => void
  onRemoveHistoryEntry: (id: string) => void
}

export default function ExerciseCard({
  ex,
  exIdx,
  activeDay,
  dragIdx,
  isEditing,
  editForm,
  lastEntry,
  histEntries,
  dayCompleted,
  onDragStart,
  onDragEnd,
  onDrop,
  onSaveEdit,
  onStartEdit,
  onRequestDelete,
  onAddExercise,
  onEditFormChange,
  onAdjustValue,
  onFieldInput,
  onUpdateExercise,
  onRemoveHistoryEntry
}: ExerciseCardProps) {
  return (
    <div
      className={`exercise-card ${dragIdx === exIdx ? 'dragging' : ''}`}
      draggable
      onDragStart={() => onDragStart(exIdx)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(exIdx)}
    >
      <div className="ex-top-row">
        <span className="ex-name">{ex.name}</span>
        <div className="ex-actions">
          {isEditing ? (
            <button className="ex-action-btn save" onClick={onSaveEdit}>✅</button>
          ) : (
            <button className="ex-action-btn pencil" onClick={() => onStartEdit(activeDay, exIdx)}>✎</button>
          )}
          <button className="ex-action-btn add" onClick={onAddExercise}>+</button>
          <button className="ex-action-btn del" onClick={() => onRequestDelete(activeDay, exIdx)}>✕</button>
        </div>
      </div>

      {isEditing && (
        <div className="ex-edit-form">
          <div className="ex-edit-field">
            <label className="ex-edit-label">Название упражнения</label>
            <input
              className="ex-edit-input"
              value={editForm.name}
              maxLength={40}
              onChange={(e) => onEditFormChange({ name: e.target.value })}
              placeholder="Например: Жим лёжа"
            />
          </div>
          <div className="ex-edit-row2">
            <div className="ex-edit-field half">
              <label className="ex-edit-label">Приоритет</label>
              <BadgeSelect
                value={editForm.type}
                onChange={(val) => onEditFormChange({ type: val as ExerciseType })}
                options={[
                  { value: 'основа', label: 'основа', color: '#e05555', bg: 'rgba(224,85,85,0.10)', borderColor: 'rgba(224,85,85,0.30)' },
                  { value: 'подсобка', label: 'подсобка', color: '#8090a8', bg: 'rgba(128,144,168,0.08)', borderColor: 'rgba(128,144,168,0.22)' }
                ]}
              />
            </div>
            <div className="ex-edit-field half">
              <label className="ex-edit-label">Интенсивность</label>
              <BadgeSelect
                value={editForm.intensity}
                onChange={(val) => onEditFormChange({ intensity: val as Intensity })}
                options={[
                  { value: 'тяжёлая', label: 'тяжёлая', color: '#e05555', bg: 'rgba(224,85,85,0.12)', borderColor: 'rgba(224,85,85,0.30)' },
                  { value: 'средняя', label: 'средняя', color: '#c8a840', bg: 'rgba(200,168,64,0.12)', borderColor: 'rgba(200,168,64,0.30)' },
                  { value: 'лёгкая', label: 'лёгкая', color: '#48a870', bg: 'rgba(72,168,112,0.12)', borderColor: 'rgba(72,168,112,0.30)' }
                ]}
              />
            </div>
          </div>
        </div>
      )}

      <div className="ex-badges">
        <span
          className="badge"
          style={ex.type === 'основа'
            ? { color: '#e05555', background: 'rgba(224,85,85,0.10)', borderColor: 'rgba(224,85,85,0.30)' }
            : { color: '#8090a8', background: 'rgba(128,144,168,0.08)', borderColor: 'rgba(128,144,168,0.22)' }}
        >
          {ex.type}
        </span>
        <span
          className="badge"
          style={{ color: intensityColor(ex.intensity), background: intensityBg(ex.intensity), borderColor: `${intensityColor(ex.intensity)}44` }}
        >
          {ex.intensity}
        </span>
      </div>

      <div className="ex-inputs">
        {(['weight', 'sets', 'reps'] as const).map((field) => (
          <div key={field} className="input-group">
            <label className="input-label">{field === 'weight' ? 'Вес кг' : field === 'sets' ? 'Подходы' : 'Повторы'}</label>
            <div className="input-stepper">
              <button className="stepper-btn" onClick={() => onAdjustValue(activeDay, exIdx, field, field === 'weight' ? -1.25 : -1)}>−</button>
              <input
                type="number"
                className="stepper-input"
                value={ex[field] || ''}
                placeholder="0"
                onChange={(e) => onFieldInput(activeDay, exIdx, field, e.target.value)}
              />
              <button className="stepper-btn" onClick={() => onAdjustValue(activeDay, exIdx, field, field === 'weight' ? 1.25 : 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {lastEntry && (
        <div className="ex-last">
          Последний: {lastEntry.weight}кг × {lastEntry.sets}×{lastEntry.reps} ({lastEntry.date})
        </div>
      )}

      <div className="ex-toggles">
        <button className={`toggle-btn ${ex.showNote ? 'active' : ''}`} onClick={() => onUpdateExercise(activeDay, exIdx, { showNote: !ex.showNote })}>📝 Заметка</button>
        <button className={`toggle-btn ${ex.showHistory ? 'active' : ''}`} onClick={() => onUpdateExercise(activeDay, exIdx, { showHistory: !ex.showHistory })}>📊 История</button>
      </div>

      {ex.showNote && (
        <textarea
          className="ex-note"
          value={ex.note}
          rows={2}
          onChange={(e) => onUpdateExercise(activeDay, exIdx, { note: e.target.value })}
          placeholder="Комментарий к упражнению..."
        />
      )}
      {!ex.showNote && ex.note && dayCompleted && <div className="ex-note-saved">💬 {ex.note}</div>}

      {ex.showHistory && (
        <div className="ex-history">
          <div className="history-title">История: {ex.name}</div>
          {histEntries.length === 0 ? (
            <div className="history-empty">Нет записей</div>
          ) : (
            <div className="history-list">
              {histEntries.map((h) => (
                <div key={h.id} className="history-item">
                  <div className="history-info">
                    <span className="history-date">{h.date}</span>
                    <span className="history-data">{h.weight}кг × {h.sets}×{h.reps}</span>
                    {h.note && <span className="history-note">💬 {h.note}</span>}
                  </div>
                  <button className="history-del" onClick={() => onRemoveHistoryEntry(h.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
