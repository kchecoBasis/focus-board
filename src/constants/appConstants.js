/**
 * Named constants for FocusBoard application
 * Replaces magic numbers with descriptive values
 */

// LocalStorage keys
export const STORAGE_KEYS = {
  TASKS: 'focusboard-tasks',
  SESSION_HISTORY: 'focusboard-session-history'
}

// Session history management
export const MAX_SESSION_HISTORY = 1000 // Maximum number of sessions to keep in localStorage

// Timer configuration
export const TIMER_CONFIG = {
  FOCUS_DURATION_MS: 25 * 60 * 1000, // 25 minutes in milliseconds
  BREAK_DURATION_MS: 5 * 60 * 1000, // 5 minutes in milliseconds
  AUTO_START_ENABLED: true
}

// Task management
export const TASK_CONSTANTS = {
  MAX_TITLE_LENGTH: 200,
  MIN_TITLE_LENGTH: 1
}

// UI constants
export const UI_CONSTANTS = {
  SCROLL_THRESHOLD: 100, // px before auto-scrolling
  ANIMATION_DURATION_MS: 200,
  DEBOUNCE_DELAY_MS: 300
}

// Security constants
export const SECURITY_CONFIG = {
  XSS_SANITIZATION_ENABLED: true,
  ALLOWED_HTML_TAGS: [], // Empty array for strict sanitization
  MAX_INPUT_LENGTH: 1000
}
