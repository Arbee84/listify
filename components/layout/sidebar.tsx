'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Home, Plus, Search, BookMarked, Users, History, User, LogOut, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/create', label: 'Create', icon: Plus },
    { href: '/find', label: 'Find', icon: Search },
    { href: '/saved-lists', label: 'Saved', icon: BookMarked },
    { href: '/friends', label: 'Friends', icon: Users },
    { href: '/history', label: 'History', icon: History },
  ]

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Logged out successfully')
        setTimeout(() => {
          window.location.href = '/login'
        }, 500)
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/home" className="sidebar-brand">
          Listify
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ width: '100%' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun style={{ width: '18px', height: '18px', display: 'inline', marginRight: '0.5rem' }} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon style={{ width: '18px', height: '18px', display: 'inline', marginRight: '0.5rem' }} />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="user-menu">
          <Link href="/account" style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '0.9rem' }}>Account</span>
            </div>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--destructive)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            fontSize: '0.9rem'
          }}
        >
          <LogOut style={{ width: '18px', height: '18px' }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
