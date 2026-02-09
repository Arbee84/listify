'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MoreVertical, Edit, Trash2, Eye, ChevronDown, ChevronUp, Plus } from 'lucide-react'

interface ListItem {
  item: {
    itemName: string
  }
  listRank: number
}

interface List {
  id: number
  category: {
    categoryName: string
  }
  subcategory: {
    subcategoryName: string
  }
  visibilityId: number
  creationDate: string
  modDate: string
  listItems: ListItem[]
}

const visibilityLabels = {
  1: 'Anonymous',
  2: 'Friends Only',
  3: 'Public',
}

const visibilityColors = {
  1: 'bg-gray-500',
  2: 'bg-blue-500',
  3: 'bg-green-500',
}

const rankColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-purple-500',
]

export default function SavedListsPage() {
  const router = useRouter()
  const [lists, setLists] = useState<List[]>([])
  const [expandedList, setExpandedList] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listToDelete, setListToDelete] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/lists')
      const data = await response.json()
      setLists(data)
    } catch (error) {
      console.error('Error fetching lists:', error)
      toast.error('Failed to load lists')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (list: List) => {
    router.push(`/create?category=${list.category}&subcategory=${list.subcategory}`)
  }

  const handleDelete = async () => {
    if (!listToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/lists/${listToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete list')
      }

      toast.success('List deleted successfully')
      setLists(lists.filter(l => l.id !== listToDelete))
      setDeleteDialogOpen(false)
      setListToDelete(null)
    } catch (error) {
      console.error('Error deleting list:', error)
      toast.error('Failed to delete list')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleVisibilityChange = async (listId: number, newVisibilityId: number) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibilityId: newVisibilityId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update visibility')
      }

      toast.success('Visibility updated')
      fetchLists()
    } catch (error) {
      console.error('Error updating visibility:', error)
      toast.error('Failed to update visibility')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your lists...</p>
        </div>
      </div>
    )
  }

  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">No Lists Yet</h2>
          <p className="text-muted-foreground">Create your first Top 5 list to get started!</p>
        </div>
        <Link href="/create">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First List
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Lists</h1>
          <p className="text-muted-foreground mt-2">
            Manage your {lists.length} saved list{lists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New List
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lists.map((list) => (
          <Card key={list.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span>{list.category.categoryName}</span>
                    <Badge variant="outline">{list.subcategory.subcategoryName}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge className={`${visibilityColors[list.visibilityId as keyof typeof visibilityColors]} text-white`}>
                      <Eye className="mr-1 h-3 w-3" />
                      {visibilityLabels[list.visibilityId as keyof typeof visibilityLabels]}
                    </Badge>
                    <span className="text-xs">
                      Updated {new Date(list.modDate).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedList(expandedList === list.id ? null : list.id)}
                  >
                    {expandedList === list.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(list)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit List
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleVisibilityChange(list.id, 1)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Set Anonymous
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVisibilityChange(list.id, 2)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Set Friends Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVisibilityChange(list.id, 3)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Set Public
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setListToDelete(list.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete List
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {expandedList === list.id && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {list.listItems.map((item) => (
                    <div key={item.listRank} className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${rankColors[item.listRank - 1]} rounded flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm">{item.listRank}</span>
                      </div>
                      <span className="font-medium capitalize">{item.item.itemName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this list? This action cannot be undone.
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
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
