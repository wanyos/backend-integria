import { pool } from "../../db/mysql.js";
import { DatabaseError } from "../../util/errors.js";
import QUERIES from "./sqlInventory.js";
import { OBJECT_TYPE } from "./constants.js";
import { decodeHtmlEntities } from "../../util/formattingText.js";

const STATUS = {
  new: "new",
  inuse: "inuse",
};

export default class MobileLineService {
  static async getLinesGroupedByStatus() {
    try {
      const [result] = await pool.query(QUERIES.allLinesGroupedByStatus, [
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

  static async getMobileNewLinesCount() {
    try {
      const [result] = await pool.query(QUERIES.allStatusLinesCount, [
        OBJECT_TYPE.mobileLine,
        STATUS.new,
      ]);
      const totalLines = result[0]?.total || 0;
      return { status: 200, totalMobileNewLines: totalLines };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getMobileNewLinesCount()",
        error
      );
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
      throw new DatabaseError(
        "Failed to query mysql: getMobileInuseLinesCount()",
        error
      );
    }
  }

  static async getMobileErrorStatusLinesCount() {
    try {
      const [result] = await pool.query(QUERIES.allErrorStatusLines, [
        OBJECT_TYPE.mobileLine,
        STATUS.inuse,
        STATUS.new,
      ]);

      const totalLines = result.map((line) => {
        return {
          ...line,
          description: decodeHtmlEntities(line.description),
        };
      });

      return { status: 200, totalMobileErrorStatusLines: totalLines };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getMobileErrorStatusLinesCount()",
        error
      );
    }
  }
}
