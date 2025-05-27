import { pool } from "../../db/mysql.js";
import { DatabaseError } from "../../util/errors.js";
import QUERIES from "./sqlInventory.js";
import { OBJECT_TYPE } from "./constants.js";
import { decodeHtmlEntities } from "../../util/formattingText.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QR = {
  allMobileLines: QUERIES.allMobileLines,
  allLinesByStatus: QUERIES.allLinesGroupedByStatus,
  allLinesByEmployee: QUERIES.linesByEmployee,
};

export default class MobileLineService {
  static async getLines(queryType) {
    try {
      let params = [OBJECT_TYPE.mobileLine];
      if (queryType === "allLinesByEmployee") {
        params = [OBJECT_TYPE.mobileLine, OBJECT_TYPE.mobileLine];
      }
      const [result] = await pool.query(QR[queryType], params);

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

  static async getCompareByTelefonica() {
    try {
      const pathFile = path.join(
        __dirname,
        "../../contextos/data/data_lines.json"
      );
      if (!fs.existsSync(pathFile))
        throw new DatabaseError(
          "Failed service getCompareByTelefonica()",
          error
        );

      const dataFile = JSON.parse(fs.readFileSync(pathFile, "utf-8"));
      const dateReport = dataFile.date;
      const linesTelefonica = dataFile.report;

      const [dbLines] = await pool.query(QR["allMobileLines"], [
        OBJECT_TYPE.mobileLine,
      ]);
      const DBLines = dbLines.map((line) => {
        return {
          ...line,
          description: decodeHtmlEntities(line.description),
        };
      });

      const reportLines = compareLines(DBLines, linesTelefonica);
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getCompareByTelefonica()",
        error
      );
    }
  }
}

const compareLines = (DBLines, telefonicaLines) => {
  const discrepancies = [];
  telefonicaLines.forEach((lineTelefonica) => {
    const dbLine = DBLines.find((line) => {
      lineTelefonica.telefono === line.telefono;
    });
  });
};
