import express from 'express'
import * as controller from '../controller/index.js'
import checkAuth from '../middleware/checkAuth.js'

const articleRouter =  express.Router()
articleRouter.get('/', controller.article.all)
articleRouter.patch("/:id", checkAuth,  controller.article.updateArticleStatus);
articleRouter.get('/problems', controller.article.getProblems)
articleRouter.post("/solve", checkAuth, controller.article.createSolveArticle);


export default articleRouter