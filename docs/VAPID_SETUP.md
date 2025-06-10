# 🔑 Налаштування VAPID ключів для Push нотифікацій

## Що таке VAPID ключі?

VAPID (Voluntary Application Server Identification) ключі - це криптографічні ключі, які використовуються для ідентифікації вашого сервера при відправці push-нотифікацій. Вони забезпечують безпеку та дозволяють браузерам перевіряти, що повідомлення дійсно надходять від вашого сервера.

## 🔧 Генерація VAPID ключів

### Метод 1: Використання web-push CLI

```bash
# Встановіть web-push глобально
npm install -g web-push

# Згенеруйте VAPID ключі
web-push generate-vapid-keys
```

### Метод 2: Використання онлайн-генератора

Відвідайте: https://vapidkeys.com/

### Метод 3: Використання Node.js скрипта

Створіть файл `generate-vapid.js`:

```javascript
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();

console.log('VAPID Public Key:', keys.publicKey);
console.log('VAPID Private Key:', keys.privateKey);
```

Запустіть скрипт:

```bash
npm install web-push
node generate-vapid.js
```

## 🔒 Налаштування змінних оточення

### Для розробки (.env.local)

```env
# Push Notifications VAPID Keys
VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE
VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Push server endpoint (якщо є власний сервер)
VITE_PUSH_ENDPOINT=https://your-server.com/api/push
```

### Для продакшну

#### Vercel

```bash
vercel env add VITE_VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY
```

#### Netlify

1. Перейдіть до Site settings > Environment variables
2. Додайте змінні:
   - `VITE_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`

#### GitHub Actions

```yaml
env:
  VITE_VAPID_PUBLIC_KEY: ${{ secrets.VITE_VAPID_PUBLIC_KEY }}
  VAPID_PRIVATE_KEY: ${{ secrets.VAPID_PRIVATE_KEY }}
```

## 📋 Кроки налаштування

### 1. Згенеруйте ключі

```bash
npx web-push generate-vapid-keys
```

### 2. Додайте до .env.local

```env
VITE_VAPID_PUBLIC_KEY=BK4jK... (ваш публічний ключ)
VAPID_PRIVATE_KEY=Lm8f... (ваш приватний ключ)
```

### 3. Оновіть конфігурацію

У файлі `src/shared/config/push-config.ts` публічний ключ автоматично підхоплюється з `process.env.VITE_VAPID_PUBLIC_KEY`.

### 4. Налаштуйте push-сервер (опціонально)

Якщо використовуєте власний push-сервер, вам потрібно:

```javascript
// server.js
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:your-email@example.com', // Ваш email
  process.env.VITE_VAPID_PUBLIC_KEY, // Публічний ключ
  process.env.VAPID_PRIVATE_KEY // Приватний ключ
);

app.post('/send-push', async (req, res) => {
  const subscription = req.body.subscription;
  const payload = JSON.stringify(req.body.payload);

  try {
    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});
```

## ⚠️ Важливі застереження

1. **Ніколи не розголошуйте приватний ключ** - він повинен залишатися тільки на сервері
2. **Публічний ключ безпечно** додавати в клієнтський код
3. **Змініть ключі при компрометації** та оновіть всі підписки
4. **Використовуйте різні ключі** для розробки та продакшну

## 🧪 Тестування

### Локальне тестування

```bash
# Запустіть додаток
npm run dev

# Відкрийте Developer Tools > Application > Service Workers
# Перевірте, що service worker зареєстрований

# Протестуйте push-нотифікації через налаштування в додатку
```

### Production тестування

1. Відкрийте Developer Tools в production версії
2. Перейдіть до Application > Service Workers
3. Натисніть "Push" для тестування нотифікацій

## 🔍 Діагностика проблем

### Помилка "InvalidVapidKey"

- Перевірте формат VAPID ключа
- Переконайтеся, що ключ не містить пробілів або переносів рядків

### Помилка "Unauthorized"

- Перевірте, чи правильно налаштовані VAPID ключі
- Переконайтеся, що публічний і приватний ключі відповідають одне одному

### Нотифікації не приходять

- Перевірте дозволи браузера для нотифікацій
- Переконайтеся, що service worker зареєстрований
- Перевірте консоль браузера на помилки

## 📚 Додаткові ресурси

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Google Web Push Guide](https://developers.google.com/web/fundamentals/push-notifications)
- [web-push library](https://github.com/web-push-libs/web-push)
