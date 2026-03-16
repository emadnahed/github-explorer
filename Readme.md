# GitHub Talent Scout

**A React Native mobile app that helps recruiters discover and evaluate developers using real GitHub data.**

## 📱 Download

<!-- APK/IPA Links -->
[![Android APK](https://img.shields.io/badge/Android-APK-green?style=for-the-badge&logo=android)](#)
[![iOS IPA](https://img.shields.io/badge/iOS-IPA-blue?style=for-the-badge&logo=ios)](#)

<!-- App Screenshots -->
## 📸 Screenshots

<!-- Add your app screenshots here -->

## ✨ Features

- **Search** developers by GitHub username
- **View** complete developer profiles with stats
- **Browse** repository portfolios with quality signals
- **Analyze** language usage breakdown with custom charts
- **Bookmark** candidates for quick access
- **Offline** caching with MMKV storage

## 🏗️ Tech Stack

- **React Native + Expo** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management
- **React Navigation** - Navigation system
- **Axios** - GitHub API integration
- **React Native SVG** - Custom data visualization
- **MMKV** - High-performance storage

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/github-talent-scout.git
cd github-talent-scout
npm install
npx expo start
```

Run on iOS:
```bash
npx expo run:ios
```

Run on Android:
```bash
npx expo run:android
```

## 📋 Project Status

**Phase 1** ✅ Complete - Core architecture and all screens
**Phase 2** 🔄 Next - Developer scoring and advanced search
**Phase 3** ⏳ TODO - Shortlists and comparison features
**Phase 4** ⏳ TODO - Testing coverage
**Phase 5** ⏳ TODO - Production polish

## 🎯 Recruiter Workflow

```
Discover → Evaluate → Shortlist → Compare → Share
```

Phase 1 covers **Discover** and **Evaluate** - search developers, view profiles, analyze repositories, and assess language expertise.

## 📊 Architecture

Feature-driven modular structure:
- `api/` - GitHub API integration
- `components/` - Reusable UI components
- `features/github/` - Core GitHub functionality
- `navigation/` - App navigation
- `hooks/` - Custom React hooks
- `store/` - Redux state management
- `utils/` - Helper functions and utilities

## 📈 API Integration

Uses GitHub Public REST API:
- `/users/{username}` - User profiles
- `/users/{username}/repos` - Repository lists
- `/repos/{owner}/{repo}/languages` - Language breakdown

## 🔧 Performance

- **FlatList** virtualization for smooth scrolling
- **React.memo**, **useMemo**, **useCallback** optimizations
- **MMKV** caching with 1-hour TTL
- **GitHub avatar** caching

## 📜 License

MIT License
