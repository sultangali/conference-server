import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

// 🔹 Инициализируем i18next для сервера

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'ru', // Язык по умолчанию
    preload: ['ru', 'en', 'kz'], // Доступные языки
    backend: {
      loadPath: './locales/{{lng}}.json', // Файлы переводов
    },
    detection: {
      order: ['header'], // Определение языка по заголовку `Accept-Language`
      caches: false, // Не кешируем язык (чтобы сразу обновлялся)
    },
  });

// 🔹 Подключаем middleware в Express
app.use(middleware.handle(i18next));
