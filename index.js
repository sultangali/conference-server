import express from 'express'

import mongoose from 'mongoose'
import config from 'config'
import cors from 'cors'

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

import path from 'path';
import { fileURLToPath } from 'url';

import "./service/emailScheduler.js";
import userRouter from './route/user.routes.js'
import uploadRouter from './route/upload.routes.js'
import articleRouter from './route/article.routes.js'
import emailRouter from './route/email.routes.js'

// Настраиваем `__dirname` для ES-модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
 
const PORT = config.get('port')
 
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'ru', // Язык по умолчанию
    preload: ['ru', 'en', 'kz'], // Доступные языки
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}.json'), // Файлы с переводами
    },
    detection: {
      order: ['header'], // Определяем язык по заголовку `Accept-Language`
      caches: false, // Не кэшируем язык
    },
  });

// 🔹 Подключаем middleware в Express
app.use(middleware.handle(i18next));

app.use(express.json())
app.use('/upload', express.static('upload'))
app.use('/images', express.static('images'))

app.use(cors({
  origin: 
  'https://conference.buketov.edu.kz', 
  // 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
})) 
  

const start = async () => {
    try {
        await mongoose.set('strictQuery', true)
        await mongoose.set('strictPopulate', false)
        await mongoose.connect(config.get('dbUrl'))
        console.log(`database OK\tname: ${mongoose.connection.name}`)
    } catch (error) {
        console.log(`database ERROR: ${error.message}`)
    }
  
    app.use('/api/upload', uploadRouter)
    app.use('/api/user', userRouter)
    app.use('/api/articles', articleRouter)
    app.use('/api', emailRouter)
 
    app.listen(PORT, (error) => {
        if(error) {
            console.log(`server ERROR`)
        }  
        console.log(`server OK\tport: ${PORT}`)
    })
}
   
start()
