# Scheduling Tool

A lightweight scheduling dashboard for tracking instructors, the classes they teach, session durations, and assigned rooms. The tool keeps a running tally of total scheduled hours for every instructor.

## Features

- Add class sessions with instructor, class name, duration, and room details.
- Automatically calculate total scheduled hours per instructor.
- Remove individual sessions or clear the entire schedule.
- Responsive layout with support for light and dark themes.
- Persists data in the browser using `localStorage`.

## Getting Started

1. Open `index.html` in your preferred browser.
2. Use the **Add Class Session** form to log new class sessions.
3. Review the **Class Schedule** table for an overview of all sessions.
4. Track total instructor hours in the **Instructor Hours** section.

No additional build steps or dependencies are required.

## Development Notes

- All logic lives in `script.js`, which handles validation, rendering, and persistence.
- Styling is provided by `styles.css` and includes dark-mode adjustments via the `prefers-color-scheme` media query.
