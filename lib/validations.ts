import { z } from 'zod'

// Password validation: at least 6 characters, must contain uppercase, lowercase, number, and special character
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  dateOfBirth: z.date().refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 13
  }, 'You must be at least 13 years old'),
  sex: z.enum(['Male', 'Female', 'Other', 'Not Selected']),
  countryId: z.number().int().positive('Please select a country'),
})

export const updateAccountSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  dateOfBirth: z.date().optional(),
  sex: z.enum(['Male', 'Female', 'Other', 'Not Selected']).optional(),
  countryId: z.number().int().positive().optional(),
  darkMode: z.boolean().optional(),
  visibilityId: z.number().int().min(1).max(3).optional(),
})

export const saveListSchema = z.object({
  categoryId: z.number().int().positive('Category is required'),
  subcategoryId: z.number().int().positive('Subcategory is required'),
  visibilityId: z.number().int().min(1).max(3),
  items: z.array(
    z.object({
      itemName: z.string().min(1, 'Item name is required'),
      rank: z.number().int().min(1).max(5),
    })
  ).length(5, 'You must provide exactly 5 items'),
})

export const findRecommendationsSchema = z.object({
  subcategoryId: z.number().int().positive('Subcategory is required'),
  items: z.array(z.string().min(1)).min(1).max(5),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
export type SaveListInput = z.infer<typeof saveListSchema>
export type FindRecommendationsInput = z.infer<typeof findRecommendationsSchema>
