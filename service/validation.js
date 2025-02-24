import { body } from 'express-validator'

export const registration = [
    body('email').isEmail(),
    body('password').isString()
]

export const login = [
    body('email').optional().isEmail(),
    body('phone').optional().isString(),
    body('password').isString()
]
 
export const updateProfile = [
    body('fullname').optional().isString(),
    body('phone').optional().isString(),
    body('address').optional().isString()
]

export const todo = [
    body('title').isString(),
    body('description').optional().isString()
]