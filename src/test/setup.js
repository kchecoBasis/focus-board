import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock DOMPurify since it requires browser APIs not available in jsdom
vi.mock('dompurify', () => ({
  default: {
    sanitize: (input) => input,
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
