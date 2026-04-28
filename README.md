# Focus Board

A modern Pomodoro-style productivity application built with React 18 and Tailwind CSS. Maintain focus through structured work intervals while tracking your task completion progress.

![Focus Board](https://img.shields.io/badge/Focus-Board-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v3.x-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🚀 Features

- **Task Management**: Create, organize, and track tasks with optional descriptions
- **Pomodoro Timer**: 25-minute focus sessions followed by automatic 5-minute breaks
- **Progress Tracking**: Visual completion counter for each task to monitor productivity over time
- **Focus Mode**: Select any task to maintain context awareness during work sessions
- **Modern UI/UX**: Beautiful glassmorphism design with smooth animations and gradient color schemes

---

## 📋 Documentation

This project includes comprehensive documentation in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [API Reference](./docs/API.md) | Component API, props, state management patterns, and implementation guide |
| [Project Overview](./docs/PROJECT_OVERVIEW.md) | Architecture decisions, challenges encountered, technology stack |
| [Code Review](./docs/CODE_REVIEW.md) | Issue tracking, resolutions, security review findings, improvement recommendations |

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 16+ and npm/yarn package manager
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd test-local-qwen

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000` by default.

---

## 📦 Project Structure

```
test-local-qwen/
├── public/                    # Static assets and index.html
│   └── index.html            # HTML template with Tailwind CDN
├── src/                      # React application source code
│   ├── App.jsx              # Root component (mount point)
│   ├── FocusBoard.jsx       # State owner, main container
│   ├── TaskForm.jsx         # Task creation form
│   ├── TaskList.jsx         # Task display and quick-add list
│   └── Timer.jsx            # Pomodoro timer controls
├── docs/                     # Project documentation
│   ├── API.md               # Component API reference
│   ├── PROJECT_OVERVIEW.md  # Architecture and challenges
│   └── CODE_REVIEW.md       # Code review findings
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## 🎯 Usage Guide

### Creating Tasks

1. Use the **Task Form** at top of interface
2. Enter task title (required) and optional description
3. Press "Add Task" or press Enter to create

### Quick-Add Tasks

1. Scroll to **Quick Add** section in Task List
2. Type task name and press Enter or click the button

### Starting a Focus Session

1. Select any task from the list (click on it)
2. Click the purple **"Start"** button in Timer component
3. Timer begins countdown automatically after 5-second preparation period

### During a Session

- **Pause**: Click Pause to temporarily stop timer
- **Resume**: Click Resume to continue from paused state
- **Reset**: Click Reset to return timer to full duration
- **Switch Tasks**: Select different task while timer is paused

### After Timer Completes

Timer automatically switches to green break mode with 5-minute countdown:

1. Take a restorative break (recommended)
2. Or click **"Complete"** button to finish session and reset focus timer
3. Task completion counter increments on manual completion

---

## 🎨 Design Philosophy

### Color Scheme Psychology

- **Purple/Pink Gradients**: Creative focus energy, deep work state
- **Green/Emerald Gradients**: Restorative break, relaxation phase
- **Gray Neutrals**: Reset operations, neutral baseline

### Glassmorphism Effect

Modern frosted glass aesthetic achieved through:
- Semi-transparent backgrounds with backdrop blur
- Subtle shadows and borders for depth
- Smooth gradient transitions between states

---

## 🔒 Security Features

### XSS Protection

All user-generated content is sanitized using **DOMPurify** library:

1. Input validation prevents empty/malicious entries
2. Sanitization applied at submission before state storage
3. Display sanitization provides defense-in-depth layering

### Security Coverage Matrix

| Input Type | Validation | Sanitization | Storage Safe? |
|------------|------------|--------------|---------------|
| Task Titles | Required check | DOMPurify | ✅ Yes |
| Descriptions | Optional field | DOMPurify | ✅ Yes |
| Selections | Controlled data | DOMPurify | ✅ Yes |

---

## 🏗️ Architecture Overview

### State Management Strategy

**Single Source of Truth**: `FocusBoard.jsx` owns all application state and manages:

- Task list (`tasks` array)
- Current task selection (`currentTask`)
- Timer state (`timeRemaining`, `timerActive`)
- Mode tracking (`isFocusMode` boolean)
- Completion status (`isCompleted` flag)

### Component Hierarchy

```
App.jsx (root mount point)
└── FocusBoard.jsx (state owner)
    ├── TaskForm.jsx (task creation form)
    ├── TaskList.jsx (task display + quick add)
    └── Timer.jsx (Pomodoro timer controls)
```

### Data Flow Pattern

1. User action triggers callback passed from parent
2. State updated via setState with functional updates for immutability
3. Child components re-render automatically based on new props
4. Timer interval effect manages countdown independently of task state changes

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create task via form submission
- [ ] Quick-add task from list input
- [ ] Complete/incomplete task toggling
- [ ] Task deletion functionality
- [ ] Timer start/pause/resume/reset flows
- [ ] Mode switching (focus → break)
- [ ] ESC key closes expanded forms
- [ ] Empty state displays correctly

### Security Testing Performed

- XSS injection attempts in task titles: ✅ Blocked by DOMPurify
- HTML script tags sanitized and removed from output: ✅ Verified
- Event handler attributes stripped during sanitization: ✅ Confirmed

---

## 🚧 Known Limitations

1. **No Persistence**: Tasks reset on page refresh (no localStorage or backend)
2. **Fixed Durations**: Focus/break times hardcoded, no user customization
3. **Single User**: No multi-user support or team features
4. **Limited Analytics**: Only session count tracked, no detailed insights

---

## 📈 Future Enhancements

### Priority 1: LocalStorage Persistence ⭐ Recommended

Users expect data to persist across browser sessions without backend requirements.

**Estimated Effort**: ~30 minutes  
**Risk Level**: Minimal (backward compatible)

```javascript
// Example pattern for implementation
useEffect(() => {
  const saved = localStorage.getItem('focusBoardTasks');
  if (saved) setTasks(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem('focusBoardTasks', JSON.stringify(tasks));
}, [tasks]);
```

### Priority 2: Customizable Timer Durations

Different users prefer different Pomodoro ratios (e.g., 50/10, 90/20).

**Estimated Effort**: ~2 hours including settings modal  
**Risk Level**: Low (isolated changes)

### Priority 3: Productivity Analytics Dashboard

Users want insights into their focus patterns over time.

**Estimated Effort**: ~8-10 hours with charting library integration  
**Risk Level**: Medium (new component complexity)

**Recommended Libraries**:
- Recharts or Chart.js for data visualization
- date-fns for timestamp formatting and aggregation

### Priority 4: Sound Notifications

Audio cues improve awareness when users lose track of time.

**Estimated Effort**: ~1 hour with HTML5 Audio API  
**Risk Level**: Minimal (isolated implementation)

---

## 🤝 Contributing Guidelines

When extending this project, follow these principles:

1. **Maintain Single State Ownership**: FocusBoard remains the state authority
2. **Sanitize All User Inputs**: Apply DOMPurify before rendering any user content
3. **Preserve Keyboard Navigation**: Add ARIA labels and keyboard handlers for new interactive elements
4. **Use Tailwind Consistently**: Follow existing gradient and effect patterns
5. **Write Clear Component Names**: PascalCase, descriptive of responsibility

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with **React 18** - Modern component-based framework
- Styled with **Tailwind CSS v3.x** - Utility-first CSS framework
- Security via **DOMPurify** - XSS protection library
- Inspired by **Pomodoro Technique** - Time management method developed by Francesco Cirillo

---

## 📞 Support & Documentation

For detailed implementation guidance:

- **Component API**: See [docs/API.md](./docs/API.md)
- **Architecture Decisions**: See [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)
- **Code Review Findings**: See [docs/CODE_REVIEW.md](./docs/CODE_REVIEW.md)

---

*Last Updated: April 25, 2026*  
*Version: 1.0.0*
