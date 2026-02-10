'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/projects'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Ambient background */}
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
          <div className="py-3 text-sm font-medium text-zinc-100 text-center border-b border-zinc-800 relative">
            Set New Password
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-sky-500 rounded-full" />
          </div>

          <div className="p-6">
            {success ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-[13px] text-emerald-400">
                  Password updated successfully. Redirecting...
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-zinc-400 mb-4">
                  Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 pr-10 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                        placeholder="Min. 6 characters"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all"
                      placeholder="Re-enter password"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-400">
                      {error}
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
                        Update Password
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-6">
          Music supervision workflow management
        </p>
      </div>
    </div>
  )
}
