# School Management Tool - Complete Style Guide

## Overview
This guide provides exact details to recreate the School Management Tool website with its specific minimalist design, color scheme, and functionality.

## Design Philosophy
- **Minimalist & Functional**: Clean interface with focus on usability
- **Monospace Typography**: Technical aesthetic using JetBrains Mono font
- **Dual Theme Support**: Light and dark modes with smooth transitions
- **Grid-Based Layouts**: CSS Grid for consistent structure
- **Subtle Interactions**: Hover states and micro-animations

## Color System

### CSS Custom Properties (Root Variables)
```css
:root {
  --bg: #F9F7F7;        /* Main background - warm white */
  --panel: #DBE2EF;     /* Panel backgrounds - light blue-gray */
  --accent: #3F72AF;    /* Primary accent - medium blue */
  --text: #112D4E;      /* Primary text - dark blue */
}

.dark {
  --bg: #112D4E;        /* Main background - dark blue */
  --panel: #1d3c66;     /* Panel backgrounds - darker blue */
  --accent: #3F72AF;    /* Primary accent - medium blue (unchanged) */
  --text: #F9F7F7;      /* Primary text - warm white */
}
```

### Color Usage Rules
- `--bg`: Main page background
- `--panel`: Component backgrounds, borders, hover states
- `--accent`: Primary buttons, links, headings, important elements
- `--text`: Body text, button text, labels

## Typography System

### Font Loading
```css
@font-face {
  font-family: JetBrainsMono;
  src: url("JetBrainsMonoNerdFont-Medium.ttf");
}

body {
  font-family: JetBrainsMono, monospace;
}
```

### Typography Hierarchy
- **Page Titles**: 18px, bold, ALL CAPS
- **Section Headers**: 24px (settings), 20px (stats), 18px (panels)
- **Body Text**: 14px normal
- **Small Text**: 12px (subject labels)
- **Buttons**: 16px (primary), 14px (secondary), 12px (tertiary)

### Text Styling Rules
- ALL CAPS for all titles and headers
- Letter spacing: 1px for subject labels
- Consistent monospace aesthetic throughout
- No font variations beyond the primary monospace

## Layout Structure

### Header (Consistent across all pages)
```html
<header>
  <div class="title">PAGE_TITLE</div>
  <nav>
    <a href="index.html">DASHBOARD</a>
    <a href="tasks.html">TASKS</a>
    <a href="calendar.html">CALENDAR</a>
    <a href="stats.html">STATS</a>
  </nav>
  <div class="controls">
    <button class="gear-icon" id="gearIcon">⚙</button>
    <div id="clock"></div>
  </div>
</header>
```

### Header CSS
```css
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  border-bottom: 2px solid var(--accent);
  background: var(--panel);
}

.title {
  font-size: 18px;
  font-weight: bold;
}

nav a {
  margin-right: 18px;
  text-decoration: none;
  color: var(--text);
}

nav a:hover {
  color: var(--accent);
}

.controls {
  display: flex;
  align-items: center;
  gap: 15px;
}
```

### Main Content Area
```css
main {
  padding: 30px;
}
```

## Component System

### Panel Component
```css
.panel {
  border: 2px solid var(--panel);
  padding: 20px;
  background: var(--bg);
}

.panel h3 {
  margin-bottom: 10px;
  color: var(--accent);
}
```

### Button System

#### Primary Buttons
```css
button {
  background: var(--accent);
  color: #F9F7F7;
  border: 2px solid var(--accent);
  padding: 8px 14px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

button:hover {
  background: var(--panel);
  color: var(--text);
}

button:active {
  background: var(--text);
  color: #F9F7F7;
}
```

#### Secondary Buttons (Edit/Delete)
```css
.edit-btn, .delete-btn {
  background: transparent;
  color: var(--text);
  border: 2px solid var(--panel);
}

.edit-btn:hover, .delete-btn:hover {
  background: var(--panel);
}
```

#### Gear Icon Button
```css
.gear-icon {
  font-size: 18px;
  color: var(--text);
  background: transparent;
  border: 2px solid transparent;
  padding: 6px 8px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.gear-icon:hover {
  color: var(--accent);
  background: var(--panel);
  border-color: var(--panel);
}
```

### Form Elements
```css
input, select, textarea {
  padding: 8px;
  border: 2px solid var(--panel);
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
}

input:focus, select:focus, textarea:focus {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
```

## Grid Layouts

### Dashboard Grid (3 columns)
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}
```

### Tasks Grid (3 columns)
```css
.tasks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

### Stats Grid (2 columns)
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
```

### Calendar Grid (5 columns)
```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.calendar-grid div {
  border: 2px solid var(--panel);
  padding: 12px;
  min-height: 60px;
}

.day {
  min-height: 90px;
}
```

## Task Card Component
```css
.task {
  border: 2px solid var(--panel);
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: appear 0.25s;
}

.task.done {
  opacity: 0.5;
  text-decoration: line-through;
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-subject {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--accent);
}

.task-text {
  font-size: 14px;
}

.task-actions {
  display: flex;
  gap: 8px;
}
```

## Modal System

### Modal Overlay
```css
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  background: var(--bg);
  border: 2px solid var(--panel);
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  margin: 50px auto;
  position: relative;
}

.modal-content h2 {
  color: var(--accent);
  margin-bottom: 20px;
  text-align: center;
}
```

### Form Styling in Modals
```css
.modal-content label {
  display: block;
  margin-bottom: 5px;
  margin-top: 15px;
  color: var(--text);
}

.modal-content input,
.modal-content textarea,
.modal-content select {
  width: 100%;
  margin-bottom: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}
```

## Settings Menu

### Settings Menu Structure
```css
.settings-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  justify-content: center;
  align-items: center;
}

.settings-menu.show {
  display: flex;
}

.settings-content {
  background: var(--bg);
  border: 2px solid var(--panel);
  border-radius: 8px;
  padding: 60px;
  min-width: 400px;
  max-width: 500px;
  text-align: center;
}

.settings-content h3 {
  color: var(--accent);
  margin-bottom: 20px;
  font-size: 24px;
}

.settings-content button {
  width: 100%;
  font-size: 16px;
  padding: 12px 24px;
}
```

## Notification System

### Toast Notifications
```css
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--panel);
  border: 2px solid var(--accent);
  border-radius: 8px;
  padding: 15px 20px;
  min-width: 250px;
  max-width: 350px;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateX(400px);
  opacity: 0;
  transition: all 0.3s ease;
}

.notification.show {
  transform: translateX(0);
  opacity: 1;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-message {
  color: var(--text);
  font-size: 14px;
  line-height: 1.4;
}
```

## Animations

### Appear Animation
```css
@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Arrow Toggle Animation
```css
.arrow {
  display: inline-block;
  transition: transform 0.2s;
  font-size: 12px;
}

.arrow.expanded {
  transform: rotate(90deg);
}
```

## JavaScript Functionality

### Theme Toggle
```javascript
const toggle = document.getElementById("themeToggle");

if (localStorage.theme === "dark") {
  document.body.classList.add("dark");
}

if (toggle) {
  toggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light";
  };
}
```

### Live Clock
```javascript
document.addEventListener("DOMContentLoaded", () => {
  const clock = document.getElementById("clock");
  if (!clock) return;

  clock.textContent = new Date().toLocaleTimeString();

  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString();
  }, 1000);
});
```

### Settings Menu Toggle
```javascript
const gearIcon = document.getElementById("gearIcon");
const settingsMenu = document.getElementById("settingsMenu");

function toggleSettingsMenu() {
  settingsMenu.classList.toggle("show");
}

function closeSettingsMenu() {
  settingsMenu.classList.remove("show");
}

if (gearIcon) {
  gearIcon.onclick = (e) => {
    e.stopPropagation();
    toggleSettingsMenu();
  };
}

// Close when clicking outside
window.onclick = (event) => {
  if (event.target === settingsMenu) {
    closeSettingsMenu();
  }
};
```

## File Structure

### Required Files
1. **index.html** - Dashboard page
2. **tasks.html** - Task management page
3. **calendar.html** - Calendar view
4. **stats.html** - Statistics page
5. **style.css** - All styling
6. **script.js** - All JavaScript functionality
7. **JetBrainsMonoNerdFont-Medium.ttf** - Font file
8. **favicon.svg** - Site favicon

### HTML Structure Pattern
Each HTML file follows this structure:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PAGE_TITLE</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
</head>
<body>
  <header><!-- Consistent header --></header>
  <main><!-- Page-specific content --></main>
  <script src="script.js"></script>
</body>
</html>
```

## Implementation Checklist

### CSS Requirements
- [ ] Define CSS custom properties for colors
- [ ] Load JetBrains Mono font
- [ ] Style header with navigation
- [ ] Create panel component styles
- [ ] Implement button system with states
- [ ] Style form elements
- [ ] Create grid layouts
- [ ] Style task cards
- [ ] Implement modal system
- [ ] Create settings menu styles
- [ ] Add notification system
- [ ] Include animations and transitions

### JavaScript Requirements
- [ ] Theme toggle functionality
- [ ] Live clock display
- [ ] Settings menu toggle
- [ ] Task CRUD operations
- [ ] Modal management
- [ ] Notification system
- [ ] LocalStorage management
- [ ] Form validation
- [ ] Dynamic content rendering

### HTML Requirements
- [ ] Consistent header structure
- [ ] Navigation menu
- [ ] Page-specific main content
- [ ] Modal structures
- [ ] Settings menu structure
- [ ] Form elements
- [ ] Semantic HTML5 structure

## Browser Compatibility
- Modern browsers supporting CSS Grid
- CSS custom properties (variables)
- ES6+ JavaScript features
- LocalStorage API

This guide provides exact specifications to recreate the School Management Tool with pixel-perfect accuracy in both design and functionality.
