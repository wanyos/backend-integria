import InventoryService from '../../services/inventory/inventoryService.js'

export default class InventoryController {
  static async getInventory(req, res, next) {
    try {
      const { status, inventory } = await InventoryService.getInventory()
      return res.status(status).json(inventory)
    } catch (error) {
      console.error(error)
      next(error)
    }
  }
}
