import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    course: {
      findUnique: vi.fn(),
    },
    order: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock NextAuth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}))
