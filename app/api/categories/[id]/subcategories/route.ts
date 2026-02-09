import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categoryId = parseInt(params.id)

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    // Get subcategories with count of lists for each
    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId,
      },
      orderBy: [
        { popular: 'desc' },
        { subcategoryName: 'asc' },
      ],
      select: {
        id: true,
        subcategoryName: true,
        popular: true,
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

    return NextResponse.json(subcategories)
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    )
  }
}
