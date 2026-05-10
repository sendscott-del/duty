'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PinLogin } from '@/components/PinLogin'

type Status = 'resolving' | 'ready' | 'not_found' | 'error'

export default function FamilySlugPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''

  const [status, setStatus] = useState<Status>('resolving')
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [familyName, setFamilyName] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
        return
      }

      const { data, error } = await supabase.functions.invoke('family-by-slug', {
        body: { slug },
      })

      if (cancelled) return

      if (error || !data?.family_id) {
        const code = (data as { error?: string } | null)?.error
        setStatus(code === 'not_found' ? 'not_found' : 'error')
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('duty_family_id', data.family_id)
      }

      // If we resolved via alias, send the kid to the canonical URL so any
      // future Add-to-Home-Screen captures the up-to-date slug.
      const canonical = (data as { slug?: string }).slug
      if (canonical && canonical !== slug) {
        router.replace(`/f/${canonical}`)
        return
      }

      setFamilyId(data.family_id)
      setFamilyName(data.name ?? '')
      setStatus('ready')
    }

    resolve()
    return () => { cancelled = true }
  }, [slug, router])

  if (status === 'resolving') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-[#f8f9fa]">
        <div className="w-full max-w-sm text-center space-y-4">
          <img src="/logo.png" alt="Duty" className="h-20 w-20 mx-auto rounded-3xl shadow-lg" />
          <h1 className="text-xl font-bold text-gray-900">Family not found</h1>
          <p className="text-sm text-gray-500">
            We couldn&apos;t find a family with the link <code className="text-gray-700">/f/{slug}</code>. Double-check the URL.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-orange-500 font-medium hover:underline"
          >
            Go to email login
          </button>
        </div>
      </div>
    )
  }

  if (status === 'error' || !familyId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-[#f8f9fa]">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
          <p className="text-sm text-gray-500">Try again in a moment.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-orange-500 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[#f8f9fa]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Duty" className="h-24 w-24 mx-auto mb-4 rounded-3xl shadow-lg" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {familyName || 'Welcome'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Tap your face to sign in</p>
        </div>

        <PinLogin
          familyId={familyId}
          onSignedIn={() => router.push('/')}
          onSwitchToEmail={() => router.push('/login')}
        />
      </div>
    </div>
  )
}
