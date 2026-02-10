# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Listify is a full-stack Next.js application where users create, share, and discover ranked "Top 5" lists across categories (movies, music, books, etc.). Users get recommendations by matching their lists against others using a scoring algorithm.

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run dev:safe` — Windows-specific: kills existing Node processes first, then starts dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run db:seed` — Seed database with countries and categories via `tsx prisma/seed.ts`
- `npx prisma migrate dev` — Run database migrations
- `npx prisma generate` — Regenerate Prisma client after schema changes

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM + PrismaPg adapter for connection pooling
- **Auth**: Custom JWT (jsonwebtoken) with bcrypt password hashing, HTTP-only cookies
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style) + Radix UI primitives
- **Validation**: Zod schemas (shared between client and API routes)
- **Forms**: react-hook-form with @hookform/resolvers
- **Animations**: Framer Motion

## Architecture

### Routing (App Router with Route Groups)

- `app/(auth)/` — Login and register pages (public, redirects to /home if authenticated)
- `app/(dashboard)/` — All protected pages share a sidebar layout via `layout.tsx`
- `app/api/` — API route handlers for auth, lists, recommendations, categories, countries, account
- `middleware.ts` — JWT validation; redirects unauthenticated users to /login, authenticated users away from auth pages. Excludes `/api/*` paths (API routes protect themselves via `getSession()`).

### Data Layer

- `lib/prisma.ts` — Singleton Prisma client with PrismaPg connection pool adapter (cached on `globalThis` in dev to survive HMR)
- `prisma/schema.prisma` — All models use `@map` to snake_case table/column names. Key models:
  - **Account** — Users with JWT token storage and tokenVersion for invalidation
  - **ListMeta** — A user's list for a specific category+subcategory (unique constraint on accountId+categoryId+subcategoryId)
  - **Item** — Global pool of items (unique, stored lowercase)
  - **ListItem** — Junction table linking ListMeta to Items with rank (1-5)
- List saves use Prisma transactions to atomically upsert ListMeta + delete old ListItems + create new ones

### Auth Flow

- `lib/auth.ts` — signToken, verifyToken, getSession (reads cookie), setAuthCookie, clearAuthCookie
- JWT payload: `{ email, user_id, token_version }`, 30-day expiry
- API routes call `getSession()` to get the authenticated user; middleware handles page-level redirects only

### Validation

- `lib/validations.ts` — Zod schemas and inferred TypeScript types for login, register, account update, list save, and recommendations
- Password requirements: min 6 chars, must include uppercase, lowercase, number, and special character

### Recommendations Algorithm

- `app/api/recommendations/route.ts` — Accepts a subcategory + up to 5 items, runs scoring SQL:
  - Rank-weighted points (rank 1=8pts, 2=5pts, 3=3pts, 4=2pts)
  - Bonus for #1 rank matches
  - Hit percentage tiers (≥80%=+100, ≥60%=+50, etc.)
  - Excludes the requesting user's own lists

### Styling

- CSS variables for light/dark theming defined in `app/globals.css`
- Dark mode via next-themes (`components/theme-provider.tsx`)
- shadcn/ui components in `components/ui/`; path alias configured in `components.json`

## Path Aliases

`@/*` maps to the project root (configured in tsconfig.json).

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for signing JWTs
- `NODE_ENV` — development/production
