# GitHub Talent Scout

**A React Native mobile app that helps recruiters discover and evaluate developers using real GitHub data.**

<!-- App Screenshots -->
## 📸 Screenshots

<p align="center">
  <img alt="image" src="https://github.com/user-attachments/assets/c6c36a95-4aa4-4dd8-bb1d-bf5f81b21df7" width="24%" /> 
  <img alt="image" src="https://github.com/user-attachments/assets/12c8d20e-6b50-4d59-8469-661a28d99e5d" width="24%" />    
  <img alt="image" src="https://github.com/user-attachments/assets/1b15e8b6-abcd-46b4-8d6b-ccb8feb4c261" width="24%" /> 
  <img alt="image" src="https://github.com/user-attachments/assets/be1655f6-6c20-4bd5-bed5-1365c05d2c01" width="24%" />
</p>

<!-- Add your app screenshots here -->

### 🚀 Download the App

<p align="center">
  <a href="https://drive.google.com/file/d/1DqXARZ7QbvqDmUkkthJb3MnJuIFJfzxj/view?usp=sharing">
    <img src="https://img.shields.io/badge/Android-APK-3DDC84?logo=android&logoColor=white&style=for-the-badge" />
  </a>
  <a href="https://drive.google.com/file/d/1fqpWZjWDBZpHC1Qpd6rJuKKIXqdlM7lY/view?usp=sharing">
    <img src="https://img.shields.io/badge/iOS-IPA-000000?logo=apple&logoColor=white&style=for-the-badge" />
  </a>
</p>

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
