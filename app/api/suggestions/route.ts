import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const categoryId = searchParams.get('category_id')

    if (!query || query.length < 3) {
      return NextResponse.json([])
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Search for items that match the query
    // Items are stored lowercase, so search in lowercase
    const items = await prisma.item.findMany({
      where: {
        itemName: {
          contains: query.toLowerCase(),
        },
        listItems: {
          some: {
            list: {
              categoryId: parseInt(categoryId),
            },
          },
        },
      },
      select: {
        itemName: true,
      },
      take: 10,
      orderBy: {
        itemName: 'asc',
      },
    })

    // Capitalize first letter of each word for display
    const suggestions = items.map(item => {
      return item.itemName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
