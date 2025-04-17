import { pool } from "../../db/mysql.js";
import { DatabaseError } from "../../util/errors.js";

const allUsers =
  'SELECT *, REPLACE(REPLACE(nombre_real, "&#x20;", " "), "&amp;", "&") AS nombre_real_format FROM tusuario limit 100';

export default class UsersService {
  static async getUsers() {
    try {
      const [rows] = await pool.query(allUsers);

      // Reemplazar los caracteres especiales en el campo 'nombre_real'
      //   rows.forEach((user) => {
      //     user.nombre_real = user.nombre_real.replace(/&#x20;/g, ' ').replace(/&amp;/g, '&')
      //   })

      return { status: 200, users: rows };
    } catch (error) {
      throw new DatabaseError("Failed to query mysql: getUsers()", error);
    }
  }
}
