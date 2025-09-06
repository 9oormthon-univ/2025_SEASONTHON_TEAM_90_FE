# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens, layouts, and navigation groups (e.g., `app/(auth)/login.tsx`).
- `components/`: Reusable UI components; prefer colocated styles.
- `features/`: Feature-specific modules (state, API, views).
- `shared/`: Cross-cutting utilities, hooks, and UI primitives.
- `assets/`: Images, fonts, and static files.
- `constants/` and `types/`: App-wide constants and TypeScript types.
- Config: `app.config.ts`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `eas.json`.

Import aliases (via Babel): `@` (repo root), `@features`, `@shared`.

## Build, Test, and Development Commands
- `npm start`: Launch Expo dev server (QR/device/simulator).
- `npm run android` / `npm run ios`: Build & run native app locally.
- `npm run web`: Run the web target.
- `npm test`: Run Jest (jest-expo preset) in watch mode.

Environment: put secrets in `.env` (typed via `expo-env.d.ts`). Do not commit secrets. Android config lives in `google-services.json`.

## Coding Style & Naming
- Indentation: spaces, size 2; LF endings; UTF-8 (`.editorconfig`).
- Language: TypeScript; prefer `.tsx` for React components.
- Components: PascalCase files (e.g., `UserCard.tsx`). Hooks: `useX.ts`.
- Routes: follow Expo Router conventions under `app/` (groups like `app/(main)/`).
- Styling: Tailwind/NativeWind classes in JSX; keep utility classes readable. The `prettier-plugin-tailwindcss` can sort classes if enabled in your editor.

## Testing Guidelines
- Framework: Jest with `jest-expo`; React test renderer available.
- Location: colocate tests or use `__tests__/`.
- Naming: `*.test.ts` / `*.test.tsx`.
- Run: `npm test`. Aim to cover hooks, utilities, and critical UI logic.

## Commit & Pull Request Guidelines
- Commits: Prefer Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, optional scope `fix(build): ...`). Keep messages imperative and concise.
- PRs: include a clear summary, linked issue(s), test plan, and screenshots for UI changes. Ensure `npm test` passes and the app runs on at least one target (Android/iOS/Web).

## Security & Configuration Tips
- Never commit secrets. Use `.env` and platform stores.
- Review `app.config.ts` for env usage and build-time settings.
- EAS builds use `eas.json`; align profiles with branch strategy.
