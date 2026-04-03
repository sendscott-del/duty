export const APP_VERSION = '0.2.0'

export interface ChangelogEntry {
  version: string
  date: string
  enhancements: string[]
  bugFixes?: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-04-03',
    enhancements: [
      'XP and leveling system — earn XP with every completed chore',
      'Streak tracking — complete all daily chores to build your streak',
      'Badge collection — 11 badges to earn across streak, milestone, and special categories',
      'Level-up celebrations with animated modal',
      'Badge unlock notifications',
      'Weekly family challenges with bonus points',
      'Level indicator and streak flame on kid dashboard',
      'Gamification stats on family dashboard per kid',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-04-02',
    enhancements: [
      'Initial release of Duty',
      'Family member accounts with parent/child roles',
      'Chore assignment with daily/weekly frequency',
      'Completion tracking: check-off, photo proof, parental approval',
      'Points and rewards system',
      'Family dashboard and individual kid views',
      'PIN login for younger kids',
    ],
  },
]
