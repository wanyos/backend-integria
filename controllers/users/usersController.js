import UsersService from '../../services/users/usersService.js'

export default class UsersController {
  static async getUsers(req, res, next) {
    try {
      const { status, users } = await UsersService.getUsers()
      return res.status(status).json(users)
    } catch (error) {
      console.error(error)
      next(error) // Pasar el error al middleware de manejo de errores
    }
  }
}
