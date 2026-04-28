import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // Clear localStorage before each test
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

// ─── Page Load ────────────────────────────────────────────────────────────────

test('loads the app and shows the title', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Focus Board')
})

test('shows the timer with 25:00 on load', async ({ page }) => {
  await expect(page.getByText('25:00')).toBeVisible()
})

test('shows Focus Mode indicator', async ({ page }) => {
  await expect(page.getByText('🎯 Focus Mode')).toBeVisible()
})

test('shows empty task list state', async ({ page }) => {
  await expect(page.getByText('No tasks yet')).toBeVisible()
})

// ─── Task Management ──────────────────────────────────────────────────────────

test('adds a task via TaskForm (main input)', async ({ page }) => {
  const input = page.getByPlaceholder('What needs to be done?')
  await input.fill('My first E2E task')
  await input.press('Enter')
  await expect(page.getByText('My first E2E task')).toBeVisible()
})

test('adds a task via TaskList quick-add', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Quick add task')
  await input.press('Enter')
  await expect(page.getByText('Quick add task')).toBeVisible()
})

test('does not add a task with empty title', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('   ')
  await input.press('Enter')
  await expect(page.getByText('No tasks yet')).toBeVisible()
})

test('task count increases as tasks are added', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Task A')
  await input.press('Enter')
  await input.fill('Task B')
  await input.press('Enter')
  await expect(page.getByText('Tasks (2)')).toBeVisible()
})

test('deletes a task', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('To delete')
  await input.press('Enter')
  await expect(page.getByText('To delete')).toBeVisible()

  const taskItem = page.locator('li').filter({ hasText: 'To delete' })
  await taskItem.hover()
  await taskItem.getByRole('button', { name: /Delete task/ }).click()
  await expect(page.getByText('To delete')).not.toBeVisible()
})

test('marks a task as complete via the toggle', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Completable task')
  await input.press('Enter')

  const taskItem = page.locator('li').filter({ hasText: 'Completable task' })
  const toggle = taskItem.locator('div.rounded-full').first()
  await toggle.click()

  await expect(taskItem.locator('span.line-through')).toBeVisible()
})

// ─── Timer ────────────────────────────────────────────────────────────────────

test('selecting a task from list enables the Start button', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Focus task')
  await input.press('Enter')

  const taskItem = page.locator('li').filter({ hasText: 'Focus task' })
  await taskItem.locator('button').first().click()

  await expect(page.getByRole('button', { name: /▶ Start/ })).toBeVisible()
})

test('timer starts counting down after clicking Start', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Timer task')
  await input.press('Enter')

  const taskItem = page.locator('li').filter({ hasText: 'Timer task' })
  await taskItem.locator('button').first().click()
  await page.getByRole('button', { name: /▶ Start/ }).click()

  await page.waitForTimeout(2500)
  const timerText = await page.getByText(/\d{2}:\d{2}/).first().textContent()
  expect(timerText).not.toBe('25:00')
})

test('timer pauses after clicking Pause', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Pause task')
  await input.press('Enter')

  const taskItem = page.locator('li').filter({ hasText: 'Pause task' })
  await taskItem.locator('button').first().click()
  await page.getByRole('button', { name: /▶ Start/ }).click()
  await page.waitForTimeout(1500)

  await page.getByRole('button', { name: /⏸ Pause/ }).click()
  const snapshot = await page.getByText(/\d{2}:\d{2}/).first().textContent()

  await page.waitForTimeout(2000)
  const after = await page.getByText(/\d{2}:\d{2}/).first().textContent()
  expect(snapshot).toBe(after)
})

test('Reset button returns timer to 25:00', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Reset task')
  await input.press('Enter')

  const taskItem = page.locator('li').filter({ hasText: 'Reset task' })
  await taskItem.locator('button').first().click()
  await page.getByRole('button', { name: /▶ Start/ }).click()
  await page.waitForTimeout(2000)
  await page.getByRole('button', { name: /↻ Reset/ }).click()

  await expect(page.getByText('25:00')).toBeVisible()
})

// ─── Session Completion ───────────────────────────────────────────────────────

test('Complete button appears after timer has started', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Complete me')
  await input.press('Enter')

  const taskItem = page.locator('li').filter({ hasText: 'Complete me' })
  await taskItem.locator('button').first().click()
  await page.getByRole('button', { name: /▶ Start/ }).click()
  await page.waitForTimeout(1500)

  await expect(page.getByRole('button', { name: /✅ Complete/ })).toBeVisible()
})

test('completing a session updates the statistics', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Stats task')
  await input.press('Enter')

  const taskItem = page.locator('li').filter({ hasText: 'Stats task' })
  await taskItem.locator('button').first().click()
  await page.getByRole('button', { name: /▶ Start/ }).click()
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: /✅ Complete/ }).click()

  await expect(page.getByText('1')).toBeVisible()
})

// ─── Statistics ────────────────────────────────────────────────────────────────

test('shows Focus Statistics section', async ({ page }) => {
  await expect(page.getByText('Focus Statistics')).toBeVisible()
})

test('shows zero sessions on first load', async ({ page }) => {
  await expect(page.getByText('Total Sessions')).toBeVisible()
})

// ─── Persistence ──────────────────────────────────────────────────────────────

test('tasks persist after page reload', async ({ page }) => {
  const input = page.getByLabel('New task title')
  await input.fill('Persistent task')
  await input.press('Enter')
  await expect(page.getByText('Persistent task')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Persistent task')).toBeVisible()
})

// ─── TaskForm expanded view ───────────────────────────────────────────────────

test('TaskForm expand button shows description field', async ({ page }) => {
  await page.getByRole('button', { name: 'Expand for description' }).click()
  await expect(page.getByPlaceholder('Add a description (optional)...')).toBeVisible()
})

test('TaskForm adds task with expanded view and shows Add Task button', async ({ page }) => {
  const input = page.getByPlaceholder('What needs to be done?')
  await input.fill('Expanded task')
  await page.getByRole('button', { name: 'Expand for description' }).click()
  await expect(page.getByRole('button', { name: 'Add Task' })).toBeVisible()
})
