import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogIn, UserPlus, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, Info, User } from 'lucide-react'

export default function Auth({ setActivePage }) {
  const { signIn, signUp, isMockAuth } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Fields
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Statuses
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    if (isSignUp && !displayName.trim()) {
      setError('Please enter a display name.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        // Sign Up
        const { data, error: signupErr } = await signUp(email, password, displayName)
        if (signupErr) {
          setError(signupErr.message)
        } else {
          setSuccess('Account created successfully! Welcome to the census.')
          setTimeout(() => {
            setActivePage('landing')
          }, 1500)
        }
      } else {
        // Sign In
        const { data, error: signinErr } = await signIn(email, password)
        if (signinErr) {
          setError(signinErr.message)
        } else {
          setSuccess('Signed in successfully! Redirecting...')
          setTimeout(() => {
            setActivePage('landing')
          }, 1500)
        }
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected authentication error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-offwhite-dark rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8">
        
        {/* Auth Toggle Tabs */}
        <div className="flex border-b border-offwhite-dark mb-6">
          <button
            onClick={() => {
              setIsSignUp(false)
              setError('')
              setSuccess('')
            }}
            className={`w-1/2 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              !isSignUp 
                ? 'border-forest text-forest' 
                : 'border-transparent text-charcoal/40 hover:text-charcoal/60'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
          
          <button
            onClick={() => {
              setIsSignUp(true)
              setError('')
              setSuccess('')
            }}
            className={`w-1/2 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isSignUp 
                ? 'border-forest text-forest' 
                : 'border-transparent text-charcoal/40 hover:text-charcoal/60'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Register</span>
          </button>
        </div>

        {/* Mock Mode Tip Banner */}
        {isMockAuth && (
          <div className="mb-6 p-3.5 bg-forest/5 border border-forest/15 rounded-2xl text-[11px] text-charcoal/80 leading-relaxed flex gap-2">
            <Info className="h-4 w-4 text-terracotta shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-forest block">Mock Auth Mode Active</span>
              <p className="mt-0.5">
                No keys configured. Sign in with:
                <br />
                <span className="font-mono text-terracotta font-semibold">admin@treecensus.org</span> / <span className="font-mono text-terracotta font-semibold">password123</span>
                <br />
                Or register a new account to test flows instantly.
              </p>
            </div>
          </div>
        )}

        {/* Message Feeds */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name (Only for Registration) */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
                Display Name / Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-charcoal/40">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Oak Guardian"
                  className="w-full bg-offwhite border border-offwhite-dark rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-charcoal/40">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-offwhite border border-offwhite-dark rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-forest uppercase tracking-wide mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-charcoal/40">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-offwhite border border-offwhite-dark rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-forest text-charcoal"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal/40 hover:text-charcoal/60"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest hover:bg-forest-light text-offwhite font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isSignUp ? <UserPlus className="h-4 w-4 text-terracotta" /> : <LogIn className="h-4 w-4 text-terracotta" />}
                <span>{isSignUp ? 'Register Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}

function CheckCircle({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide ${className}`}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
  )
}
