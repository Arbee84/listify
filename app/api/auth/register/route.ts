import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { signToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Convert date string to Date object if needed
    if (body.dateOfBirth && typeof body.dateOfBirth === 'string') {
      body.dateOfBirth = new Date(body.dateOfBirth)
    }

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, username, dateOfBirth, sex, countryId } = validation.data

    // Check if email already exists
    const existingEmail = await prisma.account.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email address already in use.' },
        { status: 400 }
      )
    }

    // Check if username already exists (case-insensitive)
    const existingUsername = await prisma.account.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.account.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username,
        dateOfBirth,
        sex,
        countryId,
        state: 'active',
      },
    })

    // Generate JWT token
    const token = await signToken({
      email: user.email,
      user_id: user.id,
      token_version: user.tokenVersion,
    })

    // Update user's JWT token
    await prisma.account.update({
      where: { id: user.id },
      data: { jwtToken: token },
    })

    // Set auth cookie
    await setAuthCookie(token)

    // Return success
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration.' },
      { status: 500 }
    )
  }
}
