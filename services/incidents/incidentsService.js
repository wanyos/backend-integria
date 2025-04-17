import { pool } from "../../db/mysql.js";
import QUERIES from "./sqlQueries.js";
import { decodeHtmlEntities } from "../../util/formattingText.js";
import { DatabaseError } from "../../util/errors.js";

export default class IncidentsService {
  static async getIncidents() {
    try {
      const [rows] = await pool.query(QUERIES.getTenIncidents);
      return { status: 200, incidents: rows };
    } catch (error) {
      throw new DatabaseError("Failed to query mysql: getIncidents()", error);
    }
  }

  // total incidencias de cada año gestionadas hasta el 2015, comienza en el ultimo año
  static async getTotalIncYears(lastYear) {
    try {
      let summary = [];
      let initYear = 2015;
      while (initYear <= lastYear) {
        const startDate = `${initYear - 1}-12-31`;
        const endDate = `${initYear + 1}-01-01`;
        const [result] = await pool.query(QUERIES.openIncidents, [
          startDate,
          endDate,
        ]);
        summary.push({ year: initYear, count: result[0]?.count || 0 });
        initYear++;
      }
      return { status: 200, incidents: summary };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getTotalIncYears()",
        error
      );
    }
  }

  // incidencias por rango de fechas, año en curso y mismo rango año anterior. Cantidad de ellas
  static async getIncidentsRange(startDate, endDate) {
    try {
      const startDateLastYear = new Date(startDate);
      startDateLastYear.setFullYear(startDateLastYear.getFullYear() - 1);

      const endDateLastYear = new Date(endDate);
      endDateLastYear.setFullYear(endDateLastYear.getFullYear() - 1);

      const startLastYear = startDateLastYear.toISOString().split("T")[0];
      const endLastYear = endDateLastYear.toISOString().split("T")[0];

      const [openInc] = await pool.query(QUERIES.openIncidents, [
        startDate,
        endDate,
      ]);
      const [closeInc] = await pool.query(QUERIES.closeIncidents, [
        startDate,
        endDate,
      ]);
      const [pendingInc] = await pool.query(QUERIES.pendingIncidents, [
        startDate,
        endDate,
      ]);
      const [avgInc] = await pool.query(QUERIES.avgIncidents, [
        startDate,
        endDate,
      ]);

      const [openIncLastYear] = await pool.query(QUERIES.openIncidents, [
        startLastYear,
        endLastYear,
      ]);
      const [closeIncLastYear] = await pool.query(QUERIES.closeIncidents, [
        startLastYear,
        endLastYear,
      ]);
      const [pendingIncLastYear] = await pool.query(QUERIES.pendingIncidents, [
        startLastYear,
        endLastYear,
      ]);
      const [avgIncLastYear] = await pool.query(QUERIES.avgIncidents, [
        startLastYear,
        endLastYear,
      ]);

      const incidentsSummary = {
        current: {
          open: openInc[0]?.count || 0,
          close: closeInc[0]?.count || 0,
          pending: pendingInc[0]?.count || 0,
          avg: {
            // hour: avgInc[0]?.horas || 0,
            minute: avgInc[0]?.minutos || 0,
          },
        },
        lastYear: {
          open: openIncLastYear[0]?.count || 0,
          close: closeIncLastYear[0]?.count || 0,
          pending: pendingIncLastYear[0]?.count || 0,
          avg: {
            // hour: avgIncLastYear[0]?.horas || 0,
            minute: avgIncLastYear[0]?.minutos || 0,
          },
        },
      };

      return { status: 200, incidents: incidentsSummary };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getIncidentsRange()",
        error
      );
    }
  }

  // todas las incidencias de un año, abiertas y cerradas. Cantidad de ellas por cada dia del año
  static async getIncidentsYear(currentYear) {
    try {
      const [openInc] = await pool.query(QUERIES.allIncidentsYearOpen, [
        currentYear,
      ]);
      const [closeInc] = await pool.query(QUERIES.allIncidentsYearClose, [
        currentYear,
      ]);
      const incidentsSummary = {
        openInc: [],
        closeInc: [],
      };

      // Procesa las incidencias abiertas
      openInc.forEach((incident) => {
        const { date, count } = incident;
        incidentsSummary.openInc.push({ date, count });
      });

      // Procesa las incidencias cerradas
      closeInc.forEach((incident) => {
        const { date, count } = incident;
        incidentsSummary.closeInc.push({ date, count });
      });

      return { status: 200, incidents: incidentsSummary };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getIncidentsYear()",
        error
      );
    }
  }

  // incidencias abiertas por cada grupo de cualquier fecha
  static async getOpenIncidentsGroup() {
    try {
      const [rows] = await pool.query(QUERIES.openIncidentsGr);
      return { status: 200, incidents: rows };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getOpenIncidentsGroup()",
        error
      );
    }
  }

  // incidencias abiertas / cerradas por rango de fechas y grupo, solo cantidades
  static async getAllIncidentsGroup(startDate, endDate) {
    try {
      const [openByGroup] = await pool.query(QUERIES.allIncOpenByGroup, [
        startDate,
        endDate,
      ]);
      const [closeByGroup] = await pool.query(QUERIES.allIncCloseByGroup, [
        startDate,
        endDate,
      ]);
      const incidentsSummary = {
        open: {
          operadores: 0,
          tecnicos: 0,
          administradores: 0,
          ciberseguridad: 0,
          horizontales: 0,
          negocio: 0,
          externo: 0,
        },
        close: {
          operadores: 0,
          tecnicos: 0,
          administradores: 0,
          ciberseguridad: 0,
          horizontales: 0,
          negocio: 0,
          externo: 0,
        },
      };

      const groupMapping = {
        Operadores: "operadores",
        Tecnicos: "tecnicos",
        Administradores: "administradores",
        Ciberseguridad: "ciberseguridad",
        "Apl.Horizontales": "horizontales",
        "Apl.Negocio": "negocio",
        "Tec.Externo": "externo",
      };

      openByGroup.forEach((row) => {
        const groupKey = groupMapping[row.grupo];
        if (groupKey) {
          incidentsSummary.open[groupKey] = row.count;
        }
      });

      closeByGroup.forEach((row) => {
        const groupKey = groupMapping[row.grupo];
        if (groupKey) {
          incidentsSummary.close[groupKey] = row.count;
        }
      });

      return { status: 200, incidents: incidentsSummary };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIncidentsGroup()",
        error
      );
    }
  }

  // incidencias abiertas en rango de fechas por localizacion, cantidad de cada localización
  static async getAllIncLocationRange(startDate, endDate) {
    try {
      const [results] = await pool.query(QUERIES.allIncLocationRange, [
        startDate,
        endDate,
      ]);

      const incidentsSummary = {
        pacifico: results[0]?.pacifico || 0,
        fuencarral: results[0]?.fuencarral || 0,
        la_elipa: results[0]?.la_elipa || 0,
        carabanchel: results[0]?.carabanchel || 0,
        entrevias: results[0]?.entrevias || 0,
        sanchinarro: results[0]?.sanchinarro || 0,
      };

      return { status: 200, incidents: incidentsSummary };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIncLocationRange()",
        error
      );
    }
  }

  // incidencias abiertas en rango de fechas por bases, cantidad de cada base
  static async getAllIncBasesRange(startDate, endDate) {
    try {
      const [results] = await pool.query(QUERIES.allIncBasesRange, [
        startDate,
        endDate,
      ]);

      const incidentsSummary = {
        colon: results[0]?.Colon || 0,
        escuadron: results[0]?.Escuadron || 0,
        mediodia2: results[0]?.Mediodia2 || 0,
        mediodia3: results[0]?.Mediodia3 || 0,
        recuerdo: results[0]?.Recuerdo || 0,
        imperial: results[0]?.Imperial || 0,
        vicalvaro: results[0]?.Vicalvaro || 0,
      };

      return { status: 200, incidents: incidentsSummary };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIncBasesRange()",
        error
      );
    }
  }

  // incidencias abiertas en rango de fechas por aparcamientos, cantidad de ellas
  static async getAllIncParkingRange(startDate, endDate) {
    try {
      const [results] = await pool.query(QUERIES.allIncParkingRange, [
        startDate,
        endDate,
      ]);

      const incidentsSummary = {
        almagro: results[0]?.Almagro || 0,
        avdPortugal: results[0]?.AvdPortugal || 0,
        canalejas: results[0]?.Canalejas || 0,
        fuencarral123: results[0]?.Fuencarral123 || 0,
        benavente: results[0]?.Benavente || 0,
        mqSalamanca: results[0]?.MqSalamanca || 0,
        montalban: results[0]?.Montalban || 0,
        recuerdo: results[0]?.NtrRecuerdo || 0,
        orense: results[0]?.Orense || 0,
        plzEspaña: results[0]?.PlzEspaña || 0,
        plzMayor: results[0]?.PlzMayor || 0,
        recoletos: results[0]?.Recoletos || 0,
        sanEpifanio: results[0]?.SanEpifanio || 0,
        pedroZerolo: results[0]?.PedroZerolo || 0,
        villaParis: results[0]?.VillaParis || 0,
        olavide: results[0]?.Olavide || 0,
        metropolitano: results[0]?.Metropolitano || 0,
        fuenteMora: results[0]?.FuenteMora || 0,
      };

      return { status: 200, incidents: incidentsSummary };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIncParkingRange()",
        error
      );
    }
  }

  // incidencias totales por horas del dia, rango de fechas
  static async getAllIncByHours(startDate, endDate) {
    try {
      const [results] = await pool.query(QUERIES.allIncHours, [
        startDate,
        endDate,
      ]);
      return { status: 200, incidents: results };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIncByHours()",
        error
      );
    }
  }

  // incidencias totales por dias, rango de fechas
  static async getAllIncByWeekdays(startDate, endDate) {
    try {
      const [results] = await pool.query(QUERIES.allIncWeekDay, [
        startDate,
        endDate,
      ]);
      return { status: 200, incidents: results };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIncByWeekdays()",
        error
      );
    }
  }

  // cantidad por meses desde el 2015
  static async getAllIncByMonths() {
    try {
      const [results] = await pool.query(QUERIES.allIncByMonths);
      return { status: 200, incidents: results };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIncByMonths()",
        error
      );
    }
  }

  static async getAllExternalResolutor(startDate, endDate) {
    try {
      const [results] = await pool.query(QUERIES.allExternalResolutor, [
        startDate,
        endDate,
      ]);
      const formatIncidentData = (incident) => ({
        ...incident,
        titulo: decodeHtmlEntities(incident.titulo),
        descripcion: decodeHtmlEntities(incident.descripcion),
        resolutor: decodeHtmlEntities(incident.resolutor),
        cierre: incident.cierre === "0000-00-00" ? null : incident.cierre,
      });

      // Crear un array de objetos con id, resolutor y incidents
      const resolutorMap = new Map();

      results.forEach((incident) => {
        const formattedIncident = formatIncidentData(incident);
        const { id_resolutor, resolutor } = formattedIncident;

        if (!resolutorMap.has(id_resolutor)) {
          resolutorMap.set(id_resolutor, {
            id: id_resolutor,
            resolutor,
            incidents: [],
          });
        }

        resolutorMap.get(id_resolutor).incidents.push(formattedIncident);
      });

      const groupedIncidents = Array.from(resolutorMap.values());

      return { status: 200, incidents: groupedIncidents };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllExternalResolutor()",
        error
      );
    }
  }

  static async getAllIntegriaTechnology(startDate, endDate) {
    try {
      const [incIntegriaTec] = await pool.query(QUERIES.allIncTechnology, [
        startDate,
        endDate,
      ]);

      const transformedData = incIntegriaTec.map((row) => {
        row.Usuario = decodeHtmlEntities(row.Usuario);
        row.Resumen = decodeHtmlEntities(row.Resumen);
        row.Grupo = decodeHtmlEntities(row.Grupo);
        row.Tecnico_Asignado = decodeHtmlEntities(row.Tecnico_Asignado);
        row.Descripcion_Tipo = decodeHtmlEntities(row.Descripcion_Tipo);
        row.Localizacion = decodeHtmlEntities(row.Localizacion);
        return row;
      });

      // separar las incidencias entre movilidad y tecnologia
      const movilidad = [];
      const tecnologia = [];

      const dataIntegria = {
        apliMovilidadd: "6.02 APLIC MOVILIDAD",
        etralux: "MOV ETRALUX",
        siepark: "MOV SIEPARK",
      };

      transformedData.forEach((item) => {
        if (item.Grupo) {
          const grupoNormalizado = item.Grupo.trim().toLowerCase();
          const isMovilidad = Object.keys(dataIntegria).some(
            (key) => dataIntegria[key].trim().toLowerCase() === grupoNormalizado
          );
          isMovilidad ? movilidad.push(item) : tecnologia.push(item);
        }
      });

      const integriaInc = { movilidad, tecnologia };
      return { status: 200, incidents: integriaInc };
    } catch (error) {
      throw new DatabaseError(
        "Failed to query mysql: getAllIntegriaTechnology()",
        error
      );
    }
  }
}
