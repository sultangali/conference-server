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
    storage: storageService('articles')
})

uploadRouter.post('/avatar', checkAuth, uploadUserAvatar.single('image'), controller.uploadAvatar)
uploadRouter.post('/article', uploadUserArticle.single('file'), controller.uploadArticle)

export default uploadRouter