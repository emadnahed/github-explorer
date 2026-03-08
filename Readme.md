# GitHub Talent Scout – Developer Evaluation Tool for Recruiters

A **production-grade mobile application** built with **React Native and TypeScript** that empowers recruiters to **discover and evaluate software developers** using real GitHub data.

This project demonstrates **senior-level React Native engineering** while solving a genuine product problem: helping hiring teams make faster, data-driven decisions about developer candidates — without relying on self-reported CVs.

The application consumes the **GitHub Public REST API** to deliver rich developer insights with no authentication required.

---

# The Recruiter Problem This Solves

Traditional hiring workflows are slow and subjective:

- Recruiters manually review GitHub profiles one by one
- Activity level and project quality are hard to assess at a glance
- Language expertise is buried across dozens of repositories

**GitHub Talent Scout** turns the GitHub API into a structured hiring tool — surfacing the signals that matter most to engineering teams.

---

# Recruiter Workflow (Vision)

```
Discover  →  Evaluate  →  Shortlist  →  Compare  →  Share
```

Phase 1 covers **Discover** and **Evaluate** — search by username, view full profiles, browse repositories, and analyze language breakdowns.

---

# Application Overview

GitHub Talent Scout currently enables recruiters to:

- Search developers by GitHub username
- View developer profiles with bio, location, company, and stats
- Browse repository portfolios with quality signals
- Analyze language usage breakdown
- Bookmark candidates for quick revisit
- Skeleton loading states for a polished experience

---

# Project Objectives

This project demonstrates the engineering capabilities expected from a **Senior React Native Developer**, including:

- Designing a recruiter-focused product experience on mobile
- Handling API datasets with caching and rate-limit awareness
- Visualizing complex data (language charts)
- Optimizing mobile performance for list-heavy UIs

---

# Skills Demonstrated

## React Native Fundamentals

- Functional components
- Hooks-based architecture
- Custom hooks
- Reusable UI components
- Component-driven development

## TypeScript

- Strict typing
- API response modeling
- Navigation typing
- Type-safe state management
- Generic utilities

## Mobile Architecture

- Feature-based modular architecture
- Separation of concerns
- Scalable folder structure
- Maintainable project conventions

## State Management

- Redux Toolkit
- Async thunks
- Global state orchestration
- State normalization
- Memoized selectors with Reselect

## Navigation Systems

- React Navigation
- Native stack navigator
- Bottom tab navigator
- Nested navigators
- Dynamic routing with params

## API Integration

- GitHub REST API (users, repos, languages)
- Axios networking layer
- Rate-limit handling
- Error recovery strategies

## Data Visualization

- Custom SVG donut chart (react-native-svg)
- Language breakdown visualization

## Performance Optimization

- FlatList virtualization
- React.memo, useMemo, useCallback
- Memoized selectors
- Optimized image loading (GitHub avatars)
- removeClippedSubviews

## Offline Caching

- MMKV local storage
- Per-user cache with 1-hour TTL
- Bookmarks and search history persisted locally

---

# Architecture

The application follows a **feature-driven modular architecture**.

```text
src
│
├── api
│   ├── githubApi.ts
│   └── githubService.ts
│
├── components
│   ├── ProfileHeader.tsx
│   ├── RepoCard.tsx
│   ├── SearchBar.tsx
│   ├── LanguageChart.tsx
│   ├── StatsCard.tsx
│   └── SkeletonLoader.tsx
│
├── features
│   └── github
│        ├── SearchScreen.tsx
│        ├── ProfileScreen.tsx
│        ├── RepositoriesScreen.tsx
│        ├── LanguageInsightsScreen.tsx
│        ├── githubSlice.ts
│        └── githubSelectors.ts
│
├── navigation
│   ├── RootNavigator.tsx
│   └── ProfileNavigator.tsx
│
├── hooks
│   ├── useGithubUser.ts
│   └── useTheme.ts
│
├── store
│   ├── store.ts
│   └── hooks.ts
│
└── utils
    ├── theme.ts
    ├── storage.ts
    ├── helpers.ts
    └── chartHelpers.ts
```

---

# API Integration

The application uses the **GitHub Public REST API**.

Base URL:

```text
https://api.github.com
```

Endpoints used:

```text
/users/{username}
/users/{username}/repos
/repos/{owner}/{repo}/languages
```

---

# Screens

## 1. Search Screen

Primary recruiter entry point.

Features:

- Search by GitHub username (direct lookup)
- Search history chips (persisted via MMKV)
- Bookmarked candidate quick-access

Displays per result:

- Avatar
- Name and username
- Follower count
- Repository count

---

## 2. Developer Profile Screen

Full profile view for a candidate.

Displays:

- Avatar, name, username
- Bio and professional links
- Location, company, email, blog
- Stats: repos, followers, following
- Member since date
- Bookmark action

---

## 3. Repositories Screen

Lists all public repositories.

Each repository card shows:

- Repository name and description
- Star count and fork count
- Primary language (color-coded dot)
- Last updated (time-ago format)
- Fork badge on forked repos

Supports sorting by:

- Stars
- Recently updated
- Alphabetical

---

## 4. Language Insights Screen

Visualizes the developer's technology stack.

Displays:

- Donut chart — language distribution across top 10 repos
- Percentage breakdown with language color legend
- Total code volume analyzed
- Repositories analyzed count

---

# Data Visualization

## Language Distribution Chart

Custom SVG donut chart built with react-native-svg. No third-party chart library. Each language segment uses GitHub's official language colors.

---

# Performance Optimization

FlatList configuration:

```text
initialNumToRender={10}
maxToRenderPerBatch={10}
windowSize={5}
removeClippedSubviews
```

Memoization:

- React.memo on all list item components
- useMemo for sorted and filtered lists
- useCallback for all event handlers
- createSelector for derived Redux state

GitHub avatars are cached to prevent repeated downloads.

---

# Offline Support

All developer data is cached locally per username.

Storage: MMKV

Cache TTL: 1 hour per user

Recruiter-specific data persisted indefinitely:

- Bookmarks
- Search history

---

# Security Considerations

The GitHub API is public. The application follows best practices:

- Safe network handling with axios timeout and error recovery
- No sensitive credentials stored

Future: authenticated GitHub requests for higher rate limits (5000 req/hr vs 60 req/hr).

---

# Installation

Clone the repository.

```bash
git clone https://github.com/yourusername/github-talent-scout.git
cd github-talent-scout
npm install
```

Run iOS:

```bash
npx expo run:ios
```

Run Android:

```bash
npx expo run:android
```

---

# Tech Stack

Core:

- React Native + Expo
- TypeScript

State Management:

- Redux Toolkit

Navigation:

- React Navigation (native stack + bottom tabs)

Networking:

- Axios

Charts:

- react-native-svg (custom donut chart, no external chart library)

Storage:

- react-native-mmkv

---

# Build Phases

---

## Phase 1 — Core Architecture `[COMPLETE]`

All foundational files are written and the app is runnable after `npm install`.

### What was built

| Area | Files |
|---|---|
| Config | `package.json`, `app.json`, `babel.config.js`, `tsconfig.json`, `metro.config.js` |
| Entry | `App.tsx` |
| API | `src/api/githubApi.ts`, `src/api/githubService.ts` |
| State | `src/features/github/githubSlice.ts`, `src/features/github/githubSelectors.ts` |
| Store | `src/store/store.ts`, `src/store/hooks.ts` |
| Screens | `SearchScreen.tsx`, `ProfileScreen.tsx`, `RepositoriesScreen.tsx`, `LanguageInsightsScreen.tsx` |
| Components | `ProfileHeader`, `RepoCard`, `SearchBar`, `LanguageChart`, `StatsCard`, `SkeletonLoader` |
| Navigation | `RootNavigator.tsx` (stack), `ProfileNavigator.tsx` (bottom tabs) |
| Hooks | `useGithubUser.ts`, `useTheme.ts` |
| Utils | `theme.ts`, `storage.ts`, `helpers.ts`, `chartHelpers.ts` |

### How to run

```bash
npm install
npx expo start
```

---

## Phase 2 — Recruiter Features `[NEXT]`

Adds the Developer Score system, candidate search by language/location/followers, and private recruiter notes.

Key deliverables: `scoringHelpers.ts`, `DeveloperScore.tsx`, `FilterPanel.tsx`, search API integration, notes persistence.

---

## Phase 3 — Shortlists and Comparison `[TODO]`

Adds candidate pipeline management and side-by-side comparison.

Key deliverables: `ShortlistsScreen.tsx`, `CompareScreen.tsx`, `CompareCard.tsx`.

---

## Phase 4 — Testing `[TODO]`

Full test coverage for components, logic, and user flows.

Frameworks: Jest + React Native Testing Library + Detox (E2E).

---

## Phase 5 — Polish and DevOps `[TODO]`

Production readiness: app icons, splash screen, GitHub Actions CI pipeline, accessibility audit.

---

# Future Enhancements

- Authenticated GitHub requests (higher rate limits)
- Developer Score system (0–100 composite)
- Team collaboration (shared shortlists)
- Export candidate PDF report
- GitHub trending developers discovery
- Repository commit frequency graphs
- Pull request and issue activity signals
- Organization membership detection

---

# Author

Built as a **professional portfolio project** demonstrating advanced mobile engineering practices with React Native — applied to a real-world recruiter tool use case.

---

# License

MIT License
