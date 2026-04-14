import { DayConfig } from '../utils/constants'
import './DayTabs.css'

interface DayTabsProps {
  days: DayConfig[]
  activeDay: number
  isDayCompleted: (dayKey: string) => boolean
  onSelectDay: (index: number) => void
  onEditDay: (index: number) => void
}

export default function DayTabs({
  days,
  activeDay,
  isDayCompleted,
  onSelectDay,
  onEditDay
}: DayTabsProps) {
  return (
    <div className="day-tiles">
      {days.map((day, di) => {
        const isCompleted = isDayCompleted(day.key)
        return (
          <button
            key={day.id}
            className={`day-tile ${di === activeDay ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => onSelectDay(di)}
          >
            <button
              className="day-tile-pencil"
              onClick={(e) => {
                e.stopPropagation()
                onEditDay(di)
              }}
            >
              ✎
            </button>
            <div className="day-tile-top">
              <span className="day-tile-label">{day.shortLabel}</span>
              {isCompleted && <span className="day-tile-done">✕</span>}
            </div>
            <div className="day-tile-sub">
              <span className="day-sub-text">{day.subtitle}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}