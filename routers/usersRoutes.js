import express from 'express'

import UsersController from '../controllers/users/usersController.js'

const usersRouter = express.Router()

usersRouter.get('/', UsersController.getUsers)

export default usersRouter
