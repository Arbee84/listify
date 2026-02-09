'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Save, Trash2, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

interface Country {
  id: number
  name: string
}

interface Account {
  id: number
  email: string
  username: string
  dateOfBirth: string
  sex: string
  countryId: number
  darkMode: boolean
  visibilityId: number
  _count: { lists: number }
}

export default function AccountPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [account, setAccount] = useState<Account | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [username, setUsername] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState({ day: '', month: '', year: '' })
  const [sex, setSex] = useState('')
  const [countryId, setCountryId] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [visibilityId, setVisibilityId] = useState('1')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Fetch account data
    fetch('/api/account')
      .then(res => res.json())
      .then(data => {
        setAccount(data)
        setUsername(data.username)

        const dob = new Date(data.dateOfBirth)
        setDateOfBirth({
          day: dob.getDate().toString(),
          month: (dob.getMonth() + 1).toString(),
          year: dob.getFullYear().toString(),
        })

        setSex(data.sex)
        setCountryId(data.countryId.toString())
        setDarkMode(data.darkMode)
        setVisibilityId(data.visibilityId.toString())
      })
      .catch(error => console.error('Error fetching account:', error))
      .finally(() => setIsLoading(false))

    // Fetch countries
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(error => console.error('Error fetching countries:', error))
  }, [])

  const handleDarkModeToggle = async (checked: boolean) => {
    setDarkMode(checked)
    setTheme(checked ? 'dark' : 'light')

    // Save to database immediately
    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ darkMode: checked }),
      })

      if (!response.ok) {
        throw new Error('Failed to update dark mode')
      }

      toast.success(`Dark mode ${checked ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error updating dark mode:', error)
      toast.error('Failed to update dark mode')
      // Revert on error
      setDarkMode(!checked)
      setTheme(!checked ? 'dark' : 'light')
    }
  }

  const handleSave = async () => {
    // Validation
    if (!username.trim()) {
      toast.error('Username is required')
      return
    }

    if (!dateOfBirth.day || !dateOfBirth.month || !dateOfBirth.year) {
      toast.error('Please enter a valid date of birth')
      return
    }

    setIsSaving(true)

    try {
      const dob = new Date(`${dateOfBirth.year}-${dateOfBirth.month.padStart(2, '0')}-${dateOfBirth.day.padStart(2, '0')}`)

      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          dateOfBirth: dob.toISOString(),
          sex,
          countryId: parseInt(countryId),
          visibilityId: parseInt(visibilityId),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to update account')
        return
      }

      toast.success('Account updated successfully!')

      // Refresh account data
      const accountRes = await fetch('/api/account')
      const accountData = await accountRes.json()
      setAccount(accountData)
    } catch (error) {
      console.error('Error updating account:', error)
      toast.error('An error occurred while updating')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      toast.success('Account deleted successfully')
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
      setIsDeleting(false)
    }
  }

  // Generate arrays for date dropdowns
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and preferences
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            {account?._count.lists} saved list{account?._count.lists !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Read-only)</Label>
            <Input
              id="email"
              value={account?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={dateOfBirth.day} onValueChange={(v) => setDateOfBirth({ ...dateOfBirth, day: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map(d => (
                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateOfBirth.month} onValueChange={(v) => setDateOfBirth({ ...dateOfBirth, month: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateOfBirth.year} onValueChange={(v) => setDateOfBirth({ ...dateOfBirth, year: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger id="sex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Not Selected">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={countryId} onValueChange={setCountryId}>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle dark mode theme
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Default List Visibility</Label>
            <Select value={visibilityId} onValueChange={setVisibilityId}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Anonymous</SelectItem>
                <SelectItem value="2">Friends Only</SelectItem>
                <SelectItem value="3">Public</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              New lists will use this visibility by default
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This will permanently delete all your lists and data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
