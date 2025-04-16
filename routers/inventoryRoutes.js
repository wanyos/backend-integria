import express from 'express'

import InventoryController from '../controllers/inventory/inventoryController.js'

const invnetoryRouter = express.Router()

invnetoryRouter.get('/', InventoryController.getInventory)

export default invnetoryRouter
