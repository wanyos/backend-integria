import { pool } from "../../db/mysql.js";
import { DatabaseError } from "../../util/errors.js";
import QUERIES from "./sqlInventory.js";
import { OBJECT_TYPE } from "./constants.js";

export default class InventoryService {
  // static async getMobileLinesCount() {
  //   try {
  //     const [result] = await pool.query(QUERIES.allObjectCount, [
  //       OBJECT_TYPE.mobileLine,
  //     ]);
  //     const totalLines = result[0]?.total || 0;
  //     return { status: 200, totalMobileLines: totalLines };
  //   } catch (error) {
  //     throw new DatabaseError("Failed to query mysql: getMobileLines()", error);
  //   }
  // }

  // static async getMobileNewLinesCount() {
  //   try {
  //     const [result] = await pool.query(QUERIES.allObjectCount, [
  //       OBJECT_TYPE.mobileLine,
  //     ]);
  //     const totalLines = result[0]?.total || 0;
  //     return { status: 200, totalMobileLines: totalLines };
  //   } catch (error) {
  //     throw new DatabaseError("Failed to query mysql: getMobileLines()", error);
  //   }
  // }
}
