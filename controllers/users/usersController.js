import UsersService from "../../services/users/usersService.js";

export default class UsersController {
  static async getUsers(req, res, next) {
    try {
      const { status, users } = await UsersService.getUsers();
      return res.status(status).json(users);
    } catch (error) {
      next(error);
    }
  }
}
