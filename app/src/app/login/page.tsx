'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Eye, EyeOff, ChevronDown, ArrowRight } from 'lucide-react'

const ROLE_OPTIONS = [
  'Managing Director',
  'Account Manager',
  'Senior Music Supervisor',
  'Music Supervisor',
  'Junior Music Supervisor',
  'Project Manager',
  'Business Affairs',
  'Music Coordinator',
] as const

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<string>('Music Supervisor')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for OAuth callback errors
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'auth_callback_failed') {
      setError('Google sign-in failed. Please try again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setSuccessMessage('Check your email for a password reset link.')
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password, name, role)
        if (error) {
          setError(error.message)
        } else {
          setSuccessMessage('Check your email to confirm your account, then sign in.')
          setIsSignUp(false)
          setPassword('')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          router.push('/projects')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Ambient background — subtle grid + glow */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px] px-6">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white text-sm font-bold tracking-tight">
            TF
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100 leading-none tracking-tight">
              Project Builder
            </h1>
            <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">
              Tracks & Fields
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          {/* Tab toggle */}
          <div className="flex border-b border-zinc-800">
            {isForgotPassword ? (
              <div className="flex-1 py-3 text-sm font-medium text-zinc-100 text-center relative">
                Reset Password
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-sky-500 rounded-full" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setIsSignUp(false); setError(null); setSuccessMessage(null) }}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                    !isSignUp
                      ? 'text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  Sign In
                  {!isSignUp && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-sky-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => { setIsSignUp(true); setError(null); setSuccessMessage(null) }}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                    isSignUp
                      ? 'text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  Create Account
                  {isSignUp && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-sky-500 rounded-full" />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="p-6">
            {!isForgotPassword && (
              <>
                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600 transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-zinc-900/80 px-3 text-[11px] text-zinc-500 uppercase tracking-widest">
                      or
                    </span>
                  </div>
                </div>
              </>
            )}

            {isForgotPassword && (
              <p className="text-sm text-zinc-400 mb-4">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && !isForgotPassword && (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 pr-9 text-sm text-zinc-100 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                  placeholder="you@tracksandfields.com"
                />
              </div>

              {/* Password (hidden in forgot password mode) */}
              {!isForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-zinc-400">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setError(null); setSuccessMessage(null) }}
                        className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 pr-10 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                      placeholder={isSignUp ? 'Min. 6 characters' : 'Enter password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-400">
                  {error}
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-[13px] text-emerald-400">
                  {successMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    {isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {/* Back to sign in (from forgot password) */}
              {isForgotPassword && (
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMessage(null) }}
                  className="flex w-full items-center justify-center text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  Back to Sign In
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-zinc-600 mt-6">
          Music supervision workflow management
        </p>
      </div>
    </div>
  )
}
