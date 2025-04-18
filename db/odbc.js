// import os from 'node:os'

// let odbc
// if (os.platform() === 'win32') {
//   odbc = await import('odbc')
// }

// const query = `SELECT TOP 10 ref_num AS Num_Incidencia, open_date AS FechaApertura, summary AS Resumen FROM call_req ORDER BY open_date DESC;`

// const getIncidents = `SELECT inc.ref_num AS Num_Incidencia, est.sym AS Estado, inc.open_date AS FechaApertura, inc.close_date AS FechaCierre, [ca_contact].[middle_name] & " " & [ca_contact].[last_name] & " " & [ca_contact].[first_name] AS Usuario, ca_contact.pri_phone_number AS Extension, inc.summary AS Resumen, grp.last_name AS Grupo, [con].[middle_name] & " " & [con].[last_name] & " " & [con].[first_name] AS Tecnico_Asignado, prob.sym AS Tipo_Inc, prob.description AS Descripcion_Tipo INTO EMT_Incidencias
// FROM ((((((call_req AS inc LEFT JOIN ca_contact AS grp ON inc.group_id = grp.contact_uuid) LEFT JOIN ca_contact AS con ON inc.assignee = con.contact_uuid) LEFT JOIN prob_ctg AS prob ON inc.category = prob.persid) LEFT JOIN cr_stat AS est ON inc.status = est.code) LEFT JOIN ca_contact ON inc.customer = ca_contact.contact_uuid) LEFT JOIN ca_resource_cost_center ON ca_contact.cost_center = ca_resource_cost_center.id) LEFT JOIN EMT_Origen ON inc.severity = EMT_Origen.Origen
// WHERE inc.open_date >= 1704067200
//   AND inc.open_date <= 1767221999
// ORDER BY inc.ref_num, grp.last_name;`

// const query1 = `SELECT TOP 10 inc.ref_num, est.sym, inc.open_date
// FROM call_req AS inc
// LEFT JOIN cr_stat AS est ON inc.status = est.code;
// `

// const query2 = `SELECT TABLE_SCHEMA, TABLE_NAME
// FROM INFORMATION_SCHEMA.TABLES
// WHERE TABLE_NAME = 'EMT_Origen';
// `

// const allTables = `SELECT TABLE_NAME
// FROM INFORMATION_SCHEMA.TABLES;
// `

const query3 = `SELECT
    inc.ref_num AS Num_Incidencia,
    est.sym AS Estado,
    inc.open_date AS FechaApertura,
    inc.close_date AS FechaCierre,
    [ca_contact].[middle_name] + ' ' + [ca_contact].[last_name] + ' ' + [ca_contact].[first_name] AS Usuario,
    ca_contact.pri_phone_number AS Extension,
    inc.summary AS Resumen,
    grp.last_name AS Grupo,
    [con].[middle_name] + ' ' + [con].[last_name] + ' ' + [con].[first_name] AS Tecnico_Asignado,
    prob.sym AS Tipo_Inc,
    prob.description AS Descripcion_Tipo
FROM ((((call_req AS inc
    LEFT JOIN ca_contact AS grp ON inc.group_id = grp.contact_uuid)
    LEFT JOIN ca_contact AS con ON inc.assignee = con.contact_uuid)
    LEFT JOIN prob_ctg AS prob ON inc.category = prob.persid)
    LEFT JOIN cr_stat AS est ON inc.status = est.code)
    LEFT JOIN ca_contact ON inc.customer = ca_contact.contact_uuid
    LEFT JOIN ca_resource_cost_center ON ca_contact.cost_center = ca_resource_cost_center.id
WHERE inc.open_date >= 1704067200
  AND inc.open_date <= 1767221999
ORDER BY inc.ref_num, grp.last_name;`;

// export async function getServideskData() {
//   if (os.platform() !== 'win32') {
//     return []
//   }

//   try {
//     const connection = await odbc.connect("DSN=CA_SERVICEDESK;UID=SA;PWD=Cartago01");
//     const result = await connection.query(query3);
//     await connection.close();
//     return result;
//   } catch (err) {
//     console.error("Error en la consulta ODBC:", err);
//     throw err;
//   }
// }

// ejecutarConsultaODBC(query3)
// .then((data) => console.log(data))
// .catch((err) => console.error(err));

import sql from "mssql";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ErrorConnectDB } from "../util/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFile = `../.env.${process.env.NODE_ENV || "development"}`;
const envPath = path.resolve(__dirname, envFile);
dotenv.config({ path: envPath });

const config = {
  server: process.env.DB_HOST_SQL_SERVER, // Dirección IP de la base de datos moncau2
  database: process.env.DB_DATABASE_SQL_SERVER,
  user: process.env.DB_USER_SQL_SERVER,
  password: process.env.DB_PASSWORD_SQL_SERVER,
  port: process.env.DB_PORT_SQL_SERVER,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    tdsVersion: "7_1", // <--- Versión TDS (prueba con 7_1, 7_2, 7_3, 7_4)
    useUTC: false, // Necesario para versiones muy antiguas
  },
};

export async function getServideskData() {
  // if (os.platform() !== 'win32') {
  //   return [];
  // }

  let pool;

  try {
    pool = await sql.connect(config);

    console.log("Database servidesk connection is active...");
    const result = await pool.request().query(query3);
    return result.recordset;
  } catch (err) {
    throw new ErrorConnectDB(
      "Error database sql server: getServideskData()",
      err
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
