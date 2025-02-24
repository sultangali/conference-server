import express from 'express'
import * as controller from '../controller/index.js'
import * as validation from '../service/validation.js'
import validationHandler from '../service/validationHandler.js'
import checkAuth from '../middleware/checkAuth.js'

const userRouter =  express.Router()

userRouter.post('/auth/registration', controller.user.registration)
userRouter.get("/auth/verify/:token", controller.verifyEmail);
userRouter.post('/auth/login', (req, res, next) => {
    console.log("🔹 Запрос пришел на /auth/login", req.body);
    next(); // Передаем управление дальше
}, validation.login, validationHandler, controller.user.login);

userRouter.patch('/me/update', checkAuth, validation.updateProfile, 
    validationHandler, controller.user.update )
userRouter.get('/me', checkAuth, controller.user.me)
userRouter.get('/participants', controller.user.getParticipants)
userRouter.get("/update-participation/:userId", controller.user.updateParticipationType);


export default userRouter



