import { NextRequest, NextResponse } from 'next/server'
import { getSession, clearAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (session) {
      // Increment token version to invalidate all existing tokens
      await prisma.account.update({
        where: { id: session.user_id },
        data: {
          tokenVersion: {
            increment: 1,
          },
          jwtToken: null,
        },
      })
    }

    // Clear auth cookie
    await clearAuthCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout.' },
      { status: 500 }
    )
  }
}
