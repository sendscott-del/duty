export const APP_VERSION = '0.1.0'

export interface ChangelogEntry {
  version: string
  date: string
  enhancements: string[]
  bugFixes?: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
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
