import { Exercise, ExerciseType, HistoryEntry, Intensity } from '../utils/constants'
import { intensityBg, intensityColor } from '../utils/helpers'
import './ExerciseCard.css'

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
          <span className="ex-action-btn move">⇅</span>
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
              <select
                className="ex-edit-select"
                value={editForm.type}
                onChange={(e) => onEditFormChange({ type: e.target.value as ExerciseType })}
              >
                <option value="основа">основа</option>
                <option value="подсобка">подсобка</option>
              </select>
            </div>
            <div className="ex-edit-field half">
              <label className="ex-edit-label">Интенсивность</label>
              <select
                className="ex-edit-select"
                value={editForm.intensity}
                onChange={(e) => onEditFormChange({ intensity: e.target.value as Intensity })}
              >
                <option value="тяжёлая">тяжёлая</option>
                <option value="средняя">средняя</option>
                <option value="лёгкая">лёгкая</option>
              </select>
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
