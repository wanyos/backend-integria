import IncidentsService from '../../services/incidents/incidentsService.js'
import IssIncidentsService from '../../services/incidents/issIncidents.js'

export default class IncidentsController {
  static async getIncidents(req, res, next) {
    try {
      const { status, incidents } = await IncidentsService.getIncidents()
      return res.status(status).json(incidents)
    } catch (error) {
      next(error)
    }
  }

  static async getResolutorExternal(req, res, next) {
    const { startDate, endDate } = req.params
    try {
      const { status, incidents } = await IncidentsService.getAllExternalResolutor(
        startDate,
        endDate,
      )
      return res.status(status).json(incidents)
    } catch (error) {
      next(error)
    }
  }

  static async getIncIntegriaTechnology(req, res, next) {
    const { startDate, endDate } = req.params
    try {
      const { status, incidents } = await IncidentsService.getAllIntegriaTechnology(
        startDate,
        endDate,
      )
      return res.status(status).json(incidents)
    } catch (error) {
      next(error)
    }
  }

  static async getIssIncidents(req, res, next) {
    try {
      const result = await IssIncidentsService.getIssIncidents()
      const { status, incidents } = result
      return res.status(status).json(incidents)
    } catch (error) {
      next(error)
    }
  }
}
