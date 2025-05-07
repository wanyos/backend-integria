import { pool } from "../../db/mysql.js";
import { DatabaseError } from "../../util/errors.js";
import QUERIES from "./sqlInventory.js";
import { OBJECT_TYPE } from "./constants.js";
import { decodeHtmlEntities } from "../../util/formattingText.js";


const QR = {
  allLinesByStatus: QUERIES.allLinesGroupedByStatus,
  allLinesByEmployee : QUERIES.linesByEmployee
} 


export default class MobileLineService {
  static async getLines(queryType) {
    try {
        const [result] = await pool.query(QR[queryType], [
        OBJECT_TYPE.mobileLine,
      ]);

      const totalLines = result.map((line) => {
        return {
          ...line,
          description: decodeHtmlEntities(line.description),
        };
      });

      return { status: 200, linesByStatus: totalLines };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getLinesGroupedByStatus()",
        error
      );
    }
  }

}
