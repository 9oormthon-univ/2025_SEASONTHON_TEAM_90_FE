# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Habiglow is a React Native (Expo) routine management app that helps users build habits through progressive overload and emotional tracking. Users can create routines, track completion with emotions and comments, and receive suggestions for difficulty adjustments.

## Common Development Commands

```bash
# Start development server
npm run start
expo start

# Run on platforms
npm run android
npm run ios  
npm run web

# Run tests
npm test
jest --watchAll

# Check project health
npm run doctor
expo doctor
```

## Architecture & Technology Stack

- **Framework**: React Native with Expo (~53.0.22)
- **Language**: TypeScript with strict mode
- **Routing**: Expo Router v5 with file-based routing
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand for global state + TanStack Query v5 for server state
- **Data Fetching**: Axios with TanStack React Query
- **Authentication**: Kakao Login + Expo Auth Session
- **Push Notifications**: Firebase Cloud Messaging
- **Icons**: Lucide React Native
- **Development**: Jest for testing, Prettier for code formatting

## Project Structure

```
app/                     # File-based routing (Expo Router)
├── (tabs)/             # Tab navigation screens
│   ├── home.tsx        # Main routine dashboard
│   ├── dashboard.tsx   # Analytics/insights
│   ├── my.tsx         # User profile
│   └── ranking.tsx    # Social features
├── _layout.tsx        # Root layout with providers
└── retrospect.tsx     # Retrospective modal

features/               # Feature-based modules
├── routine/           # Core routine functionality
│   ├── api/          # API calls and data fetching
│   ├── components/   # Routine-specific components
│   ├── hooks/        # Custom hooks for routine logic
│   ├── store/        # Zustand stores for routine state
│   └── types.ts      # TypeScript definitions
├── dashboard/        # Analytics and reporting
├── calendar/         # Calendar view with emotion heatmap
└── .gitkeep

shared/                # Reusable utilities
├── api/              # Common API utilities
└── components/       # Shared UI components

components/            # Legacy shared components
├── Common/           # Common UI components
├── useClientOnlyValue.ts
└── useColorScheme.ts

constants/            # App constants and configuration
types/               # Global type definitions
```

## Key Technical Concepts

### Path Aliases
- `@/*` - Any file in the project root
- `@features/*` - Features directory  
- `@shared/*` - Shared utilities

### Feature Architecture
Each feature follows a modular structure:
- `/api` - Data fetching and API calls
- `/components` - UI components specific to the feature
- `/hooks` - Custom React hooks
- `/store` - Zustand state management
- `/types.ts` - TypeScript type definitions

### State Management
- **Zustand**: Global application state (user preferences, app-wide data)
- **TanStack Query**: Server state management with caching and optimistic updates
- **Component State**: Local state using React hooks

### Progressive Overload System
Core business logic that automatically suggests routine difficulty adjustments based on recent performance:
- **상향 (Increase)**: Suggest higher targets when success rate is high
- **유지 (Maintain)**: Keep current difficulty when performance is stable  
- **하향 (Decrease)**: Suggest easier targets when struggling

### Styling System
- Uses NativeWind (Tailwind for React Native)
- App colors defined in `constants/Colors.ts`:
  - `brandPrimary`: #4B3A2B (brown)
  - `mute`: #9C8E80 (muted brown)
  - `white`: #FFFFFF
  - Light/dark theme variations with tints
- Tailwind custom theme colors in `tailwind.config.js`:
  - `primary`: #22C55E (green)
  - `warn`: #F59E0B (yellow)
  - `danger`: #EF4444 (red)
  - `bg`: #F3F4F6 (light gray)
- Custom fonts: PowerChocolate (`choco`), NanumPen (`nanum`)

## Development Workflow

### Branch & Commit Convention
Follow the established conventions in `docs/CONVENTION.md`:
- **Branches**: `<type>/<short-description>` (feat/, fix/, chore/, etc.)
- **Commits**: Use uppercase types (FEAT:, FIX:, REFACTOR:, etc.)
- **PRs**: Require review, no direct pushes to main

### Code Quality
- TypeScript strict mode enabled
- Prettier formatting with Tailwind CSS plugin for class sorting
- Prettier settings in package.json:
  - No single quotes
  - Semicolons required  
  - Trailing commas
  - 100 character line width
  - 2 space indentation

## Testing
- Jest with Expo preset
- Test files should be co-located with components or in `__tests__` directories
- Run `npm test` for watch mode testing

## Common Development Patterns

When working with this codebase:
1. **Feature Development**: Create new features in the `features/` directory following the established module structure
2. **Component Creation**: Check existing components in `components/Common/` for reusable patterns before creating new ones
3. **API Integration**: Use the shared API utilities and follow TanStack Query patterns for data fetching
4. **State Management**: Use Zustand for global state, TanStack Query v5 for server state
5. **Styling**: Use NativeWind classes, import colors from `@/constants/Colors`, refer to custom theme colors
6. **Authentication**: Integrate with Kakao Login and Expo Auth Session for user authentication
7. **Icons**: Use Lucide React Native for consistent iconography
8. **Type Safety**: Maintain strict TypeScript practices, define types in feature-specific `types.ts` files

## Important Notes

### Missing Index Route
The current routing setup is missing an `app/index.tsx` file, which causes "Page could not be found" errors at the root route. Create one of:
- `app/index.tsx` that redirects to `/(tabs)` for tab navigation
- `app/index.tsx` that exports the home component directly