# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (runs vue-tsc type checking then vite build)
- `npm run preview` - Preview production build
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build Storybook for production

## Testing

The project uses Vitest with Storybook test integration and browser testing via Playwright. Tests are configured to run in Chromium browser with headless mode enabled.

## Architecture Overview

This is a Vue 3 component library built with TypeScript, using the Composition API exclusively. The project follows a **compound component pattern** for complex UI components.

### Key Architectural Decisions

1. **BEM + SCSS Styling**: All components use BEM (Block Element Modifier) naming convention with SCSS. CSS Custom Properties from `src/styles/tokens.css` are used for design system tokens.

2. **Compound Components**: Complex components (like SpDropdown) use a compound pattern with:
   - Root component providing context via `provide()`
   - Child components accessing context via `inject()`
   - Dedicated composables (e.g., `useDropdown.ts`) for state management

3. **Scoped Styles**: All component styles use `<style scoped>` to prevent conflicts

### Component Structure

Vue components follow this strict structure:
1. `<template>` first
2. `<script setup lang="ts">` with this order:
   - `import` statements
   - Variables (`let`, `const`, `ref`)
   - `defineModel()` for v-model
   - `defineProps()` for properties
   - `defineEmits()` for events
   - Vue lifecycle functions
   - Other Vue functions (`watch`, etc.)
   - Custom functions
3. `<style scoped>` last

### File Naming Conventions

- Vue components: PascalCase (e.g., `SpDropdown.vue`)
- Storybook files: `.stories.ts` extension
- Type files: `.types.ts` extension
- Test files: `.spec.ts` extension
- Composables: camelCase starting with `use` (e.g., `useDropdown.ts`)

### Development Guidelines

- Always use TypeScript (`lang="ts"`)
- Use Composition API exclusively
- Define props with explicit types using `defineProps<T>()`
- Define emits with explicit types using `defineEmits<T>()`
- Use CSS Custom Properties for theming (from `src/styles/tokens.css`)
- Follow BEM naming for CSS classes
- Limit CSS nesting to 3 levels maximum
- All interactive elements must be accessible

### Storybook Integration

- Every component should have corresponding `.stories.ts` file
- Each component state gets its own story
- Use play functions for interaction testing
- Chromatic integration for visual regression testing