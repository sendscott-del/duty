export const APP_VERSION = '0.2.3'

export interface ChangelogEntry {
  version: string
  date: string
  enhancements: string[]
  bugFixes?: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.3',
    date: '2026-04-03',
    enhancements: [
      'Chore suggestions — 50+ preset chores organized by room (Kitchen, Bathroom, Bedroom, etc.)',
      'Reward suggestions — 30+ preset rewards (Screen Time, Food, Activities, Privileges, Big Rewards)',
      'Multi-day weekly chores — pick specific days (Mon/Wed/Fri) instead of just one',
    ],
  },
  {
    version: '0.2.2',
    date: '2026-04-03',
    enhancements: [
      'Day navigation — browse past days to see chore completion history',
      'Profile switching now persists across pages (was resetting)',
      'Release notes page (Settings menu → Release Notes)',
      'Weekly challenges are now selectable — parents can pick from templates or change mid-week',
      'Expanded emoji picker for rewards with 60+ emojis in 5 categories',
    ],
    bugFixes: [
      'Profile switch no longer redirects to home page',
      'Active profile persists in localStorage across page navigation',
    ],
  },
  {
    version: '0.2.1',
    date: '2026-04-03',
    enhancements: [
      'Complete visual overhaul — Apple-quality design language',
      'Frosted glass header and tab bar with backdrop blur',
      'Properly cropped and optimized logo (no more squishing)',
      'Refined cards with subtle shadows and rounded corners',
      'Updated font stack (SF Pro / system fonts)',
      'Consistent input and button styling across all forms',
      'Smoother modal animations with backdrop blur',
      'Better spacing, typography, and color consistency',
    ],
  },
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
