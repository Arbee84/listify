import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Initialize Prisma with adapter for transactions
const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prismaWithAdapter = new (prisma as any).constructor({ adapter })

// GET - Fetch user's list for specific category/subcategory or all lists
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('category_id')
    const subcategoryId = searchParams.get('subcategory_id')

    // If specific category/subcategory requested, return that list
    if (categoryId && subcategoryId) {
      const list = await prisma.listMeta.findFirst({
        where: {
          accountId: session.user_id,
          categoryId: parseInt(categoryId),
          subcategoryId: parseInt(subcategoryId),
        },
        include: {
          listItems: {
            include: {
              item: true,
            },
            orderBy: {
              listRank: 'asc',
            },
          },
          category: true,
          subcategory: true,
        },
      })

      return NextResponse.json(list)
    }

    // Otherwise return all user's lists
    const lists = await prisma.listMeta.findMany({
      where: {
        accountId: session.user_id,
      },
      include: {
        category: true,
        subcategory: true,
        listItems: {
          include: {
            item: true,
          },
          orderBy: {
            listRank: 'asc',
          },
        },
      },
      orderBy: [
        { category: { categoryName: 'asc' } },
        { subcategory: { subcategoryName: 'asc' } },
      ],
    })

    return NextResponse.json(lists)
  } catch (error) {
    console.error('Error fetching lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    )
  }
}

// POST - Save/update list
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { categoryId, subcategoryId, visibilityId, items } = body

    // Validate items
    if (!Array.isArray(items) || items.length !== 5) {
      return NextResponse.json(
        { error: 'You must provide exactly 5 items' },
        { status: 400 }
      )
    }

    // Check for duplicates (case-insensitive)
    const itemNames = items.map(item => item.itemName.toLowerCase())
    if (new Set(itemNames).size !== itemNames.length) {
      return NextResponse.json(
        { error: 'Duplicate items are not allowed' },
        { status: 400 }
      )
    }

    // Use transaction to create/update list
    const result = await prisma.$transaction(async (tx) => {
      // Find or create list_meta
      let listMeta = await tx.listMeta.findFirst({
        where: {
          accountId: session.user_id,
          categoryId: parseInt(categoryId),
          subcategoryId: parseInt(subcategoryId),
        },
      })

      if (!listMeta) {
        // Create new list
        listMeta = await tx.listMeta.create({
          data: {
            accountId: session.user_id,
            categoryId: parseInt(categoryId),
            subcategoryId: parseInt(subcategoryId),
            visibilityId: visibilityId || 1,
          },
        })
      } else {
        // Update existing list metadata
        listMeta = await tx.listMeta.update({
          where: { id: listMeta.id },
          data: {
            visibilityId: visibilityId || listMeta.visibilityId,
            modDate: new Date(),
          },
        })

        // Delete existing list items
        await tx.listItem.deleteMany({
          where: { listId: listMeta.id },
        })
      }

      // Create items and list items
      for (const item of items) {
        // Upsert item (create if doesn't exist, get if exists)
        const dbItem = await tx.item.upsert({
          where: { itemName: item.itemName.toLowerCase() },
          update: {},
          create: { itemName: item.itemName.toLowerCase() },
        })

        // Create list item
        await tx.listItem.create({
          data: {
            listId: listMeta.id,
            itemId: dbItem.id,
            listRank: item.rank,
          },
        })
      }

      return listMeta
    })

    return NextResponse.json({ success: true, listId: result.id })
  } catch (error) {
    console.error('Error saving list:', error)
    return NextResponse.json(
      { error: 'Failed to save list' },
      { status: 500 }
    )
  }
}
