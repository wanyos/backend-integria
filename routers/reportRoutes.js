import express from 'express'

import ReportController from '../controllers/report/reportController.js'

const reportRouter = express.Router()

reportRouter.get('/range/:startDate/:endDate', ReportController.getIncidentsRange)
reportRouter.get('/group/:startDate/:endDate', ReportController.getAllIncidentsGroup)
reportRouter.get('/location/:startDate/:endDate', ReportController.getAllIncLocationRange)
reportRouter.get('/bases/:startDate/:endDate', ReportController.getAllIncBasesRange)
reportRouter.get('/parking/:startDate/:endDate', ReportController.getAllIncParkingRange)
reportRouter.get('/year/:currentYear', ReportController.getAllIncidentsYear)
reportRouter.get('/years/:lastYear', ReportController.getTotalIncYears)
reportRouter.get('/open', ReportController.getOpenIncidentsGroup)
reportRouter.get('/byhours/:startDate/:endDate', ReportController.getAllIncByHours)
reportRouter.get('/byweekdays/:startDate/:endDate', ReportController.getAllIncByWeekdays)
reportRouter.get('/bymonths', ReportController.getAllIncByMonths)

export default reportRouter
