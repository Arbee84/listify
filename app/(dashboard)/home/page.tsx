import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Search, BookMarked, TrendingUp } from 'lucide-react'

export default async function HomePage() {
  const session = await getSession()

  if (!session) {
    return null // Middleware will redirect
  }

  // Fetch user data and stats
  const user = await prisma.account.findUnique({
    where: { id: session.user_id },
    select: {
      username: true,
      _count: {
        select: {
          lists: true,
        },
      },
    },
  })

  // Fetch recent lists
  const recentLists = await prisma.listMeta.findMany({
    where: { accountId: session.user_id },
    include: {
      category: true,
      subcategory: true,
    },
    orderBy: { modDate: 'desc' },
    take: 3,
  })

  // Fetch some popular subcategories
  const popularSubcategories = await prisma.subcategory.findMany({
    where: { popular: true },
    include: {
      category: true,
    },
    take: 6,
  })

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Welcome back, {user?.username}!</h1>
        <p className="text-xl text-muted-foreground">
          Discover your next favorite through personalized recommendations
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/create">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Create a List</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build your personalized Top 5 list across any category
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/find">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Find Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get personalized suggestions based on your preferences
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/saved-lists">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BookMarked className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Your Lists</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and manage your {user?._count.lists || 0} saved lists
              </CardDescription>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Lists */}
      {recentLists.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Lists</h2>
            <Link href="/saved-lists">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentLists.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {list.category.categoryName}
                  </CardTitle>
                  <CardDescription>{list.subcategory.subcategoryName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Updated {new Date(list.modDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Popular Categories */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Trending Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularSubcategories.map((subcat) => (
            <Link key={subcat.id} href={`/create?category=${subcat.categoryId}&subcategory=${subcat.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-sm">{subcat.subcategoryName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{subcat.category.categoryName}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
