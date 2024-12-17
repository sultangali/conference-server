import express from 'express'
import * as controller from '../controller/index.js'
import * as validation from '../service/validation.js'
import validationHandler from '../service/validationHandler.js'
import checkAuth from '../middleware/checkAuth.js'

const userRouter =  express.Router()

userRouter.post('/auth/registration', controller.user.registration)
userRouter.post('/auth/login', validation.login, validationHandler, controller.user.login)
userRouter.patch('/me/update', checkAuth, validation.updateProfile, validationHandler, controller.user.update )
userRouter.get('/me', checkAuth, controller.user.me)
userRouter.get('/all-users', checkAuth, controller.user.all)

export default userRouter