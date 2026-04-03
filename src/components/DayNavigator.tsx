'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'

interface DayNavigatorProps {
  date: Date
  onDateChange: (date: Date) => void
}

export function DayNavigator({ date, onDateChange }: DayNavigatorProps) {
  const today = isToday(date)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onDateChange(subDays(date, 1))}
        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => today ? null : onDateChange(new Date())}
        className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
          today ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {today ? 'Today' : format(date, 'EEE, MMM d')}
      </button>
      <button
        onClick={() => onDateChange(addDays(date, 1))}
        disabled={today}
        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
