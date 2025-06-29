# 💪 Push-Up Counter PWA

A modern Progressive Web Application for tracking push-up workouts, built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **🎯 Push-Up Counter**: Large, easy-to-tap button for counting push-ups
- **⏱️ Workout Timer**: Track your workout duration automatically
- **📊 Statistics & Analytics**: View your progress with interactive charts
- **🏆 Progress Tracking**: Daily goals and achievement system
- **🌙 Dark/Light Theme**: Toggle between themes for comfort
- **💾 Offline Support**: Works completely offline with local data storage
- **📱 PWA Ready**: Install on any device as a native app
- **🔊 Audio Feedback**: Optional sound effects for interactions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: IndexedDB with Dexie.js
- **Charts**: Recharts for data visualization
- **State Management**: Zustand
- **PWA**: Vite PWA plugin with Workbox
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd push-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📱 PWA Installation

1. Open the app in a modern browser (Chrome, Firefox, Safari)
2. Look for the "Install" button or "Add to Home Screen" option
3. Follow the browser prompts to install
4. The app will appear as a native app on your device

## 🎮 How to Use

### Counter Screen

1. Tap **"Начать"** (Start) to begin your workout
2. Tap the large counter button for each push-up completed
3. Use **"Пауза"** (Pause) to take breaks
4. **"Сохранить тренировку"** (Save Workout) to store your session

### Stats Screen

- View daily, weekly, and monthly progress
- Track your total push-ups and current streak
- See interactive charts of your workout history
- Monitor personal records and achievements

### Settings Screen

- Set daily push-up goals
- Toggle dark/light theme
- Enable/disable sound effects
- Export your workout data

## 📊 Data Storage

- All data is stored locally using IndexedDB
- No internet connection required after installation
- Data persists across browser sessions
- Export functionality for backup

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Counter.tsx     # Main workout counter
│   ├── Stats.tsx       # Statistics and charts
│   ├── Settings.tsx    # App settings
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── services/           # Database and PWA services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Design Philosophy

- **Mobile-First**: Optimized for touch interactions
- **Accessible**: High contrast, large touch targets
- **Intuitive**: Simple, focused user interface
- **Performance**: Fast loading and smooth animations
- **Offline-Ready**: Full functionality without internet

## 🔧 Configuration

### Customizing Goals

Edit `src/hooks/useWorkoutStore.ts` to change default daily goals:

```typescript
const initialSettings: AppSettings = {
  dailyGoal: 50, // Change this number
  // ... other settings
};
```

### Theming

Modify `src/index.css` and `tailwind.config.js` for custom themes.

## 🔄 Recent Updates

### Tailwind CSS v4 Migration

The project has been successfully upgraded to Tailwind CSS v4 with the following improvements:

- **🚀 Faster builds**: 95% improvement in build time (from ~48s to ~2s)
- **🎨 Better colors**: Migration to OKLCH color space for improved color accuracy
- **⚡ Simplified config**: Removed legacy config files, using Vite plugin
- **🔧 Automatic optimization**: Built-in CSS optimization and purging

For detailed migration information, see [TAILWIND_V4_MIGRATION.md](./TAILWIND_V4_MIGRATION.md)

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Manual Build and Preview

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables

For production deployment, ensure these are set:

```bash
NODE_ENV=production
# Base URL for GitHub Pages (automatically handled)
```

### Custom Domain

To use a custom domain:

1. Add `CNAME` file to `public/` directory with your domain
2. Update `base` in `vite.config.ts` to `'/'`
3. Configure DNS settings with your domain provider

## 🏷️ Versioning & Releases

This project follows [Semantic Versioning](https://semver.org/) (SemVer) and uses [Conventional Commits](https://www.conventionalcommits.org/).

### Version Format

- **MAJOR** version: incompatible API changes
- **MINOR** version: new functionality in a backward compatible manner
- **PATCH** version: backward compatible bug fixes

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `style`: formatting, missing semicolons, etc.
- `refactor`: code refactoring
- `perf`: performance improvements
- `test`: adding tests
- `build`: build system changes
- `ci`: CI configuration changes
- `chore`: maintenance tasks

### Creating Releases

```bash
# Automatic version bump based on conventional commits
npm run release

# Specific version type
npm run release:patch  # 1.0.0 -> 1.0.1
npm run release:minor  # 1.0.0 -> 1.1.0
npm run release:major  # 1.0.0 -> 2.0.0

# Dry run to see what would be released
npm run release:dry
```

### Release Process

1. **Automatic**: Push to `main` branch triggers release workflow if conventional commits are detected
2. **Manual**: Use GitHub Actions "Release" workflow with version type selection
3. **Quality Gates**: All tests, linting, and builds must pass before release
4. **Changelog**: Automatically updated based on commit messages
5. **GitHub Release**: Created with build artifacts and release notes

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icon set
- [Recharts](https://recharts.org/) for the charting library
- [Dexie.js](https://dexie.org/) for IndexedDB management

## 🐛 Known Issues

- Service worker updates may require manual refresh
- iOS Safari requires specific PWA meta tags (included)
- Charts may not render on very old browsers

## 🔮 Future Features

- [ ] Social features and challenges
- [ ] Multiple exercise types
- [ ] Workout plans and programs
- [ ] Cloud synchronization
- [ ] Wearable device integration
- [ ] AI-powered coaching tips

---

**Made with ❤️ for fitness enthusiasts**
