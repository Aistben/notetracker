import type { Dispatch, SetStateAction } from 'react'
import { useState, useEffect, useRef } from 'react'
import { DayConfig, NewExerciseForm, ExerciseType, Intensity } from '../utils/constants'
import { intensityBg, intensityColor } from '../utils/helpers'
import './Modals.css'

interface ModalsProps {
  days: DayConfig[]
  editDayModal: { dayIdx: number; value: string } | null
  addExModal: boolean
  cycleModal: boolean
  deleteModal: { dayIdx: number; exIdx: number } | null
  resetModal: boolean
  newEx: NewExerciseForm
  onCloseEditDay: () => void
  onSaveEditDay: () => void
  onEditDayValue: (value: string) => void
  onCloseAddEx: () => void
  onAddExercise: () => void
  onSetNewEx: Dispatch<SetStateAction<NewExerciseForm>>
  onAdjustNewEx: (field: 'weight' | 'sets' | 'reps', delta: number) => void
  onParseNewExField: (field: 'weight' | 'sets' | 'reps', raw: string) => number
  onCloseCycle: () => void
  onStartNextCycle: () => void
  onCloseDelete: () => void
  onConfirmDelete: (dayIdx: number, exIdx: number) => void
  onCloseReset: () => void
  onResetAll: () => void
}

export default function Modals({
  days,
  editDayModal,
  addExModal,
  cycleModal,
  deleteModal,
  resetModal,
  newEx,
  onCloseEditDay,
  onSaveEditDay,
  onEditDayValue,
  onCloseAddEx,
  onAddExercise,
  onSetNewEx,
  onAdjustNewEx,
  onParseNewExField,
  onCloseCycle,
  onStartNextCycle,
  onCloseDelete,
  onConfirmDelete,
  onCloseReset,
  onResetAll
}: ModalsProps) {
  return (
    <>
      {editDayModal && (
        <div className="modal-overlay" onClick={onCloseEditDay}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✎</div>
            <div className="modal-title">Введите название основного упражнения</div>
            <input
              className="modal-input"
              value={editDayModal.value}
              maxLength={20}
              autoFocus
              onChange={(e) => onEditDayValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSaveEditDay()}
              placeholder="Например: жим, тяга, присед..."
            />
            <div className="modal-char-count">{editDayModal.value.length} / 20</div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={onCloseEditDay}>Отмена</button>
              <button className="modal-btn primary-btn" onClick={onSaveEditDay}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {addExModal && (
        <div className="modal-overlay" onClick={onCloseAddEx}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">💪</div>
            <div className="modal-title">Введите название основного упражнения</div>
            <div className="modal-form">
              <div className="modal-field">
                <input
                  className="modal-input"
                  value={newEx.name}
                  maxLength={40}
                  autoFocus
                  onChange={(e) => onSetNewEx((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Название упражнения"
                />
              </div>
              <div className="ex-edit-badges">
                <div className="ex-edit-badge-group">
                  {(['основа', 'подсобка'] as ExerciseType[]).map(opt => {
                    const def = opt === 'основа' ? { color: '#e05555', bg: 'rgba(224,85,85,0.10)', borderColor: 'rgba(224,85,85,0.30)' } : { color: '#8090a8', bg: 'rgba(128,144,168,0.08)', borderColor: 'rgba(128,144,168,0.22)' }
                    return (
                      <button
                        key={opt}
                        className={`ex-badge-opt ${newEx.type === opt ? 'active' : ''}`}
                        style={newEx.type === opt ? { background: def.bg, borderColor: def.borderColor, color: def.color } : undefined}
                        onClick={() => onSetNewEx((f) => ({ ...f, type: opt }))}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                <div className="ex-edit-badge-group">
                  {(['тяжёлая', 'средняя', 'лёгкая'] as Intensity[]).map(opt => {
                    const def = opt === 'тяжёлая' ? { color: '#e05555', bg: 'rgba(224,85,85,0.12)', borderColor: 'rgba(224,85,85,0.30)' } :
                                opt === 'средняя' ? { color: '#c8a840', bg: 'rgba(200,168,64,0.12)', borderColor: 'rgba(200,168,64,0.30)' } :
                                { color: '#48a870', bg: 'rgba(72,168,112,0.12)', borderColor: 'rgba(72,168,112,0.30)' }
                    return (
                      <button
                        key={opt}
                        className={`ex-badge-opt ${newEx.intensity === opt ? 'active' : ''}`}
                        style={newEx.intensity === opt ? { background: def.bg, borderColor: def.borderColor, color: def.color } : undefined}
                        onClick={() => onSetNewEx((f) => ({ ...f, intensity: opt }))}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="modal-steppers">
                {(['weight', 'sets', 'reps'] as const).map((field) => (
                  <div key={field} className="modal-stepper-group">
                    <label className="modal-label">{field === 'weight' ? 'Вес кг' : field === 'sets' ? 'Подходы' : 'Повторы'}</label>
                    <div className="input-stepper">
                      <button className="stepper-btn" onClick={() => onAdjustNewEx(field, field === 'weight' ? -1.25 : -1)}>−</button>
                      <input
                        type="number"
                        className="stepper-input"
                        value={newEx[field] || ''}
                        placeholder="0"
                        onChange={(e) => onSetNewEx((f) => ({ ...f, [field]: onParseNewExField(field, e.target.value) }))}
                      />
                      <button className="stepper-btn" onClick={() => onAdjustNewEx(field, field === 'weight' ? 1.25 : 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-btns" style={{ marginTop: '16px' }}>
              <button className="modal-btn cancel" onClick={onCloseAddEx}>Отмена</button>
              <button className="modal-btn primary-btn" onClick={onAddExercise} disabled={!newEx.name.trim()} style={{ opacity: newEx.name.trim() ? 1 : 0.4 }}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {cycleModal && (
        <div className="modal-overlay" onClick={onCloseCycle}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🔁</div>
            <div className="modal-title">Следующий цикл?</div>
            <div className="modal-text">История сохранится. Заметки сбросятся — веса и подходы останутся.</div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={onCloseCycle}>Отмена</button>
              <button className="modal-btn cycle" onClick={onStartNextCycle}>Новый цикл</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={onCloseDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Удалить упражнение?</div>
            <div className="modal-text">«{days[deleteModal.dayIdx].exercises[deleteModal.exIdx]?.name}» будет удалено.</div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={onCloseDelete}>Отмена</button>
              <button className="modal-btn confirm" onClick={() => onConfirmDelete(deleteModal.dayIdx, deleteModal.exIdx)}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {resetModal && (
        <div className="modal-overlay" onClick={onCloseReset}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Сбросить все данные?</div>
            <div className="modal-text">Все тренировки, история и настройки будут удалены.</div>
            <div className="modal-btns">
              <button className="modal-btn cancel" onClick={onCloseReset}>Отмена</button>
              <button className="modal-btn confirm" onClick={onResetAll}>Сбросить</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
