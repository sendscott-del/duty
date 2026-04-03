'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { MemberManager } from '@/components/MemberManager'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'
import { useChoresData } from '@/lib/hooks/useChoresData'
import { APP_VERSION } from '@/constants/changelog'

export default function SettingsPage() {
  const { user, member, family, isParent } = useFamilyMember()
  const { members, refresh } = useChoresData(family?.id)

  if (!family || !member || !user) {
    return <AppShell><div className="text-gray-400 text-sm text-center py-8">Loading...</div></AppShell>
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Settings</h2>

        {/* Family info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm font-medium text-gray-700">Family</div>
          <div className="text-lg font-bold">{family.name}</div>
        </div>

        {/* Your profile */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Your Profile</div>
          <div className="text-lg">{member.avatar_emoji} {member.display_name}</div>
          <div className="text-xs text-gray-500 mt-1">{member.role}</div>
        </div>

        {/* Member management (parent only) */}
        {isParent && (
          <MemberManager
            familyId={family.id}
            members={members}
            onUpdated={refresh}
          />
        )}

        {/* Version */}
        <div className="text-center text-xs text-gray-400 pt-4">
          Duty v{APP_VERSION}
        </div>
      </div>
    </AppShell>
  )
}
