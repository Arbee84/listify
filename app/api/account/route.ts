import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcrypt'

// GET - Fetch account details
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const account = await prisma.account.findUnique({
      where: { id: session.user_id },
      select: {
        id: true,
        email: true,
        username: true,
        dateOfBirth: true,
        sex: true,
        countryId: true,
        darkMode: true,
        visibilityId: true,
        createdAt: true,
        _count: {
          select: {
            lists: true,
          },
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

// PUT - Update account details
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { username, dateOfBirth, sex, countryId, darkMode, visibilityId } = body

    // Validate username uniqueness if being updated
    if (username) {
      const existingUser = await prisma.account.findFirst({
        where: {
          username: {
            equals: username,
            mode: 'insensitive',
          },
          NOT: {
            id: session.user_id,
          },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    // Build update data object
    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth)
    if (sex !== undefined) updateData.sex = sex
    if (countryId !== undefined) updateData.countryId = countryId
    if (darkMode !== undefined) updateData.darkMode = darkMode
    if (visibilityId !== undefined) updateData.visibilityId = visibilityId

    const updatedAccount = await prisma.account.update({
      where: { id: session.user_id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      account: {
        id: updatedAccount.id,
        username: updatedAccount.username,
        darkMode: updatedAccount.darkMode,
      },
    })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

// DELETE - Delete account
export async function DELETE() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete account (cascade will delete lists)
    await prisma.account.delete({
      where: { id: session.user_id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
