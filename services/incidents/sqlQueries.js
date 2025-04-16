const QUERIES = {
  allIncidents: 'SELECT * FROM tincidencia LIMIT 100',
  getTenIncidents: `SELECT id_incidencia, inicio, id_creator FROM tincidencia ORDER BY id_incidencia DESC LIMIT 10;`,

  totalIncidents: `select count(*) as count from tincidencia WHERE inicio > ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY);`,
  openIncidents: `SELECT COUNT(*) AS count FROM tincidencia WHERE inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY)`,
  closeIncidents: `SELECT COUNT(*) AS count FROM tincidencia WHERE inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01'`,
  pendingIncidents: `SELECT COUNT(*) AS count FROM tincidencia WHERE inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY) AND cierre < '0001-01-01'`,

  // media de incidencias gestionadas en un rango de fechas
  avgIncidents: `SELECT AVG(TIMESTAMPDIFF(MINUTE, inicio, cierre)) AS minutos
                FROM tincidencia WHERE cierre IS NOT NULL AND cierre > '0001-01-01' AND inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY);`,

  // Consultas para obtener incidentes por año
  allIncidentsYearOpen: `
      SELECT DATE(inicio) as date, COUNT(*) as count
      FROM tincidencia
      WHERE YEAR(inicio) = ?
      GROUP BY DATE(inicio);
    `,
  allIncidentsYearClose: `
      SELECT DATE(cierre) as date, COUNT(*) as count
      FROM tincidencia
      WHERE YEAR(cierre) = ?
      GROUP BY DATE(cierre);
    `,

  // Incidencias abiertas por id_grupo 2=operadores, 7=tecnicos, 8=administradores, 148=ciberseguridad, su estado es no cerrado y su fecha es 0
  openIncidentsGr: `SELECT id_incidencia, inicio, id_grupo FROM tincidencia WHERE cierre < "0001-01-01" AND id_grupo IN (2, 7, 8, 148) AND estado <> 7;`,

  // Todas incidencias abiertas en rango de fechas y por grupos (sustituir a todas las anteoriores)
  allIncOpenByGroup: `SELECT
    CASE
        WHEN id_grupo = 2 THEN 'Operadores'
        WHEN id_grupo = 7 THEN 'Tecnicos'
        WHEN id_grupo = 8 THEN 'Administradores'
        WHEN id_grupo = 148 THEN 'Ciberseguridad'
        WHEN id_grupo IN (19, 84, 86, 87, 122, 126, 149, 141, 21) THEN 'Apl.Horizontales'
        WHEN id_grupo IN (85, 20, 23, 40, 90, 91, 101, 43, 147) THEN 'Apl.Negocio'
        WHEN id_grupo IN (22, 24, 28, 31, 56, 154, 50, 52, 59, 32) THEN 'Tec.Externo'
        ELSE 'Otros'
    END AS grupo,
    COUNT(*) AS count FROM tincidencia  WHERE
    inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY)
		GROUP BY grupo;`,

  // Todas incidencias cerradas en rango de fechas y por grupos (sustituir a todas las anteoriores)
  allIncCloseByGroup: `SELECT
    CASE
        WHEN id_grupo = 2 THEN 'Operadores'
        WHEN id_grupo = 7 THEN 'Tecnicos'
        WHEN id_grupo = 8 THEN 'Administradores'
        WHEN id_grupo = 148 THEN 'Ciberseguridad'
        WHEN id_grupo IN (19, 84, 86, 87, 122, 126, 149, 141, 21) THEN 'Apl.Horizontales'
        WHEN id_grupo IN (85, 20, 23, 40, 90, 91, 101, 43, 147) THEN 'Apl.Negocio'
        WHEN id_grupo IN (22, 24, 28, 31, 56, 154, 50, 52, 59, 32) THEN 'Tec.Externo'
        ELSE 'Otros'
    END AS grupo,
    COUNT(*) AS count FROM tincidencia WHERE
    inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01'
		GROUP BY grupo;`,

  // Total de incidencias por rango de fechas y su localización
  allIncLocationRange: `SELECT
    SUM(CASE WHEN R.data IN ('PACIFICO', 'CERRO PLATA') THEN 1 ELSE 0 END) AS pacifico,
    SUM(CASE WHEN R.data = 'FUENCARRAL' THEN 1 ELSE 0 END) AS fuencarral,
    SUM(CASE WHEN R.data = 'LA ELIPA' THEN 1 ELSE 0 END) AS la_elipa,
    SUM(CASE WHEN R.data = 'CARABANCHEL' THEN 1 ELSE 0 END) AS carabanchel,
    SUM(CASE WHEN R.data = 'ENTREVIAS' THEN 1 ELSE 0 END) AS entrevias,
    SUM(CASE WHEN R.data = 'SANCHINARRO' THEN 1 ELSE 0 END) AS sanchinarro
    FROM tincident_field_data R
    INNER JOIN tincidencia I
    ON R.id_incident = I.id_incidencia
    AND R.id_incident_field IN (98, 103, 109, 114)
    WHERE inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY);`,

  allIncBasesRange: `SELECT
    SUM(CASE WHEN R.data LIKE '%Colon%' AND R.data LIKE '%%' THEN 1 ELSE 0 END) AS Colon,
    SUM(CASE WHEN R.data LIKE '%Escuadron%' AND R.data LIKE '%%' THEN 1 ELSE 0 END) AS Escuadron,
    SUM(CASE WHEN R.data LIKE '%Mediodia%' AND R.data LIKE '%2%' THEN 1 ELSE 0 END) AS Mediodia2,
    SUM(CASE WHEN R.data LIKE '%Mediodia%' AND R.data LIKE '%3%' THEN 1 ELSE 0 END) AS Mediodia3,
    SUM(CASE WHEN R.data LIKE '%Ntra%' AND R.data LIKE '%Recuerdo%' THEN 1 ELSE 0 END) AS Recuerdo,
    SUM(CASE WHEN R.data LIKE '%Imperial%' AND R.data LIKE '%%' THEN 1 ELSE 0 END) AS Imperial,
    SUM(CASE WHEN R.data LIKE '%Vicalvaro%' AND R.data LIKE '%%' THEN 1 ELSE 0 END) AS Vicalvaro
    FROM tincident_field_data R
    INNER JOIN tincidencia I ON R.id_incident = I.id_incidencia
    WHERE inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY);`,

  allIncParkingRange: ` SELECT
    SUM(CASE WHEN R.data LIKE '%ALMAGRO%' THEN 1 ELSE 0 END) AS Almagro,
    SUM(CASE WHEN R.data LIKE '%AVD PORTUGAL%' THEN 1 ELSE 0 END) AS AvdPortugal,
    SUM(CASE WHEN R.data LIKE '%CANALEJAS%' THEN 1 ELSE 0 END) AS Canalejas,
    SUM(CASE WHEN R.data LIKE '%FUENCARRAL123%' THEN 1 ELSE 0 END) AS Fuencarral123,
    SUM(CASE WHEN R.data LIKE '%JACINTO BENAVENTE%' THEN 1 ELSE 0 END) AS Benavente,
    SUM(CASE WHEN R.data LIKE '%MARQUES DE SALAMANCA%' THEN 1 ELSE 0 END) AS MqSalamanca,
    SUM(CASE WHEN R.data LIKE '%MONTALBAN%' THEN 1 ELSE 0 END) AS Montalban,
    SUM(CASE WHEN R.data LIKE '%NTRA SRA DEL RECUERDO%' THEN 1 ELSE 0 END) AS NtrRecuerdo,
    SUM(CASE WHEN R.data LIKE '%ORENSE%' THEN 1 ELSE 0 END) AS Orense,
    SUM(CASE WHEN R.data LIKE '%PLAZA ESPAÑA%' THEN 1 ELSE 0 END) AS PlzEspaña,
    SUM(CASE WHEN R.data LIKE '%PLAZA MAYOR%' THEN 1 ELSE 0 END) AS PlzMayor,
    SUM(CASE WHEN R.data LIKE '%RECOLETOS%' THEN 1 ELSE 0 END) AS Recoletos,
    SUM(CASE WHEN R.data LIKE '%SAN EPIFANIO%' THEN 1 ELSE 0 END) AS SanEpifanio,
    SUM(CASE WHEN R.data LIKE '%PEDRO ZEROLO%' THEN 1 ELSE 0 END) AS PedroZerolo,
    SUM(CASE WHEN R.data LIKE '%VILLA DE PARIS%' THEN 1 ELSE 0 END) AS VillaParis,
    SUM(CASE WHEN R.data LIKE '%OLAVIDE%' THEN 1 ELSE 0 END) AS Olavide,
    SUM(CASE WHEN R.data LIKE '%WANDA METROPOLITANO%' THEN 1 ELSE 0 END) AS Metropolitano,
    SUM(CASE WHEN R.data LIKE '%FUENTE DE LA MORA%' THEN 1 ELSE 0 END) AS FuenteMora
FROM tincident_field_data R
INNER JOIN tincidencia I ON R.id_incident = I.id_incidencia
WHERE inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY);`,

  // total incidencias por horas en rango de fechas (line-chart)
  allIncHours: `SELECT HOUR(inicio) AS hour, COUNT(*) AS count
                FROM tincidencia  WHERE inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY)  GROUP BY hour  ORDER BY hour;`,

  // total incidencias por cada dia de la semana en el rango de fechas (bar-chart)
  allIncWeekDay: `SELECT
    CASE WEEKDAY(inicio)
        WHEN 0 THEN 'Mon'
        WHEN 1 THEN 'Tue'
        WHEN 2 THEN 'Wed'
        WHEN 3 THEN 'Thu'
        WHEN 4 THEN 'Fri'
        WHEN 5 THEN 'Sat'
        WHEN 6 THEN 'Sun'
    END AS day_of_week,
    COUNT(*) AS count
    FROM  tincidencia WHERE  inicio >= ? AND inicio <= DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY day_of_week ORDER BY
    FIELD(day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');`,

  // tiempo medio de respuesta por grupo en el rango de fechas (table)
  avgResponseByGroup: `SELECT
    CASE
        WHEN id_grupo IN (2) THEN 'Operadores'
        WHEN id_grupo IN (7) THEN 'Tecnicos'
        WHEN id_grupo IN (8) THEN 'Administradores'
        WHEN id_grupo IN (148) THEN 'Ciberseguridad'
        WHEN id_grupo IN (19, 84, 86, 87, 122, 126, 149, 141, 21) THEN 'Apl.Horizontales'
        WHEN id_grupo IN (85, 20, 23, 40, 90, 91, 101, 43, 147) THEN 'Apl.Negocio'
        WHEN id_grupo IN (22, 24, 28, 31, 56, 154, 50, 52, 59, 32) THEN 'Tec.Externo'
        ELSE 'Otros'
    END AS grupo,
    AVG(TIMESTAMPDIFF(MINUTE, inicio, cierre)) AS minutos
  FROM
    tincidencia
  WHERE
    cierre IS NOT NULL
    AND cierre > '0001-01-01'
    AND inicio >= ?
    AND inicio <= DATE_ADD(?, INTERVAL 1 DAY)
    AND id_grupo IN (2, 7, 8, 148, 19, 84, 86, 87, 122, 126, 149, 141, 21, 85, 20, 23, 40, 90, 91, 101, 43, 147, 22, 24, 28, 31, 56, 154, 50, 52, 59, 32)
      GROUP BY grupo;`,

  // incidencias desde el 2015 hasta año anterior, cantidad por meses
  allIncByMonths: `SELECT
    YEAR(cierre) AS year,
    MONTH(cierre) AS month,
    COUNT(*) AS count
FROM
    tincidencia
WHERE
    cierre >= '2015-01-01'
    AND cierre < DATE_FORMAT(CURDATE(), '%Y-01-01')
    AND cierre > '0001-01-01'
GROUP BY
    YEAR(cierre),
    MONTH(cierre)
ORDER BY
    YEAR(cierre),
    MONTH(cierre);`,

  // incidencias abiertas para informe semanal
  allExternalResolutor: `SELECT
  I.id_incidencia,
    DATE_FORMAT(inicio, '%Y-%m-%d') AS inicio,
    DATE_FORMAT(cierre, '%Y-%m-%d') AS cierre,
    I.titulo AS titulo,
    I.descripcion AS descripcion,
    I.id_creator,
    G.id_grupo as id_resolutor,
    G.nombre AS resolutor
FROM tincidencia I
LEFT JOIN tgrupo G ON I.id_grupo = G.id_grupo
WHERE I.inicio BETWEEN ? AND ? AND I.cierre < '0001-01-01' AND estado <> 7
AND G.id_grupo NOT IN (2, 5, 7, 8, 9, 42, 46, 157)
ORDER BY G.id_grupo asc;`,

  // incidencias tecnologia
  allIncTechnology: `SELECT DISTINCT
      I.id_incidencia AS Num_Incidencia,
      S.name AS Estado,
      I.inicio AS FechaApertura,
      I.cierre AS FechaCierre,
      U.nombre_real AS Usuario,
      E.telefono AS Extension,
      I.Titulo AS Resumen,
      G.nombre AS Grupo,
      E.nombre_real AS Tecnico_Asignado,
      T.name AS Descripcion_Tipo,
      DATE_FORMAT(I.actualizacion,"%d/%m/%Y") AS "Ultima_actuacion",
      R.data AS Localizacion
FROM tincident_field_data R
LEFT JOIN tincidencia I ON R.id_incident_field IN (98,103,109,114) AND (R.id_incident = I.id_incidencia)
LEFT JOIN tincident_status S ON I.estado = S.id
LEFT JOIN tusuario U ON I.id_creator = U.id_usuario
LEFT JOIN tusuario E ON I.id_usuario = E.id_usuario
LEFT JOIN tgrupo G ON I.id_grupo = G.id_grupo
LEFT JOIN tincident_type T ON I.id_incident_type = T.id
WHERE (I.inicio >= ?) AND (I.inicio <= ?)
ORDER BY I.id_incidencia;`,
}

export default QUERIES

// tiempo medio de resolucion y total de incidencias gestionadas
// SELECT
//     CASE
//         WHEN id_grupo IN (2) THEN 'Operadores'
//         WHEN id_grupo IN (7) THEN 'Tecnicos'
//         WHEN id_grupo IN (8) THEN 'Administradores'
//         WHEN id_grupo IN (148) THEN 'Ciberseguridad'
//         WHEN id_grupo IN (19, 84, 86, 87, 122, 126, 149, 141, 21) THEN 'Apl.Horizontales'
//         WHEN id_grupo IN (85, 20, 23, 40, 90, 91, 101, 43, 147) THEN 'Apl.Negocio'
//         WHEN id_grupo IN (22, 24, 28, 31, 56, 154, 50, 52, 59, 32) THEN 'Tec.Externo'
//         ELSE 'Otros'
//     END AS grupo,
//     COUNT(*) AS total_incidencias,
//     AVG(TIMESTAMPDIFF(MINUTE, inicio, cierre)) AS minutos
// FROM
//     tincidencia
// WHERE
//     cierre IS NOT NULL
//     AND cierre > '0001-01-01'
//     AND inicio >= ?
//     AND inicio < DATE_ADD(?, INTERVAL 1 DAY)
//     AND id_grupo IN (2, 7, 8, 148, 19, 84, 86, 87, 122, 126, 149, 141, 21, 85, 20, 23, 40, 90, 91, 101, 43, 147, 22, 24, 28, 31, 56, 154, 50, 52, 59, 32)
// GROUP BY grupo;

// totalIncidents: `SELECT * FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY)`,

//   avgIncidents: `
//      SELECT
//       FLOOR(media_horas) AS horas,
//       ROUND((media_horas - FLOOR(media_horas)) * 60) AS minutos
//       FROM (
//       SELECT
//       AVG(TIMESTAMPDIFF(HOUR, inicio, cierre)) AS media_horas
//       FROM tincidencia
//       WHERE cierre > '0001-01-01' AND inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY)
//       ) AS subquery`,

// openIncidentsGr: `SELECT id_incidencia, inicio, id_grupo FROM tincidencia WHERE (cierre IS NULL OR cierre < '0001-01-01 00:00:00') AND id_grupo IN (2, 7, 8, 148);`,

//   allIncLocationRange: `SELECT count(*) as total FROM tincident_field_data R
// INNER JOIN
//     tincidencia I
//     ON R.id_incident = I.id_incidencia
//     AND R.id_incident_field IN (98, 103, 109, 114)
// WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY)
//         AND R.data IN(?);`,

//   allIncLocationRange: `SELECT count(*) as total FROM tincident_field_data R
// LEFT JOIN
//     tincidencia I
//     ON R.id_incident = I.id_incidencia
//     AND R.id_incident_field IN (98, 103, 109, 114)
// LEFT JOIN
//     tincident_status S
//     ON I.estado = S.id
// LEFT JOIN
//     tusuario U
//     ON I.id_creator = U.id_usuario
// LEFT JOIN
//     tusuario E
//     ON I.id_usuario = E.id_usuario
// LEFT JOIN
//     tgrupo G
//     ON I.id_grupo = G.id_grupo
// LEFT JOIN
//     tincident_type T
//     ON I.id_incident_type = T.id
// WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY)
//        AND R.data IN(?);`,

//   allIncBasesRange: `SELECT count(*) as total FROM tincident_field_data R
// LEFT JOIN
//     tincidencia I
//     ON R.id_incident = I.id_incidencia
//     AND R.id_incident_field IN (98, 103, 109, 114)
// WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY)
//         AND R.data LIKE ? AND R.data LIKE ?;`,

// allIncBasesRange: `SELECT COUNT(*) AS total
// FROM (
//     SELECT R.id_incident
//     FROM tincident_field_data R
//     WHERE R.id_incident_field IN (98, 103, 109, 114)
//       AND R.data LIKE ?
//       AND R.data LIKE ?
// ) AS FilteredData
// INNER JOIN tincidencia I
//     ON FilteredData.id_incident = I.id_incidencia
// WHERE I.inicio >= ?
//   AND I.inicio < DATE_ADD(?, INTERVAL 1 DAY);`,

// Todas incidencias por rango de fechas y grupos, abiertas
// allIncOpenOperadores: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND id_grupo = 2;`,
// allIncOpenTecnicos: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND id_grupo = 7;`,
// allIncOpenAdministradores: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND id_grupo = 8;`,
// allIncOpenCiberseguridad: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND id_grupo = 148;`,
// allIncOpenHorizontales: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND id_grupo IN (19,84,86,87,122,126,149,141,21);`,
// allIncOpenNegocio: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND id_grupo IN (85,20,23,40,90,91,101,43,147);`,
// allIncOpenExterno: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND id_grupo IN (22,24,28,31,56,154,50,52,59,32);`,

// Todas incidencias por rango de fechas y grupos, cerradas
// allIncCloseOperadores: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01' AND id_grupo = 2;`,
// allIncCloseTecnicos: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01' AND id_grupo = 7;`,
// allIncCloseAdministradores: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01' AND id_grupo = 8;`,
// allIncCloseCiberseguridad: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01' AND id_grupo = 148;`,
// allIncCloseHorizontales: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01' AND id_grupo IN (19,84,86,87,122,126,149,141,21);`,
// allIncCloseNegocio: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01' AND id_grupo IN (85,20,23,40,90,91,101,43,147);`,
// allIncCloseExterno: `SELECT COUNT(*) as count FROM tincidencia WHERE inicio >= ? AND inicio < DATE_ADD(?, INTERVAL 1 DAY) AND cierre > '0001-01-01' AND id_grupo IN (22,24,28,31,56,154,50,52,59,32);`,
