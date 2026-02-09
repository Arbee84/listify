import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listId = parseInt(params.id)

    if (isNaN(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 })
    }

    // Verify list belongs to user
    const list = await prisma.listMeta.findFirst({
      where: {
        id: listId,
        accountId: session.user_id,
      },
    })

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete list (cascade will delete list items)
    await prisma.listMeta.delete({
      where: { id: listId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting list:', error)
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
}

// PATCH - Update list visibility
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listId = parseInt(params.id)

    if (isNaN(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 })
    }

    const body = await req.json()
    const { visibilityId } = body

    if (!visibilityId || visibilityId < 1 || visibilityId > 3) {
      return NextResponse.json(
        { error: 'Invalid visibility ID' },
        { status: 400 }
      )
    }

    // Verify list belongs to user and update
    const list = await prisma.listMeta.updateMany({
      where: {
        id: listId,
        accountId: session.user_id,
      },
      data: {
        visibilityId,
      },
    })

    if (list.count === 0) {
      return NextResponse.json(
        { error: 'List not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating list:', error)
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    )
  }
}
