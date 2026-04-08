# Barista Scheduler - React Frontend

A dark mode React + TypeScript + Material-UI interface for the Barista Scheduler.

## Features

- 📋 **Editable Data Tables** - Manage 4 CSV data sources:
  - Volunteers (with skills)
  - Availability (per volunteer, per week)
  - Fixed Assignments (immutable pre-assignments)
  - Special Bonus Rules
  
- 📅 **Schedule Generation** - Run the Python scheduler via API with one click
- ✏️ **Manual Override** - Edit generated schedules before export
- 💾 **CSV Export** - Download final schedule as CSV
- 🌙 **Dark Mode UI** - Built with Material-UI dark theme

## Quick Start

### 1. Start Backend API (from parent directory)

```powershell
cd ..
python api.py
```

The API will run on `http://localhost:5000`

### 2. Start Frontend Dev Server (in frontend directory)

```powershell
pnpm install  # if not already done
pnpm dev
```

Frontend runs on `http://localhost:5173`

### 3. Open in Browser

Visit `http://localhost:5173/` and start scheduling!

## Technology Stack

- **React** 19 + **TypeScript** 5.9
- **Vite** 8 (build tool)
- **Material-UI** v7 (component library)
- **Axios** (HTTP client)
- **Dark mode** by default

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production  
- `pnpm preview` - Preview production build
- `pnpm lint` - Run linter

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
