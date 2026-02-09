'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface Country {
  id: number
  name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [sex, setSex] = useState('')
  const [countryId, setCountryId] = useState('')
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch((error) => console.error('Error fetching countries:', error))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dateOfBirth = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          dateOfBirth: dateOfBirth.toISOString(),
          sex,
          countryId: parseInt(countryId),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }

      toast.success('Account created successfully!')
      setTimeout(() => {
        window.location.href = '/home'
      }, 500)
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create an Account</h1>
          <p>Join Listify and start discovering your next favorites</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-body">
            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
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
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Must contain uppercase, lowercase, number, and special character"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                  At least 6 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <div className="form-row three-col">
                  <select value={day} onChange={(e) => setDay(e.target.value)} disabled={isLoading} required>
                    <option value="">Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select value={month} onChange={(e) => setMonth(e.target.value)} disabled={isLoading} required>
                    <option value="">Month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <select value={year} onChange={(e) => setYear(e.target.value)} disabled={isLoading} required>
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="sex">Sex *</label>
                <select id="sex" value={sex} onChange={(e) => setSex(e.target.value)} disabled={isLoading} required>
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Not Selected">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <select id="country" value={countryId} onChange={(e) => setCountryId(e.target.value)} disabled={isLoading} required>
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="auth-footer">
            <button type="submit" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
            <p className="auth-footer-text">
              Already have an account? <Link href="/login" className="auth-link">Log in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
