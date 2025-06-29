# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-06-29

### 🏗️ Build System

- **pnpm Migration**: Migrate from npm to pnpm across all configurations
- **CI/CD Improvements**: Update GitHub Actions workflows to use pnpm with frozen lockfiles
- **Documentation**: Update README with pnpm commands and installation instructions
- **Release Pipeline**: Configure standard-version to use pnpm for prerelease checks
- **Performance**: Improve build consistency and speed with pnpm workspace features

### 💎 Styles

- **Code Formatting**: Fix code style issues in GitHub workflows and update notification component

## [1.0.0] - 2025-06-29

### ✨ Features

- **Initial release**: Push-Up Counter PWA with full functionality
- **Counter**: Manual push-up counting with tap interface
- **Statistics**: Daily, weekly, and monthly progress tracking
- **Charts**: Visual progress representation with Recharts
- **PWA Support**: Full Progressive Web App functionality
- **Offline Mode**: Works completely offline with IndexedDB storage
- **Responsive Design**: Mobile-first design with Tailwind CSS v4
- **Dark/Light Theme**: Theme switching with system preference detection
- **Data Export**: Export workout data to JSON/CSV
- **Goal Setting**: Customizable daily push-up goals
- **Notifications**: Push notifications for workout reminders (when supported)

### 🏗️ Build System

- **React 19**: Latest React with TypeScript strict mode
- **Vite 6**: Lightning-fast build tool with hot reload
- **Tailwind CSS v4**: Latest version with OKLCH color space
- **shadcn/ui**: Beautiful and accessible UI components
- **ESLint + Prettier**: Code quality and formatting
- **Husky + lint-staged**: Pre-commit hooks for code quality

### 🧪 Tests

- Basic test setup with Vitest (tests to be implemented)

### 📚 Documentation

- Comprehensive README with setup instructions
- Project requirements document
- Tailwind v4 migration guide
- Contributing guidelines

### 🔧 Developer Experience

- TypeScript strict mode
- Hot reload development
- Code formatting and linting
- Pre-commit hooks
- CI/CD pipeline with GitHub Actions

---

## Legend

- ✨ Features - New functionality
- 🐛 Bug Fixes - Bug fixes
- ⚡ Performance - Performance improvements
- ♻️ Refactor - Code refactoring
- 📚 Documentation - Documentation changes
- 💎 Styles - UI/UX improvements
- 🧪 Tests - Testing improvements
- 🏗️ Build - Build system changes
- 👷 CI/CD - CI/CD improvements
- 🔧 Chores - Maintenance tasks
