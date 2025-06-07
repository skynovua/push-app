export const ua = {
  // Загальні
  common: {
    start: 'Старт',
    pause: 'Пауза',
    reset: 'Скидання',
    save: 'Зберегти',
    close: 'Закрити',
    settings: 'Налаштування',
    stats: 'Статистика',
    counter: 'Лічильник',
    today: 'Сьогодні',
    week: 'Тиждень',
    month: 'Місяць',
    total: 'Всього',
    goal: 'Ціль',
    progress: 'Прогрес',
    achievements: 'Досягнення',
    export: 'Експорт',
    import: 'Імпорт'
  },

  // Лічильник
  counter: {
    title: 'Тренування',
    progressToGoal: 'Прогрес до цілі',
    currentSession: 'Поточна сесія',
    sessionTime: 'Час тренування',
    dailyGoal: 'Денна ціль',
    sessionCompleted: 'Сесію завершено!',
    goalReached: 'Ціль досягнута! 🎉',
    keepGoing: 'Готові до тренування?',
    totalToday: 'Всього сьогодні',
    startHint: 'Натисніть "{start}" щоб розпочати тренування',
    clickHint: 'Натискайте на велику кнопку для підрахунку віджимань',
    almostThere: 'Майже у цілі! 🎯'
  },

  // Статистика
  stats: {
    title: 'Статистика',
    totalPushUps: 'Всього віджимань',
    currentStreak: 'Поточна серія',
    bestStreak: 'Найкраща серия',
    averagePerDay: 'Середньо за день',
    totalSessions: 'Всього тренувань',
    totalTime: 'Загальний час',
    weekProgress: 'Прогрес за тиждень',
    monthProgress: 'Прогрес за місяць',
    pushUpsPerDay: 'Віджимання за день',
    noDataYet: 'Ще немає даних',
    startWorkout: 'Почніть тренування, щоб побачити статистику!',
    daysStreak: 'днів поспіль',
    onFire: '🔥 Гарячка!',
    greatProgress: '💪 Відмінний прогрес!',
    keepItUp: '⭐ Так тримати!',
    loading: 'Завантаження статистики...',
    yourProgress: 'Ваш прогрес та досягнення',
    forWorkouts: 'за тренування',
    pushUps: 'віджимання',
    startToday: 'Почни сьогодні!',
    additionalStats: 'Додаткова статистика',
    forWeek: 'За тиждень',
    sessionsPerDay: 'Сесії на день',
    workoutsByDays: 'Тренування по днях',
    sessionsCount: 'Тренування'
  },

  // Налаштування
  settings: {
    title: 'Налаштування',
    subtitle: 'Персонализація програми',
    appearance: 'Зовнішній вигляд',
    darkMode: 'Темна тема',
    lightMode: 'Світла тема',
    themeDescription: 'Переключення між світлою і темною темою',
    sounds: 'Звуки',
    soundEnabled: 'Звукові сповіщення',
    soundDisabled: 'Звук вимкнено',
    soundDescription: 'Звук при натисканні на лічильник',
    workout: 'Тренування',
    dailyGoalLabel: 'Денна ціль (віджимання)',
    goalRecommendation: 'Рекомендується: 20-100 віджимань на день',
    autoSave: 'Автозбереження',
    autoSaveEnabled: 'Автоматично зберігати тренування',
    autoSaveDescription: 'Автоматично зберігати сесії',
    data: 'Дані',
    dataManagement: 'Управління даними',
    exportData: 'Експортувати дані',
    exportDescription: 'Експорт створить JSON файл з вашими даними',
    importData: 'Імпортувати дані',
    clearData: 'Очистити всі дані',
    language: 'Мова',
    ukrainian: 'Українська',
    english: 'English',
    appInfo: 'Про програму',
    version: 'Версія',
    appType: 'Тип',
    dangerZone: 'Небезпечна зона',
    dangerWarning: 'Будьте обережні з цими діями. Вони можуть видалити ваші дані.',
    confirmClear: 'Ви впевнені, що хочете видалити всі дані?',
    dataExported: 'Дані експортовано успішно!',
    dataImported: 'Дані імпортовано успішно!',
    dataCleared: 'Всі дані очищено!',
    appDescription: 'Push-Up Counter - ваш персональний тренер для віджимань'
  },

  // Досягнення
  achievements: {
    firstPushUp: {
      name: 'Перше віджимання',
      description: 'Зробіть своє перше віджимання'
    },
    milestone10: {
      name: '10 віджимань',
      description: 'Досягніть 10 віджимань за одну сесію'
    },
    milestone50: {
      name: '50 віджимань',
      description: 'Досягніть 50 віджимань за одну сесію'
    },
    milestone100: {
      name: '100 віджимань',
      description: 'Досягніть 100 віджимань за одну сесію'
    },
    streak3: {
      name: '3 дні поспіль',
      description: 'Тренуйтеся 3 дні поспіль'
    },
    streak7: {
      name: 'Тиждень постійності',
      description: 'Тренуйтеся 7 днів поспіль'
    },
    streak30: {
      name: 'Місяць дисципліни',
      description: 'Тренуйтеся 30 днів поспіль'
    },
    total100: {
      name: '100 загалом',
      description: 'Зробіть 100 віджимань загалом'
    },
    total1000: {
      name: '1000 загалом',
      description: 'Зробіть 1000 віджимань загалом'
    }
  },

  // Помилки та повідомлення
  messages: {
    error: 'Помилка',
    success: 'Успішно',
    sessionSaved: 'Сесію збережено!',
    goalUpdated: 'Ціль оновлено!',
    settingsSaved: 'Налаштування збережено!',
    dataLoadError: 'Помилка завантаження даних',
    invalidGoal: 'Невірна ціль (має бути від 1 до 1000)',
    offlineMode: 'Режим офлайн',
    onlineMode: 'Онлайн режим'
  },

  // Дні тижня
  days: {
    monday: 'Понеділок',
    tuesday: 'Вівторок',
    wednesday: 'Середа',
    thursday: 'Четвер',
    friday: 'П\'ятниця',
    saturday: 'Субота',
    sunday: 'Неділя'
  },

  // Місяці
  months: {
    january: 'Січень',
    february: 'Лютий',
    march: 'Березень',
    april: 'Квітень',
    may: 'Травень',
    june: 'Червень',
    july: 'Липень',
    august: 'Серпень',
    september: 'Вересень',
    october: 'Жовтень',
    november: 'Листопад',
    december: 'Грудень'
  }
};

export type Translations = typeof ua;
