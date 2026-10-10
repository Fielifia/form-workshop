# Form Workshop

A web application for creating, configuring, validating, previewing, and exporting custom HTML forms.

## Requirements

- Node.js
- npm

## Getting started

1. Clone the repository.
2. Open a terminal in the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the local URL displayed in the terminal.

## Available scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server. |
| `npm run build` | Builds the application for production. |
| `npm run preview` | Previews the production build locally. |
| `npm test` | Runs the automated tests. |

## Project structure

- `src/app.js` — application entry point.
- `src/state/` — form configuration and state.
- `src/ui/` — user interface components.
- `src/services/` — validation and export logic.
- `src/styles/` — application styles.
- `test/` — automated tests.

## Current scope

The project is being developed as part of the 1DV610 course. The MVP focuses on configurable forms, validation, preview, and standalone HTML export.

See [`REQUIREMENTS.md`](./REQUIREMENTS.md) for the MVP requirements and acceptance criteria, and [`MODULE_REVIEW.md`](./MODULE_REVIEW.md) for a review of the validation modules.
