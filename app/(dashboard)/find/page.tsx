'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListItemInput } from '@/components/lists/list-item-input'
import { toast } from 'sonner'
import { Loader2, Search, Trash2, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
  id: number
  categoryName: string
}

interface Subcategory {
  id: number
  subcategoryName: string
  popular: boolean
}

interface Recommendation {
  itemName: string
  points: number
}

interface SavedList {
  id: number
  category: { categoryName: string }
  subcategory: { subcategoryName: string; id: number }
  listItems: { item: { itemName: string }; listRank: number }[]
}

const rankColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-purple-500',
]

export default function FindRecommendationsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [items, setItems] = useState<string[]>(['', '', '', '', ''])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFinding, setIsFinding] = useState(false)
  const [showLoadList, setShowLoadList] = useState(false)

  useEffect(() => {
    // Load categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching categories:', error))

    // Load saved lists
    fetch('/api/lists')
      .then(res => res.json())
      .then(data => setSavedLists(data))
      .catch(error => console.error('Error fetching saved lists:', error))
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([])
      return
    }

    setIsLoading(true)
    fetch(`/api/categories/${selectedCategory}/subcategories`)
      .then(res => res.json())
      .then(data => setSubcategories(data))
      .catch(error => console.error('Error fetching subcategories:', error))
      .finally(() => setIsLoading(false))
  }, [selectedCategory])

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

  const handleLoadList = (listId: number) => {
    const list = savedLists.find(l => l.id === listId)
    if (!list) return

    // Set category and subcategory
    const category = categories.find(c => c.categoryName === list.category.categoryName)
    if (category) {
      setSelectedCategory(category.id.toString())
      // Wait for subcategories to load
      setTimeout(() => {
        setSelectedSubcategory(list.subcategory.id.toString())
      }, 100)
    }

    // Set items
    const loadedItems = list.listItems.map(li =>
      li.item.itemName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    setItems(loadedItems)
    setShowLoadList(false)
    toast.success('List loaded successfully')
  }

  const handleClearAll = () => {
    setItems(['', '', '', '', ''])
    setRecommendations([])
  }

  const handleFindRecommendations = async () => {
    // Validation
    if (!selectedSubcategory) {
      toast.error('Please select a subcategory')
      return
    }

    const filledItems = items.filter(item => item.trim() !== '')
    if (filledItems.length === 0) {
      toast.error('Please enter at least one item')
      return
    }

    setIsFinding(true)
    setRecommendations([])

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcategoryId: parseInt(selectedSubcategory),
          items: filledItems,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to find recommendations')
        return
      }

      if (data.length === 0) {
        toast.info('No recommendations found. Try different items or check back later!')
      } else {
        toast.success(`Found ${data.length} recommendations!`)
      }

      setRecommendations(data)
    } catch (error) {
      console.error('Error finding recommendations:', error)
      toast.error('An error occurred while finding recommendations')
    } finally {
      setIsFinding(false)
    }
  }

  const maxPoints = recommendations.length > 0 ? Math.max(...recommendations.map(r => r.points)) : 1

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Recommendations</h1>
        <p className="text-muted-foreground mt-2">
          Enter your preferences and discover what others with similar tastes recommend
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Category</CardTitle>
          <CardDescription>Choose what you're looking for recommendations on</CardDescription>
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCategory && selectedSubcategory && (
        <Card>
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
            <CardDescription>
              Enter up to 5 items you like (min. 3 characters for suggestions)
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
                disabled={isFinding}
              />
            ))}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleFindRecommendations}
                disabled={isFinding || items.every(i => !i.trim())}
                className="flex-1"
                size="lg"
              >
                {isFinding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Recommendations
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLoadList(!showLoadList)}
                disabled={isFinding || savedLists.length === 0}
                size="lg"
              >
                <FileText className="mr-2 h-4 w-4" />
                Load List
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={isFinding}
                size="lg"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            {showLoadList && savedLists.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Load from Saved Lists</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedLists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => handleLoadList(list.id)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{list.category.categoryName}</div>
                      <div className="text-sm text-muted-foreground">{list.subcategory.subcategoryName}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>
              Based on users with similar preferences ({recommendations.length} results)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <AnimatePresence>
              {recommendations.map((rec, index) => {
                const percentage = (rec.points / maxPoints) * 100
                const colorIndex = index % rankColors.length
                return (
                  <motion.div
                    key={rec.itemName}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: `${percentage}%` }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                    className="relative"
                  >
                    <div className={`${rankColors[colorIndex]} h-12 rounded-lg flex items-center px-4 gap-3 min-w-[200px]`}>
                      <span className="text-white font-bold">{percentage.toFixed(1)}%</span>
                      <span className="text-white font-medium capitalize">{rec.itemName}</span>
                      <span className="text-white/80 text-sm ml-auto">{rec.points} pts</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
