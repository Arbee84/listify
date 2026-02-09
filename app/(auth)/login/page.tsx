'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Login failed')
        return
      }

      toast.success('Login successful!')
      setTimeout(() => {
        window.location.href = '/home'
      }, 500)
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card small">
        <div className="auth-header">
          <h1>Welcome to Listify</h1>
          <p>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <Link href="/forgot-password" className="auth-link" style={{ fontSize: '0.875rem', display: 'block' }}>
              Forgot password?
            </Link>
          </div>

          <div className="auth-footer">
            <button type="submit" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
            <p className="auth-footer-text">
              Don't have an account? <Link href="/register" className="auth-link">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
