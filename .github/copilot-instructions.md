# 🚀 Инструкция по разработке Push-Up Counter App

## 📋 Обзор проекта
Разработка Progressive Web Application (PWA) для подсчета отжиманий на React + TypeScript + Vite с использованием Tailwind CSS.

---

## 🎯 Основные цели
- Создать простое и интуитивное приложение для подсчета отжиманий
- Обеспечить работу в offline режиме
- Сделать приложение устанавливаемым на все устройства
- Добавить базовую статистику и графики прогресса

---

## 🛠 Технологический стек

### Основные технологии:
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Стилизация**: Tailwind CSS + shadcn/ui
- **PWA**: Service Worker + Web App Manifest
- **База данных**: IndexedDB (с библиотекой Dexie.js)
- **Графики**: Recharts (входит в shadcn/ui)
- **Состояние**: Context API или Zustand
- **Иконки**: Lucide React (входит в shadcn/ui)

### Дополнительные инструменты:
- **Линтинг**: ESLint + Prettier
- **Типизация**: TypeScript strict mode
- **Тестирование**: Vitest + React Testing Library
- **Деплой**: Vercel или Netlify

---

## 📂 Структура проекта

```
push-app/
├── public/
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── Counter/
│   │   ├── Stats/
│   │   ├── Settings/
│   │   └── ui/          # shadcn/ui компоненты
│   ├── hooks/
│   ├── lib/             # shadcn/ui utils
│   ├── services/
│   │   ├── database.ts
│   │   └── pwa.ts
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── components.json      # shadcn/ui конфигурация
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 Основные экраны

### 1. Главный экран (Counter)
- Большая кнопка для подсчета отжиманий
- Отображение текущего счетчика
- Кнопки старт/пауза/сброс
- Таймер тренировки

### 2. Статистика (Stats)
- Графики прогресса (дневной, недельный, месячный)
- Личные рекорды
- Стрик тренировок
- Достижения

### 3. Настройки (Settings)
- Цели тренировок
- Темная/светлая тема
- Экспорт данных
- О приложении

---

## 🔧 Этапы разработки

### Phase 1: Основа (Неделя 1-2)
1. **Настройка проекта**
   ```bash
   npm create vite@latest push-app -- --template react-ts
   cd push-app
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Установка зависимостей**
   ```bash
   npm install dexie recharts zustand
   npm install -D @types/node
   ```

3. **Настройка shadcn/ui**
   ```bash
   npx shadcn-ui@latest init
   ```

4. **Установка необходимых компонентов shadcn/ui**
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add progress
   npx shadcn-ui@latest add badge
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add switch
   ```

3. **Настройка Tailwind CSS**
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

4. **Создание базовой структуры компонентов**
   - Компонент Counter с базовой логикой
   - Простая навигация между экранами
   - Базовое состояние приложения

### Phase 2: Основной функционал (Неделя 3-4)
1. **Реализация счетчика отжиманий**
   - Компонент с большой кнопкой
   - Логика подсчета и сохранения
   - Таймер тренировки
   - Аудио-фидбек

2. **Система хранения данных**
   ```typescript
   // types/index.ts
   export interface WorkoutSession {
     id: string;
     date: Date;
     pushUps: number;
     duration: number;
     sets?: Set[];
   }

   export interface Set {
     reps: number;
     restTime: number;
   }
   ```

3. **IndexedDB через Dexie**
   ```typescript
   // services/database.ts
   import Dexie, { Table } from 'dexie';
   import { WorkoutSession } from '../types';

   export class AppDB extends Dexie {
     workoutSessions!: Table<WorkoutSession>;

     constructor() {
       super('PushUpCounterDB');
       this.version(1).stores({
         workoutSessions: '++id, date, pushUps, duration'
       });
     }
   }

   export const db = new AppDB();
   ```

### Phase 3: Статистика и графики (Неделя 5-6)
1. **Компонент статистики**
   - Дневные, недельные, месячные данные
   - Расчет стриков и рекордов
   - Простые графики с Chart.js

2. **Система достижений**
   ```typescript
   // utils/achievements.ts
   export const achievements = [
     { id: 'first_pushup', name: 'Первое отжимание', condition: (total: number) => total >= 1 },
     { id: 'milestone_100', name: '100 отжиманий', condition: (total: number) => total >= 100 },
     // ... другие достижения
   ];
   ```

### Phase 4: PWA функционал (Неделя 7-8)
1. **Настройка PWA**
   ```json
   // public/manifest.json
   {
     "name": "Push-Up Counter",
     "short_name": "PushUp",
     "description": "Simple push-up counter and tracker",
     "theme_color": "#3b82f6",
     "background_color": "#ffffff",
     "display": "standalone",
     "start_url": "/",
     "icons": [
       {
         "src": "/icons/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       }
     ]
   }
   ```

2. **Service Worker для offline**
   ```javascript
   // public/sw.js
   const CACHE_NAME = 'pushup-counter-v1';
   const urlsToCache = [
     '/',
     '/static/js/bundle.js',
     '/static/css/main.css'
   ];

   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then((cache) => cache.addAll(urlsToCache))
     );
   });
   ```

3. **Vite конфигурация для PWA**
   ```typescript
   // vite.config.ts
   import path from "path"
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg}']
         }
       })
     ],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   })
   ```

---

## 📱 Ключевые компоненты

### 1. Counter Component
```typescript
// components/Counter/Counter.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [goal] = useState(50); // Дневная цель

  const handleIncrement = () => {
    if (isActive) {
      setCount(prev => prev + 1);
      // Аудио фидбек
      playClickSound();
    }
  };

  const handleReset = () => {
    setCount(0);
    setTime(0);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      {/* Progress bar */}
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Прогресс к цели</span>
              <span>{count}/{goal}</span>
            </div>
            <Progress value={(count / goal) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Большая кнопка счетчика */}
      <button
        onClick={handleIncrement}
        className="w-48 h-48 bg-primary hover:bg-primary/90 text-primary-foreground text-6xl font-bold rounded-full shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isActive}
      >
        {count}
      </button>
      
      {/* Таймер */}
      {isActive && (
        <div className="text-2xl font-mono font-bold text-muted-foreground">
          {formatTime(time)}
        </div>
      )}

      {/* Управление */}
      <div className="flex gap-4">
        <Button
          onClick={() => setIsActive(!isActive)}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isActive ? 'Пауза' : 'Старт'}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Сброс
        </Button>
      </div>
    </div>
  );
};
```

### 2. Stats Component
```typescript
// components/Stats/Stats.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkoutData } from '../hooks/useWorkoutData';

export const Stats: React.FC = () => {
  const { dailyStats, weeklyStats, totalPushUps } = useWorkoutData();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Статистика</h2>
      
      {/* Общая статистика */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего отжиманий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPushUps}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Текущий стрик</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 дней</div>
            <Badge variant="secondary" className="mt-1">🔥 В огне!</Badge>
          </CardContent>
        </Card>
      </div>

      {/* График прогресса */}
      <Card>
        <CardHeader>
          <CardTitle>Прогресс за неделю</CardTitle>
          <CardDescription>Количество отжиманий по дням</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 🔄 Хуки для управления состоянием

### useWorkoutData
```typescript
// hooks/useWorkoutData.ts
import { useState, useEffect } from 'react';
import { db } from '../services/database';
import { WorkoutSession } from '../types';

export const useWorkoutData = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const allSessions = await db.workoutSessions.toArray();
    setSessions(allSessions);
  };

  const addSession = async (session: Omit<WorkoutSession, 'id'>) => {
    await db.workoutSessions.add({
      ...session,
      id: crypto.randomUUID()
    });
    loadSessions();
  };

  const dailyStats = useMemo(() => {
    // Группировка по дням и подсчет
    return groupSessionsByDay(sessions);
  }, [sessions]);

  return {
    sessions,
    addSession,
    dailyStats,
    totalPushUps: sessions.reduce((sum, s) => sum + s.pushUps, 0)
  };
};
```

---

## 🎨 Дизайн и стилизация

### Цветовая схема (через shadcn/ui variables):
```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    /* ... остальные dark переменные */
  }
}
```

### Основные UI паттерны:
- **Карточки**: `Card` компонент для группировки контента
- **Кнопки**: `Button` с вариантами default, outline, secondary
- **Прогресс**: `Progress` для отображения прогресса к цели
- **Диалоги**: `Dialog` для настроек и подтверждений
- **Бейджи**: `Badge` для достижений и статусов

### Компоненты UI:
```typescript
// Используем shadcn/ui компоненты вместо создания своих

// Пример кастомизации через Tailwind классы
// components/common/CounterButton.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CounterButtonProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const CounterButton: React.FC<CounterButtonProps> = ({
  count,
  onClick,
  disabled = false,
  className
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-48 h-48 text-6xl font-bold rounded-full shadow-lg transition-all duration-200 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      size="lg"
    >
      {count}
    </Button>
  );
};

// Пример использования shadcn/ui Dialog для настроек
// components/Settings/SettingsDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export const SettingsDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
          <DialogDescription>
            Настройте параметры приложения
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="dark-mode">Темная тема</label>
            <Switch id="dark-mode" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="sound">Звуковые уведомления</label>
            <Switch id="sound" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 🚀 Деплой и публикация

### 1. Подготовка к деплою
```bash
npm run build
npm run preview  # проверка сборки
```

### 2. Деплой на Vercel
```bash
npm install -g vercel
vercel --prod
```

### 3. Настройка домена (опционально)
- Купить домен
- Настроить DNS записи
- Добавить SSL сертификат

---

## ✅ Чек-лист для MVP

### Обязательные функции:
- [ ] Счетчик отжиманий с большой кнопкой
- [ ] Старт/пауза/сброс тренировки
- [ ] Сохранение данных в IndexedDB
- [ ] Базовая статистика (общее количество, последние тренировки)
- [ ] PWA манифест и возможность установки
- [ ] Offline работа
- [ ] Responsive дизайн для мобильных и десктопа
- [ ] Темная/светлая тема

### Дополнительные функции:
- [ ] Графики прогресса
- [ ] Система достижений
- [ ] Экспорт данных
- [ ] Настройка целей
- [ ] Звуковые уведомления
- [ ] Таймер отдыха между подходами

---

## 🐛 Тестирование

### Unit тесты:
```typescript
// __tests__/Counter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from '../components/Counter/Counter';

test('increment counter on button click', () => {
  render(<Counter />);
  const button = screen.getByRole('button', { name: /0/i });
  
  fireEvent.click(button);
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### E2E тесты с Playwright (опционально):
```typescript
// e2e/basic.spec.ts
import { test, expect } from '@playwright/test';

test('basic push-up counting', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="start-button"]');
  await page.click('[data-testid="counter-button"]');
  await expect(page.locator('[data-testid="counter"]')).toHaveText('1');
});
```

---

## 📈 Метрики и аналитика

### Ключевые метрики:
- Время загрузки приложения
- Количество активных пользователей
- Среднее время сессии
- Retention rate
- Количество установок PWA

### Реализация:
```typescript
// utils/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Простая аналитика без внешних сервисов
  console.log('Event:', eventName, properties);
  
  // Можно добавить отправку на собственный сервер
  // или использовать Google Analytics
};
```

---

## 🎯 Следующие этапы после MVP

1. **Версия 1.1**:
   - Push уведомления
   - Синхронизация с облаком
   - Социальные функции

2. **Версия 1.2**:
   - Различные типы упражнений
   - Планы тренировок
   - Интеграция с фитнес-трекерами

3. **Версия 2.0**:
   - Мультиплеер челленджи
   - ИИ-тренер
   - Премиум функции

---

Эта инструкция поможет пошагово создать полнофункциональное PWA для подсчета отжиманий с современным стеком технологий!
