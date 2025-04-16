import express from 'express'

import IncidentsController from '../controllers/incidents/incidentsController.js'

const incidentsRouter = express.Router()

incidentsRouter.get('/', IncidentsController.getIncidents)
incidentsRouter.get(
  '/external-resolutor/:startDate/:endDate',
  IncidentsController.getResolutorExternal,
)
incidentsRouter.get(
  '/integria-technology/:startDate/:endDate',
  IncidentsController.getIncIntegriaTechnology,
)
incidentsRouter.get('/iss', IncidentsController.getIssIncidents)

export default incidentsRouter
