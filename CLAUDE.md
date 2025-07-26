# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (runs vue-tsc type checking then vite build)
- `npm run preview` - Preview production build
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build Storybook for production

## SOLID Principles
- **S** - Single Responsibility: One reason to change
- **O** - Open/Closed: Open for extension, closed for modification
- **L** - Liskov Substitution: Subclasses replace superclasses seamlessly
- **I** - Interface Segregation: No unused interface dependencies
- **D** - Dependency Inversion: Depend on abstractions, not concretions

## Clean Code
- **Naming**: Intention-revealing, searchable names
- **Functions**: Small (<20 lines), single purpose, 0-3 parameters
- **Comments**: Explain "why", not "what"
- **Error Handling**: Language-appropriate patterns, fail fast

## AI-Specific
- **Modularity**: Small testable components, clear interfaces
- **State**: Minimize mutation, use immutable structures
- **Resilience**: Circuit breakers, exponential backoff
- **Testing**: Pure functions first, mock dependencies

## Organization
- **Structure**: Group related code, separate concerns
- **Dependencies**: Minimize externals, use injection
- **Documentation**: Document APIs, maintain ADRs

**Process Documentation**
- Document deployment procedures
- Maintain runbooks for operational tasks
- Document known limitations and workarounds
- Keep security considerations documented

## Performance and Scalability

**Efficiency Guidelines**
- Profile before optimizing
- Use appropriate data structures for the use case
- Implement caching strategically
- Monitor resource usage patterns

**Scalability Considerations**
- Design for horizontal scaling
- Avoid tight coupling between components
- Use asynchronous processing where appropriate

**Accessibility and Inclusive Design**
- Follow WCAG 2.1/2.2 accessibility guidelines
- Implement proper semantic HTML and ARIA labels
- Test with screen readers and keyboard navigation
- Ensure color contrast and responsive design

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

## Refactored Components
- Remember which components have been refactored

## React and Storybook Integration
- Do not change React components to vue, as react components work perfectly inside vom storybook mdx files

## Storybook Notes
- Remember, that this is the correct import: import { Meta } from '@storybook/addon-docs/blocks';