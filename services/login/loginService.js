// import { pool } from '../../db/mysql.js'
import bcrypt from 'bcrypt'
import { validateRegister, validateLogin } from '../../util/validates.js'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import { ValidationError, UnauthorizedError, InternalServerError } from '../../util/errors.js'

// Convierte la URL en una ruta de archivo válida
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ruta absoluta al archivo users.json
const usersFilePath = path.join(__dirname, 'users.json')

const readUsersFile = async () => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log('error read file...', error)
  }
}

const writeUser = async (user) => {
  const data = await readUsersFile()
  user.id = crypto.randomUUID()
  data.push(user)
  await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2))
}

const findUser = async (username, email) => {
  const users = await readUsersFile()
  if (!email) {
    return users.filter((u) => u.username === username)
  }
  return users.find((u) => u.username === username || u.email === email)
}

const findUsers = async (username) => {
  const users = await readUsersFile()
  return users.filter((u) => u.username === username)
}

export default class UsersService {
  static async postLogin(username, password) {
    const validationResult = await this.#validateLogin(username, password)
    if (!validationResult.success) throw new ValidationError(validationResult.errors.join(', '))

    const users = await findUsers(username)
    if (users.length === 0) throw new UnauthorizedError('User does not exist')

    let validUser = null
    for (const usr of users) {
      try {
        const isValid = await bcrypt.compare(password, usr.hashPassword)
        if (isValid) {
          validUser = usr
          break
        }
      } catch (error) {
        throw new InternalServerError(`Error comparing bcrypt: ${error.message}`)
      }
    }
    if (!validUser) throw new UnauthorizedError('Password is invalid')

    return { status: 200, user: validUser }
  }

  static async postRegister(username, password, email) {
    const validationResult = await this.#validateRegister(username, password, email)
    if (!validationResult.success) throw new ValidationError(validationResult.errors.join(', '))

    const existingUser = await findUser(username, email)
    if (existingUser) {
      throw new ValidationError('User already exists')
    }

    const newUser = {
      id: '',
      username,
      email,
      hashPassword: validationResult.hashPassword,
      createAt: new Date().toISOString(),
      roles: ['user'],
    }

    await writeUser(newUser)
    const usr = await findUser(username, email)
    return { status: 201, user: usr }
  }

  static async #validateLogin(username, password) {
    const validationResult = validateLogin({ username, password })
    if (validationResult.success) {
      return { success: true }
    }
    return { success: false, errors: validationResult.errors }
  }

  static async #validateRegister(username, password, email) {
    const SALT_ROUNDS = 10
    const validationResult = validateRegister({ username, password, email })

    if (validationResult.success) {
      const hashPassword = await bcrypt.hash(password, SALT_ROUNDS)
      return { success: true, hashPassword }
    }
    return { success: false, errors: validationResult.error }
  }

  static postLogout() {}

  static getProtected() {}
}
