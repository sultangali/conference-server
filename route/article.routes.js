import express from 'express'
import * as controller from '../controller/index.js'
import checkAuth from '../middleware/checkAuth.js'
import multer from 'multer'
import storageService from '../service/diskStorage.js'

const articleRouter =  express.Router()

const uploadArticle = multer({
    storage: storageService('articles/problem')
})

const uploadReceipt = multer({
    storage: storageService('articles/receipts')
})

articleRouter.get('/', controller.article.all)
articleRouter.patch("/:id", checkAuth, controller.article.updateArticleStatus);
articleRouter.patch("/:id/receipt-status", checkAuth, controller.article.updateReceiptStatus);
articleRouter.post("/upload-receipt", checkAuth, uploadReceipt.single('file'), controller.article.uploadReceipt);
articleRouter.post("/solve", checkAuth, controller.article.createSolveArticle);
articleRouter.post("/update", checkAuth, uploadArticle.single('file'), controller.article.updateArticle);

export default articleRouter