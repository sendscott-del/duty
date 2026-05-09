'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PinLogin } from '@/components/PinLogin'

const FAMILY_ID_KEY = 'duty_family_id'

export default function LoginPage() {
  const router = useRouter()
  const [knownFamilyId, setKnownFamilyId] = useState<string | null>(null)
  const [mode, setMode] = useState<'pin' | 'email'>('email')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem(FAMILY_ID_KEY) : null
    setKnownFamilyId(id)
    setMode(id ? 'pin' : 'email')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[#f8f9fa]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Duty" className="h-24 w-24 mx-auto mb-4 rounded-3xl shadow-lg" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {mode === 'pin' ? 'Welcome Back' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'pin'
              ? 'Tap your face to sign in'
              : isSignUp
              ? 'Start tracking chores with your family'
              : 'Sign in to continue'}
          </p>
        </div>

        {mode === 'pin' && knownFamilyId ? (
          <PinLogin
            familyId={knownFamilyId}
            onSignedIn={() => router.push('/')}
            onSwitchToEmail={() => setMode('email')}
          />
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-shadow placeholder:text-gray-400"
                  placeholder="At least 6 characters"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              {message && (
                <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-orange-500/20"
              >
                {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-8 space-y-2">
              <div>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
                  className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
              {knownFamilyId && (
                <button
                  onClick={() => setMode('pin')}
                  className="text-orange-500 font-medium hover:underline"
                >
                  Use PIN login
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
