import type { Translations } from './ua';

const enTranslations: Translations = {
  // Common
  common: {
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    save: 'Save',
    close: 'Close',
    settings: 'Settings',
    stats: 'Statistics',
    counter: 'Counter',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    total: 'Total',
    goal: 'Goal',
    progress: 'Progress',
    achievements: 'Achievements',
    export: 'Export',
    import: 'Import',
    success: 'Success',
    error: 'Error',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },

  // Counter
  counter: {
    title: 'Training',
    progressToGoal: 'Progress to Goal',
    currentSession: 'Current Session',
    sessionTime: 'Session Time',
    dailyGoal: 'Daily Goal',
    sessionCompleted: 'Session completed!',
    goalReached: 'Goal reached!',
    keepGoing: 'Ready to train?',
    totalToday: 'Total today',
    startHint: 'Click "Start" to start training',
    clickHint: 'Click the big button to count push-ups',
    almostThere: 'Almost there!',
    workoutSaved: 'Workout saved!',
    pushUpsCompleted: 'push-ups completed',
    // Additional keys
    sessionStarted: 'Session started!',
    sessionPaused: 'Session paused',
    sessionReset: 'Session reset',
    sessionSaved: 'Session saved!',
    dailyProgress: 'Daily Progress',
    clickToIncrement: 'Click to add push-up',
    pushUps: 'push-ups',
    time: 'Time',
    count: 'Count',
    startPrompt: 'Click "Start" to begin training',
    tapHint: 'Tap to count push-ups'
  },

  // Statistics
  stats: {
    title: 'Statistics',
    subtitle: 'Your progress and achievements',
    totalPushUps: 'Total Push-ups',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    averagePerDay: 'Average per Day',
    totalSessions: 'Total Sessions',
    totalTime: 'Total Time',
    weekProgress: 'Week Progress',
    monthProgress: 'Month Progress',
    pushUpsPerDay: 'Push-ups per Day',
    noDataYet: 'No data yet',
    startWorkout: 'Start a workout to see statistics!',
    daysStreak: 'days in a row',
    onFire: 'On Fire!',
    greatProgress: 'Great Progress!',
    keepItUp: 'Keep it up!',
    loading: 'Loading statistics...',
    yourProgress: 'Your progress and achievements',
    forWorkouts: 'for workouts',
    pushUps: 'push-ups',
    startToday: 'Start today!',
    additionalStats: 'Additional statistics',
    forWeek: 'For the week',
    sessionsPerDay: 'Sessions per day',
    workoutsByDays: 'Workouts by days',
    sessionsCount: 'Sessions',
    workoutHistory: 'Workout History',
    recentWorkouts: 'Recent workouts with delete option',
    deleteSession: 'Delete session',
    confirmDelete: 'Are you sure you want to delete this workout?',
    sessionDeleted: 'Session deleted',
    sessionDeletedSuccess: 'Session successfully deleted',
    errorDeleting: 'Error deleting session',
    errorDeletingSession: 'Failed to delete session',
    errorDeletingGeneral: 'An error occurred while deleting',
    deleteOldSessions: 'Delete workouts older than 30 days?',
    deleteTodaySessions: 'Delete today\'s workouts?',
    // Additional keys
    total: 'Total',
    allTime: 'All Time',
    bestDay: 'Best Day',
    noData: 'No data',
    weeklyOverview: 'Weekly Overview',
    averages: 'Averages',
    perSession: 'Per Session',
    streak: 'Streak',
    days: 'days',
    oldSessionsDeleted: 'Old workouts deleted!',
    todaySessionsDeleted: 'Today\'s workouts deleted!',
    errorDeletingOldSessions: 'Error deleting old workouts',
    errorDeletingSessions: 'Error deleting workouts',
    // Time periods
    timePeriods: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    },
    chartTitles: {
      daily: 'Push-ups for the last 7 days',
      weekly: 'Push-ups for the last 12 weeks',
      monthly: 'Push-ups for the last 12 months',
      yearly: 'Push-ups by years'
    },
    periodLabels: {
      lastWeek: 'Last week',
      last12Weeks: 'Last 12 weeks',
      last12Months: 'Last 12 months',
      years: 'By years'
    }
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'App personalization',
    appearance: 'Appearance',
    darkMode: 'Dark theme',
    lightMode: 'Light theme',
    themeDescription: 'Switch between light and dark theme',
    sounds: 'Sounds',
    soundEnabled: 'Sound notifications',
    soundDisabled: 'Sound disabled',
    soundDescription: 'Sound when clicking counter',
    workout: 'Workout',
    dailyGoalLabel: 'Daily goal (push-ups)',
    goalRecommendation: 'Recommended: 20-100 push-ups per day',
    autoSave: 'Auto-save',
    autoSaveEnabled: 'Automatically save workouts',
    autoSaveDescription: 'Automatically save sessions',
    data: 'Data',
    dataManagement: 'Data management',
    exportData: 'Export data',
    exportDescription: 'Export will create a JSON file with your data',
    importData: 'Import data',
    importDescription: 'Import data from JSON file',
    importButton: 'Choose file to import',
    importSuccess: 'Data imported successfully!',
    importError: 'Error importing data',
    importInvalidFile: 'Invalid file format',
    importNoData: 'File contains no data to import',
    importDuplicates: 'duplicates skipped',
    importSessionsAdded: 'sessions added',
    importResults: 'Import Results',
    clearData: 'Clear all data',
    language: 'Language',
    ukrainian: 'Українська',
    english: 'English',
    appInfo: 'About app',
    version: 'Version',
    appType: 'Type',
    dangerZone: 'Danger zone',
    dangerWarning: 'Be careful with these actions. They may delete your data.',
    confirmClear: 'Are you sure you want to delete all data?',
    dataExported: 'Data exported successfully!',
    dataImported: 'Data imported successfully!',
    dataCleared: 'All data cleared!',
    errorClearing: 'Error clearing data. Please try again.',
    appDescription: 'Push-Up Counter - your personal push-up trainer',
    // PWA Installation
    pwaInstallation: 'App Installation',
    pwaDescription: 'Install the app on your device for quick access and offline work',
    installApp: 'Install App',
    appInstalled: 'App Installed',
    // Database stats
    databaseStats: 'Database Statistics',
    recordsCount: 'Records',
    estimatedSize: 'Estimated Size',
    // Data management buttons
    deleteOldData: 'Clear old data (30+ days)',
    deleteTodayData: 'Delete today\'s workouts',
    // iOS PWA Status
    iosPwaStatus: 'iOS PWA Status',
    webVersion: 'Web Version',
    deviceLabel: 'Device',
    iosVersionLabel: 'iOS Version',
    pwaInstalled: 'App installed as PWA! You get:',
    pwaFeatures: {
      fullscreen: 'Full-screen experience',
      faster: 'Faster loading',
      offline: 'Offline functionality',
      native: 'Native look and feel'
    },
    installSuggestion: 'For better experience, install app on home screen',
    showInstallInstructions: 'Show installation instructions',
    networkStatus: 'Network',
    serviceWorkerStatus: 'Service Worker',
    online: 'Online',
    offline: 'Offline',
    supported: 'Supported',
    notSupported: 'Not supported'
  },

  // Achievements
  achievements: {
    firstPushUp: {
      name: 'First Push-up',
      description: 'Do your first push-up'
    },
    milestone10: {
      name: '10 Push-ups',
      description: 'Reach 10 push-ups in one session'
    },
    milestone50: {
      name: '50 Push-ups',
      description: 'Reach 50 push-ups in one session'
    },
    milestone100: {
      name: '100 Push-ups',
      description: 'Reach 100 push-ups in one session'
    },
    streak3: {
      name: '3 Days in a Row',
      description: 'Train for 3 days in a row'
    },
    streak7: {
      name: 'Week of Consistency',
      description: 'Train for 7 days in a row'
    },
    streak30: {
      name: 'Month of Discipline',
      description: 'Train for 30 days in a row'
    },
    total100: {
      name: '100 Total',
      description: 'Do 100 push-ups total'
    },
    total1000: {
      name: '1000 Total',
      description: 'Do 1000 push-ups total'
    }
  },

  // Messages
  messages: {
    error: 'Error',
    success: 'Success',
    sessionSaved: 'Session saved!',
    goalUpdated: 'Goal updated!',
    settingsSaved: 'Settings saved!',
    dataLoadError: 'Data loading error',
    invalidGoal: 'Invalid goal (must be from 1 to 1000)',
    offlineMode: 'Offline mode',
    onlineMode: 'Online mode'
  },

  // Days of week
  days: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  },

  // Months
  months: {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
  }
};

export const en = enTranslations;
