import express from 'express'
import multer from 'multer'

import * as controller from '../controller/upload.controller.js'
import checkAuth from '../middleware/checkAuth.js'
import storageService from '../service/diskStorage.js'

const uploadRouter = express.Router()

const uploadUserAvatar = multer({
    storage: storageService('users')
})

const uploadUserArticle = multer({
    storage: storageService('articles/problem')
})
const uploadUserArticle1 = multer({
    storage: storageService('articles/solve')
})


uploadRouter.post('/avatar', checkAuth, uploadUserAvatar.single('image'), controller.uploadAvatar)
uploadRouter.post('/article/problem', uploadUserArticle.fields([
    { name: "file", maxCount: 1 }, // Файл статьи
    { name: "section", maxCount: 1 }, // Секция
    { name: "correspondentName", maxCount: 1 }, // ФИО корреспондента
  ]), controller.uploadProblemArticle)
uploadRouter.post('/article/solve', uploadUserArticle1.fields([
    { name: "file", maxCount: 1 }, // Файл статьи
    { name: "section", maxCount: 1 }, // Секция
    { name: "correspondentName", maxCount: 1 }, // ФИО корреспондента
  ]), controller.uploadSolveArticle)

export default uploadRouter