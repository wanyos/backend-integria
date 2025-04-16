import { getServideskData } from '../../db/odbc.js'
import dayjs from 'dayjs'
import { DatabaseError } from '../../util/errors.js'

const data = {
  iss_fuencarral: 'NIVEL 0 IISS FUENCARRAL',
  iss_carabanchel: 'NIVEL 0 IISS CARABANCHEL',
  iss_movilidad: 'NIVEL 0 IISS Bases Y Aparcamientos',
  iss_la_elipa: 'NIVEL 0 IISS LA ELIPA',
  iss_entrevias: 'NIVEL 0 IISS ENTREVIAS',
  iss_pacifico: 'NIVEL 0 IISS',
  iss_sanchinarro: 'NIVEL 0 IISS SANCHINARRO',
}

const convertTimestampToDate = (timestamp) => {
  return dayjs.unix(timestamp)
}

// crea array con los grupos de instalaciones y sus incidencias
const getServideskInc = async (issInc) => {
  const groupedByGrupo = {}
  if (issInc.length > 0) {
    issInc.forEach((item) => {
      const grupo = item.Grupo

      item.FechaApertura = item.FechaApertura ? convertTimestampToDate(item.FechaApertura) : null
      item.FechaCierre = item.FechaCierre ? convertTimestampToDate(item.FechaCierre) : null

      const clave = Object.keys(data).find((key) => data[key] === grupo)

      if (clave) {
        if (!groupedByGrupo[clave]) {
          groupedByGrupo[clave] = []
        }
        groupedByGrupo[clave].push(item)
      }
    })
    return groupedByGrupo
  }
}

export default class IssIncidentsService {
  static async getIssIncidents() {
    try {
      const iss_incidents = await getServideskData()
      const grouoIncidents = await getServideskInc(iss_incidents)
      return { status: 200, incidents: grouoIncidents }
    } catch (error) {
      console.error('Database error servidesk:', error.message)
      throw new DatabaseError('Failed to fetch servidesk from the database')
    }
  }
}
