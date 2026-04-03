'use client'

import { AppShell } from '@/components/AppShell'
import { APP_VERSION, CHANGELOG } from '@/constants/changelog'

export default function ReleaseNotesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Release Notes</h2>
          <p className="text-sm text-gray-500 mt-1">Current version: {APP_VERSION}</p>
        </div>

        <div className="space-y-6">
          {CHANGELOG.map(entry => (
            <div key={entry.version} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-orange-500">v{entry.version}</span>
                <span className="text-xs text-gray-400">{entry.date}</span>
              </div>

              {entry.enhancements.length > 0 && (
                <div className="mb-3">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">What&apos;s New</div>
                  <ul className="space-y-1.5">
                    {entry.enhancements.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.bugFixes && entry.bugFixes.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Bug Fixes</div>
                  <ul className="space-y-1.5">
                    {entry.bugFixes.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">~</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
