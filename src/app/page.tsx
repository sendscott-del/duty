'use client'

import { AppShell } from '@/components/AppShell'
import { FamilyDashboard } from '@/components/FamilyDashboard'
import { KidDashboard } from '@/components/KidDashboard'
import { useFamilyMember } from '@/lib/hooks/useFamilyMember'

export default function HomePage() {
  const { member, isParent } = useFamilyMember()

  return (
    <AppShell>
      {isParent ? (
        <FamilyDashboard />
      ) : member ? (
        <KidDashboard memberId={member.id} />
      ) : null}
    </AppShell>
  )
}
