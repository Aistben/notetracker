import { Exercise, ExerciseType, HistoryEntry, Intensity, EXERCISE_TYPES, INTENSITY_LEVELS } from '../utils/constants'
import { intensityBg, intensityColor } from '../utils/helpers'
import './ExerciseCard.css'
import { useState, useEffect, memo } from 'react'

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

function ExerciseCard({
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
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (isEditing) {
      setEditName('')
    }
  }, [isEditing])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setEditName(newName)
    onEditFormChange({ name: newName })
  }

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
            <button className="ex-action-btn save" onClick={onSaveEdit}>✔️</button>
          ) : (
            <button className="ex-action-btn pencil" onClick={() => onStartEdit(activeDay, exIdx)}>✎</button>
          )}
          <button className="ex-action-btn add" onClick={onAddExercise} aria-label="Добавить упражнение">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button className="ex-action-btn del" onClick={() => onRequestDelete(activeDay, exIdx)}>✕</button>
        </div>
      </div>

      {isEditing && (
        <div className="ex-edit-form">
          <input
            className="ex-edit-input ex-edit-name"
            value={editName}
            maxLength={30}
            onChange={handleNameChange}
            placeholder={editForm.name}
          />
          <div className="ex-edit-badges">
            <div className="ex-edit-badge-group">
              {EXERCISE_TYPES.map(opt => (
                <button
                  key={opt.value}
                  className={`ex-badge-opt ${editForm.type === opt.value ? 'active' : ''}`}
                  style={editForm.type === opt.value ? { background: opt.bg, borderColor: opt.borderColor, color: opt.color } : undefined}
                  onClick={() => onEditFormChange({ type: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="ex-edit-badge-group">
              {INTENSITY_LEVELS.map(opt => (
                <button
                  key={opt.value}
                  className={`ex-badge-opt ${editForm.intensity === opt.value ? 'active' : ''}`}
                  style={editForm.intensity === opt.value ? { background: opt.bg, borderColor: opt.borderColor, color: opt.color } : undefined}
                  onClick={() => onEditFormChange({ intensity: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="ex-badges">
          <span
            className="badge"
            style={ex.type === 'основа'
              ? { color: '#e05555', background: 'rgba(224,85,85,0.10)', borderColor: 'rgba(224,85,85,0.30)' }
              : { color: '#8090a8', background: 'rgba(128,144,168,0.08)', borderColor: 'rgba(128,144,168,0.22)' }}
          >
            {ex.type || '?'}
          </span>
          <span
            className="badge"
            style={{ color: intensityColor(ex.intensity), background: intensityBg(ex.intensity), borderColor: `${intensityColor(ex.intensity)}44` }}
          >
            {ex.intensity || '?'}
          </span>
        </div>
      )}

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

export default memo(ExerciseCard)