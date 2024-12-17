import express from 'express'
import * as controller from '../controller/index.js'
import checkAuth from '../middleware/checkAuth.js'

const articleRouter =  express.Router()

articleRouter.post('/check-code', controller.article.one)

export default articleRouter