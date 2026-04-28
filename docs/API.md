# Focus Board - Technical Documentation

## Overview

This document provides detailed technical documentation for the Focus Board application, including component architecture, data structures, and API contracts.

## Component Architecture

### Component Hierarchy

```
App.jsx (Root)
└── FocusBoard.jsx (Main Container)
    ├── TaskForm.jsx
    ├── TaskList.jsx
    └── Timer.jsx
```

### Component Responsibilities

#### App.jsx

**Purpose**: Root component that initializes the React application.

**Responsibilities**:
- Mount FocusBoard to DOM
- Initialize React 18 root

---

#### FocusBoard.jsx (Main Container)

**Purpose**: Central state management and coordination of child components.

**State Management**:
```javascript
{
  tasks: Array<Task>,           // All tasks in the system
  currentTaskId: string|null,   // Currently selected task ID
  isFocusMode: boolean,         // Current timer mode (true=focus, false=break)
  timeRemaining: number,        // Countdown in milliseconds
  timerActive: boolean          // Timer running state
}
```

**Key Functions**:
- `handleAddTask()`: Adds new task to tasks array
- `completeTask()`: Marks task as complete/incomplete
- `deleteTask()`: Removes task from system
- `setCurrentTask()`: Sets current focus target
- `startTimer()`, `pauseTimer()`, `resumeTimer()`, `resetTimer()`: Timer control functions

**Data Flow**:
1. State initialized on mount via `useState` hooks
2. Effects manage timer countdown (100ms interval)
3. Child components receive state and callbacks as props
4. User actions trigger callback updates to parent state

---

#### TaskForm.jsx

**Purpose**: Form interface for adding new tasks with optional descriptions.

**Props**:
```javascript
{
  onAddTask: (taskData) => void,   // Callback when form submitted
  onCancel: () => void              // Callback for cancel button
}
```

**Internal State**:
- `title`: string (required field)
- `description`: string (optional field)
- `expanded`: boolean (form visibility state)

**Validation Rules**:
- Title must be non-empty
- Description is optional but sanitized via DOMPurify

**User Interactions**:
- Click `+` button: Expands form
- Enter key in title: Submits form
- Submit button: Validates and calls `onAddTask()`
- Cancel/ESC key: Closes form without saving

---

#### TaskList.jsx

**Purpose**: Display list of all tasks with quick-add functionality.

**Props**:
```javascript
{
  tasks: Array<Task>,              // All tasks to display
  newTaskTitle: string,            // Quick-add input value
  setNewTaskTitle: (value) => void, // Input change handler
  handleAddTask: (event) => void,   // Form submission handler
  completeTask: (taskId) => void,   // Toggle completion state
  deleteTask: (taskId) => void,     // Remove task
  currentTaskId: string|null,       // Currently selected task
  setCurrentTask: (id) => void      // Select task for focus
}
```

**Features**:
- Quick-add input at top of list
- Scrollable list with custom scrollbar styling
- Max height constraint (400px) to prevent overflow
- Empty state when no tasks exist

**List Display Logic**:
1. Check if `tasks.length === 0`
2. If empty, show placeholder message
3. Otherwise, render `<TaskItem>` for each task

---

#### Timer.jsx

**Purpose**: Pomodoro timer with focus/break mode switching.

**Props**:
```javascript
{
  timerState: {
    currentTaskId: string|null,
    setCurrentTask: (id) => void,
    isFocusMode: boolean,
    timeRemaining: number,
    startTimer: () => void,
    pauseTimer: () => void,
    resumeTimer: () => void,
    resetTimer: () => void
  },
  tasks: Array<Task>,                // For task lookup and selection
  onSessionComplete: () => void      // Callback when focus ends
}
```

**Display Logic**:
```javascript
if (!isFocusMode) {
  // Break mode display
  title: "☕ Break Time"
  colorClass: "from-green-500 to-emerald-600"
} else if (currentTaskId && currentTask) {
  // Focus on specific task
  title: DOMPurify.sanitize(currentTask.title)
  colorClass: "from-purple-500 to-pink-600"
} else {
  // No task selected
  title: "Select a Task"
  colorClass: "from-gray-500 to-slate-600"
}
```

**Timer Controls**:
- **Start/Pause Button**: 
  - Enabled only when `isFocusMode && currentTaskId`
  - Starts if timer at 0 or <1 second
  - Pauses if between 10 seconds and 90% duration
- **Reset Button**:
  - Returns to full duration (25min focus / 5min break)
  - Disabled when no task selected or session complete
- **Complete Button** (Focus only):
  - Appears after <90% of focus duration
  - Calls `onSessionComplete()` callback

**Time Formatting**:
```javascript
const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
// Example: "25:00" or "04:30"
```

---

## Data Structures

### Task Object

```typescript
interface Task {
  id: string;              // Unique identifier (Date.now() + Math.random())
  title: string;           // Required task name
  description?: string;    // Optional detailed description
  completedSessions: number; // Counter for completed focus sessions
}
```

**Example**:
```javascript
{
  id: "1745592000000_123456",
  title: "Complete documentation",
  description: "Write API docs and README updates",
  completedSessions: 3
}
```

### TimerState Object

```typescript
interface TimerState {
  currentTaskId: string | null;        // Currently focused task ID or null
  setCurrentTask: (id: string) => void; // Setter function
  isFocusMode: boolean;                 // true = focus, false = break
  timeRemaining: number;                // Countdown in milliseconds
  startTimer: () => void;               // Begin countdown
  pauseTimer: () => void;               // Pause active timer
  resumeTimer: () => void;              // Resume paused timer
  resetTimer: () => void;               // Reset to full duration
}
```

**Duration Constants**:
- Focus mode: `25 * 60 * 1000` = 1,500,000ms (25 minutes)
- Break mode: `5 * 60 * 1000` = 300,000ms (5 minutes)

---

## API Contracts

### TaskForm Component Interface

**Props**:
```typescript
interface TaskFormProps {
  onAddTask: (taskData: { title: string; description?: string }) => void;
  onCancel: () => void;
}
```

**Callback Signatures**:
- `onAddTask(taskData)`: Called when form submitted with valid data
  - `taskData.title`: Required, non-empty string
  - `taskData.description`: Optional sanitized string
- `onCancel()`: Called when user cancels or presses ESC

---

### TaskList Component Interface

**Props**:
```typescript
interface TaskListProps {
  tasks: Array<Task>;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  handleAddTask: (event: React.FormEvent) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  currentTaskId: string | null;
  setCurrentTask: (id: string) => void;
}
```

**Callback Signatures**:
- `setNewTaskTitle(value)`: Updates quick-add input value
- `handleAddTask(event)`: Handles form submission, validates input
- `completeTask(taskId)`: Toggles completion state for task
- `deleteTask(taskId)`: Removes task from array
- `setCurrentTask(id)`: Selects task for focus timer

---

### Timer Component Interface

**Props**:
```typescript
interface TimerProps {
  timerState: TimerState;
  tasks: Array<Task>;
  onSessionComplete: () => void;
}
```

**Callback Signatures**:
- `onSessionComplete()`: Called when user completes focus session
  - Should trigger break mode automatically
  - May update task statistics or show completion feedback

---

## Event Flow Diagrams

### Adding a Task via TaskForm

```
User clicks "+" button
    ↓
TaskForm.expanded = true
    ↓
User enters title (and optional description)
    ↓
User submits form (Enter key or "Add" button)
    ↓
handleSubmit() validates: newTaskTitle.trim() !== ""
    ↓
onAddTask({ title, description }) called
    ↓
FocusBoard adds task to tasks array
    ↓
Form resets and collapses
```

### Timer Session Flow

```
User selects task from list/dropdown
    ↓
currentTaskId set, isFocusMode = true
    ↓
Timer displays selected task title
    ↓
User clicks "▶ Start"
    ↓
timerActive = true, countdown begins (100ms interval)
    ↓
timeRemaining decrements each tick
    ↓
Progress bar updates via CSS transition
    ↓
After 10 seconds: Pause button becomes available
    ↓
User can pause/resume as needed
    ↓
Timer reaches completion (<90% duration threshold met)
    ↓
"✅ Complete" button appears
    ↓
User clicks "Complete"
    ↓
onSessionComplete() called
    ↓
isFocusMode = false, timeRemaining reset to 5min
```

---

## Security Implementation Details

### XSS Protection Strategy

**Library**: DOMPurify (DOM Pure) - Sanitizes HTML content against XSS attacks.

**Usage Pattern**:
```javascript
import DOMPurify from 'dompurify';

// Before rendering user input:
const safeTitle = DOMPurify.sanitize(userInput);
return <span>{safeTitle}</span>;
```

**Protected Elements**:
1. Task titles in display contexts (h3, span elements)
2. Form input values after submission
3. Dropdown options and task selections
4. Tooltip/title attributes for full text display

**Sanitization Points**:
- `TaskForm.jsx`: Line 57 - Input sanitization before state update
- `Timer.jsx`: Lines 41, 80, 96-97, 166 - Display sanitization
- All user-generated content passed to child components

---

## Styling Architecture

### CSS Class Conventions

**Layout**:
- `flex`, `grid` for container layouts
- `gap-*` for spacing between elements
- `max-w-sm`, `w-full` for width constraints

**Typography**:
- `text-xl`, `font-bold` for headings
- `font-mono` for timer display (consistent digit widths)
- `tracking-wider` for improved readability

**Colors & Gradients**:
- Primary: `from-purple-500 to-pink-600` (focus mode)
- Secondary: `from-green-500 to-emerald-600` (break/completion)
- Backgrounds: `bg-white/10`, `bg-gray-900/50` (translucent layers)

**Effects**:
- Glassmorphism: `backdrop-blur-sm` + translucent backgrounds
- Shadows: `shadow-lg shadow-purple-500/30` (colored shadows)
- Transitions: `transition-all duration-200` (smooth animations)

---

## Performance Characteristics

### Render Frequency

- **Timer Component**: Re-renders every 100ms during active countdown
- **Other Components**: Only on state changes
- **Optimization**: `useMemo` for expensive calculations (time formatting, task lookup)

### Memory Usage

- Task array stored in React state (~O(n) where n = number of tasks)
- Timer interval reference managed via `setInterval()`/`clearInterval()`
- No memory leaks: Intervals cleared on unmount or mode switch

### DOM Updates

- Progress bar uses CSS transitions (GPU-accelerated)
- Conditional rendering minimizes DOM changes
- Event delegation not used; each button has direct handler

---

## Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| React 18+ | ✓ | ✓ | ✓ | ✓ |
| Tailwind CSS | ✓ | ✓ | ✓ | ✓ |
| ES6+ Syntax | ✓ | ✓ | ✓ | ✓ |
| DOMPurify | ✓ | ✓ | ✓ | ✓ |

**Minimum Requirements**:
- Modern browser with ES6 support (2018+)
- JavaScript enabled
- CSS3 features (flexbox, gradients, backdrop-filter)

---

## Error Handling

### Input Validation Errors

```javascript
// TaskForm validation example
const handleSubmit = useCallback((e) => {
  e.preventDefault()
  if (!title.trim()) return; // Silently reject empty titles
  onAddTask({ title: DOMPurify.sanitize(title), description });
}, [title, description])
```

**Behavior**:
- Empty titles prevent form submission (no error message shown)
- Valid inputs proceed to parent callback
- Sanitization applied before state update

### Timer Edge Cases

1. **No task selected**: Start button disabled, gray theme displayed
2. **Timer at completion**: Only "Complete" and "Reset" buttons active
3. **Mode switching**: Reset timer automatically when switching modes

---

## Extensibility Guide

### Adding New Components

1. Create file in `src/components/` with PascalCase naming
2. Define functional component with explicit prop types
3. Use existing state management patterns (parent owns state)
4. Implement XSS protection for all user inputs
5. Add ARIA attributes for accessibility compliance

### Modifying Timer Behavior

To customize duration:
```javascript
// In FocusBoard.jsx useEffect
setTimeRemaining(25 * 60 * 1000); // Change 25 to desired minutes
```

To add new timer modes:
1. Add mode constant in `TIMER_MODES` object (Timer.jsx line 4-7)
2. Update display logic in `getTimerDisplay()` function
3. Modify color classes for visual distinction

---

## Maintenance Notes

### Dependencies to Monitor

- **React**: Current version 18+ (hooks, concurrent features)
- **Tailwind CSS**: Latest v3.x (utility-first styling)
- **DOMPurify**: Security updates critical (XSS protection)

### Code Quality Standards

- Functional components with hooks only (no class components)
- Explicit prop destructuring for clarity
- Consistent naming: camelCase functions, PascalCase components
- No hardcoded values; use constants where appropriate

---

This documentation serves as a reference for developers working on the Focus Board application. For implementation details not covered here, refer to inline code comments or component source files.
