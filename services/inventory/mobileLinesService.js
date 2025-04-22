import { pool } from "../../db/mysql.js";
import { DatabaseError } from "../../util/errors.js";
import QUERIES from "./sqlInventory.js";
import { OBJECT_TYPE } from "./constants.js";

const STATUS = {
  new: "new",
  inuse: "inuse",
};

export default class MobileLineService {
  static async getMobileNewLinesCount() {
    try {
      const [result] = await pool.query(QUERIES.allStatusLinesCount, [
        OBJECT_TYPE.mobileLine,
        STATUS.new,
      ]);
      const totalLines = result[0]?.total || 0;
      return { status: 200, totalMobileNewLines: totalLines };
    } catch (error) {
      throw new DatabaseError("Failed to query mysql: getMobileLines()", error);
    }
  }

  static async getMobileInuseLinesCount() {
    try {
      const [result] = await pool.query(QUERIES.allStatusLinesCount, [
        OBJECT_TYPE.mobileLine,
        STATUS.inuse,
      ]);
      const totalLines = result[0]?.total || 0;
      return { status: 200, totalMobileInuseLines: totalLines };
    } catch (error) {
      throw new DatabaseError("Failed to query mysql: getMobileLines()", error);
    }
  }

  static async getMobileErrorStatusLinesCount() {
    try {
      const [result] = await pool.query(QUERIES.allErrorStatusLinesCount, [
        OBJECT_TYPE.mobileLine,
        STATUS.inuse,
        STATUS.new,
      ]);
      const totalLines = result[0]?.total || 0;
      return { status: 200, totalMobileErrorStatusLines: totalLines };
    } catch (error) {
      throw new DatabaseError("Failed to query mysql: getMobileLines()", error);
    }
  }
}
