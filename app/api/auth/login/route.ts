import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { signToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user by email (case-insensitive) and check if active
    const user = await prisma.account.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        state: 'active',
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email address not found or account not active.' },
        { status: 400 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Incorrect password.' },
        { status: 400 }
      )
    }

    // Generate JWT token
    const token = await signToken({
      email: user.email,
      user_id: user.id,
      token_version: user.tokenVersion,
    })

    // Update user's JWT token in database
    await prisma.account.update({
      where: { id: user.id },
      data: { jwtToken: token },
    })

    // Set auth cookie
    await setAuthCookie(token)

    // Return success with user data (excluding sensitive info)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login.' },
      { status: 500 }
    )
  }
}
