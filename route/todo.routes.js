import express from 'express'
import * as controller from '../controller/index.js'
import * as validation from '../service/validation.js'
import validationHandler from '../service/validationHandler.js'
import checkAuth from '../middleware/checkAuth.js'

const todoRouter = express.Router()

todoRouter.post('/', checkAuth,  validation.todo, validationHandler, controller.todo.create)
todoRouter.delete('/:id', checkAuth, controller.todo.remove)
todoRouter.get('/all', checkAuth, controller.todo.all)
todoRouter.patch('/:id', checkAuth, controller.todo.status)
todoRouter.patch('/:id/update', checkAuth, controller.todo.update)

export default todoRouter