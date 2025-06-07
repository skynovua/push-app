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
- **Styling**: Tailwind CSS + shadcn/ui components
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

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

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
