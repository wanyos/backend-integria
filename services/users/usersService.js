import { pool } from '../../db/mysql.js'

const users = 'SELECT * FROM tusuario limit 100'
const allUsers =
  'SELECT *, REPLACE(REPLACE(nombre_real, "&#x20;", " "), "&amp;", "&") AS nombre_real_format FROM tusuario limit 100'

export default class UsersService {
  static async getUsers() {
    try {
      const [rows] = await pool.query(allUsers)

      // Reemplazar los caracteres especiales en el campo 'nombre_real'
      //   rows.forEach((user) => {
      //     user.nombre_real = user.nombre_real.replace(/&#x20;/g, ' ').replace(/&amp;/g, '&')
      //   })

      return { status: 200, users: rows }
    } catch (error) {
      console.error(error)
      console.error('Database error:', error.message)
      throw new Error('Failed to fetch users from the database')
    }
  }
}
