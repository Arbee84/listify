'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListItemInput } from '@/components/lists/list-item-input'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface Category {
  id: number
  categoryName: string
  _count: { lists: number }
}

interface Subcategory {
  id: number
  subcategoryName: string
  popular: boolean
  _count: { lists: number }
}

export default function CreateListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [visibilityId, setVisibilityId] = useState<string>('1')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // List items state
  const [items, setItems] = useState<string[]>(['', '', '', '', ''])

  // Load categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data)

        // Pre-select category from URL params
        const categoryParam = searchParams.get('category')
        if (categoryParam) {
          setSelectedCategory(categoryParam)
        }
      })
      .catch(error => console.error('Error fetching categories:', error))
  }, [searchParams])

  // Load subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([])
      return
    }

    setIsLoading(true)
    fetch(`/api/categories/${selectedCategory}/subcategories`)
      .then(res => res.json())
      .then(data => {
        setSubcategories(data)

        // Pre-select subcategory from URL params
        const subcategoryParam = searchParams.get('subcategory')
        if (subcategoryParam) {
          setSelectedSubcategory(subcategoryParam)
        }
      })
      .catch(error => console.error('Error fetching subcategories:', error))
      .finally(() => setIsLoading(false))
  }, [selectedCategory, searchParams])

  // Load existing list when category and subcategory are selected
  useEffect(() => {
    if (!selectedCategory || !selectedSubcategory) {
      return
    }

    fetch(`/api/lists?category_id=${selectedCategory}&subcategory_id=${selectedSubcategory}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.listItems) {
          // Populate items from existing list
          const existingItems = data.listItems.map((li: any) => {
            // Capitalize first letter of each word
            return li.item.itemName
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          })
          setItems(existingItems)
          setVisibilityId(data.visibilityId.toString())
        } else {
          // Reset items if no existing list
          setItems(['', '', '', '', ''])
        }
      })
      .catch(error => console.error('Error fetching list:', error))
  }, [selectedCategory, selectedSubcategory])

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
  }

  const handleItemClear = (index: number) => {
    const newItems = [...items]
    newItems[index] = ''
    setItems(newItems)
  }

  const handleSave = async () => {
    // Validation
    if (!selectedCategory || !selectedSubcategory) {
      toast.error('Please select a category and subcategory')
      return
    }

    const filledItems = items.filter(item => item.trim() !== '')
    if (filledItems.length !== 5) {
      toast.error('Please fill in all 5 items')
      return
    }

    // Check for duplicates (case-insensitive)
    const lowerItems = filledItems.map(item => item.toLowerCase())
    if (new Set(lowerItems).size !== lowerItems.length) {
      toast.error('Duplicate items are not allowed')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: parseInt(selectedCategory),
          subcategoryId: parseInt(selectedSubcategory),
          visibilityId: parseInt(visibilityId),
          items: filledItems.map((itemName, index) => ({
            itemName,
            rank: index + 1,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to save list')
        return
      }

      toast.success('List saved successfully!')
      router.push('/saved-lists')
    } catch (error) {
      console.error('Error saving list:', error)
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Your Top 5 List</h1>
        <p className="text-muted-foreground mt-2">
          Build your personalized list and get recommendations from others with similar tastes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Category</CardTitle>
          <CardDescription>
            Choose what type of list you want to create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.categoryName}
                      {cat._count.lists > 0 && ` (${cat._count.lists})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={selectedSubcategory}
                onValueChange={setSelectedSubcategory}
                disabled={!selectedCategory || isLoading}
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(subcat => (
                    <SelectItem key={subcat.id} value={subcat.id.toString()}>
                      {subcat.subcategoryName}
                      {subcat.popular && ' ⭐'}
                      {subcat._count.lists > 0 && ` (${subcat._count.lists})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">List Visibility</Label>
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
          </div>
        </CardContent>
      </Card>

      {selectedCategory && selectedSubcategory && (
        <Card>
          <CardHeader>
            <CardTitle>Your Top 5</CardTitle>
            <CardDescription>
              Enter your favorite items (min. 3 characters for suggestions)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <ListItemInput
                key={index}
                rank={index + 1}
                value={item}
                onChange={(value) => handleItemChange(index, value)}
                onClear={() => handleItemClear(index)}
                categoryId={selectedCategory ? parseInt(selectedCategory) : null}
                existingItems={items.filter((_, i) => i !== index)}
                disabled={isSaving}
              />
            ))}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || items.every(i => !i.trim())}
                className="flex-1"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save List
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setItems(['', '', '', '', ''])}
                disabled={isSaving}
                size="lg"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
