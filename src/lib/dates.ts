import { format, getDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDisplay(date: Date): string {
  return format(date, 'EEE, MMM d')
}

export function getDayOfWeek(date: Date): number {
  return getDay(date)
}

export function getWeekDates(date: Date): string[] {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(date, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end }).map(d => formatDate(d))
}

export function isDueToday(frequency: string, dayOfWeek: number | null): boolean {
  if (frequency === 'daily') return true
  if (frequency === 'weekly' && dayOfWeek !== null) {
    return getDayOfWeek(new Date()) === dayOfWeek
  }
  // Weekly with no specific day = due any day this week
  return frequency === 'weekly'
}

export function completionKey(choreId: string, memberId: string, date: string): string {
  return `${choreId}_${memberId}_${date}`
}
