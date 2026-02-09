import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get categories with count of lists for each
    const categories = await prisma.category.findMany({
      orderBy: {
        categoryName: 'asc',
      },
      select: {
        id: true,
        categoryName: true,
        _count: {
          select: {
            lists: {
              where: {
                accountId: session.user_id,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
