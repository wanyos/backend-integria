import LoginService from '../services/login/loginService.js'
import jwt from 'jsonwebtoken'

export default class LoginController {
  static async postLogin(req, res, next) {
    const { username, password } = req.body
    try {
      const { status, message, user } = await LoginService.postLogin(username, password)
      if (!user) return res.status(status).json({ status, message })

      const expiresIn = 60 * 60 // 1 hora en segundos
      const token = jwt.sign(
        { username: user.username, email: user.email },
        process.env.SECRET_JWT_KEY,
        { expiresIn },
      )
      return res.status(status).json({
        status,
        token,
        username: user.username,
        email: user.email,
        expirationTime: expiresIn,
      })
    } catch (error) {
      next(error)
    }
  }

  static async postRegister(req, res, next) {
    const { username, password, email } = req.body
    try {
      const { status, message, user } = await LoginService.postRegister(username, password, email)
      if (!user) return res.status(status).json({ status, message })

      const expiresIn = 60 * 60 // 1 hora en segundos
      const token = jwt.sign(
        { username: user.username, email: user.email },
        process.env.SECRET_JWT_KEY,
        { expiresIn },
      )
      return res.status(status).json({
        status,
        token,
        username: user.username,
        email: user.email,
        expirationTime: expiresIn,
      })
    } catch (error) {
      next(error)
    }
  }

  static async postLogout(req, res, next) {
    const { username, password } = req.body
    try {
      return res.status(200).json({ name: username, pass: password })
    } catch (error) {
      next(error)
    }
  }

  // static async getProtected(req, res) {
  //   try {
  //     return res.status(200).json({})
  //   } catch (error) {
  //     return res.status(403).json({ message: 'error protected...' })
  //   }
  // }
}
