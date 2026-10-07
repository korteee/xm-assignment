You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

# Project: xm-assignment

A photo library: an infinite random photostream with a persistent "Favorites" list. This repo is public and reviewed, so keep code clean and the git history tidy.

## Stack

- Angular 22 (latest), SCSS, Angular Router, Angular Material (Material 3), Vitest, ESLint (`angular-eslint`) + Prettier.
- No backend, no infinite-scroll library, no Tailwind. State lives in the browser (`localStorage`).
- Run with `npx ng serve`, test with `npx ng test --no-watch`, lint with `npx ng lint`.
- Needs Node 22.22.3+ (or 24.15+).

## Architecture

Standalone components only (no NgModules). Structure by responsibility:

- `src/app/core/` - singleton services (data access, state, storage).
- `src/app/shared/` - reusable UI components and directives, free of page-specific logic.
- `src/app/features/` - lazy-loaded route pages, one folder per page.
- App-wide chrome (such as the header) lives in the app shell, outside the routed pages.

Feature pages stay thin: they compose shared components and core services instead of duplicating them.

## Specs

Behavior is defined in OpenSpec: `openspec/specs/<capability>/spec.md` is the source of truth, and `ASSIGNMENT.md` is the original brief. Change behavior through a change (`/opsx:propose`, then `/opsx:apply`), not by editing code or specs directly.

## Conventions

- Look up library APIs (Angular, Material, RxJS, Vitest) with the Context7 MCP (declared in `.mcp.json`) before using or deciding on them, not from memory. Do this before every OpenSpec design.
- Short JSDoc on services, directives, and public component inputs/outputs. No comment noise; comment the why, not the what.
- Clickable photos are real `<button>` or `<a>` elements, never clickable `div`s. Images need meaningful `alt` text, focus must be visible, and the loader must be announced.
- Format with Prettier and fix all `ng lint` findings; do not disable rules to get green.
- Unit tests (see TDD below): test every service and component, using Vitest. Fake the delay (fake timers) instead of waiting, and mock `IntersectionObserver` for the directive. Add one integration-style test per route.

## Development process: TDD (mandatory)

Work test-first, in red-green-refactor cycles, one behavior at a time:

1. **Red:** write one failing test that describes the next behavior. Run it and confirm it fails for the right reason.
2. **Green:** write the minimum code to make it pass. No speculative code.
3. **Refactor:** clean up with the tests green, then run the full suite.

Rules:

- No production code without a failing test first. This includes services, directives, components, guards, and routes.
- Test behavior through public interfaces (inputs, outputs, rendered DOM, service methods), not implementation details, so refactors don't break tests.
- Never write all the tests up front. Build vertically: one test, one implementation, repeat.
- Do not edit a test to make it pass unless the requirement itself changed. If a test fails, fix the code.
- Bug fixes start with a failing test that reproduces the bug.
- Keep the whole suite green and run it before every commit (`npx ng test --no-watch`). Commit tests and the code that satisfies them together, or the test first (`test:`) then the code (`feat:`).

## Git

- Commit only when the user asks. Use Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), small and focused, on `main`. Do not squash.
- `README.md` only explains how to run the project locally; keep architecture notes here.

# Angular guidelines

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
