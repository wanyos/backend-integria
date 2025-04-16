import express from 'express'

import LoginController from '../controllers/loginController.js'

const loginRouter = express.Router()

loginRouter.post('/login', LoginController.postLogin)
loginRouter.post('/register', LoginController.postRegister)
loginRouter.post('/logout', LoginController.postLogout)
// loginRouter.get('/protected', LoginController.getProtected)

export default loginRouter
