import InventoryService from "../../services/inventory/inventoryService.js";
import MobileLineService from "../../services/inventory/mobileLinesService.js";

export default class InventoryController {
  static async getLinesByEmployee(req, res, next) {
    try {
      const { status, linesByStatus } = await MobileLineService.getLines(
        "allLinesByEmployee"
      );
      return res.status(status).json(linesByStatus);
    } catch (error) {
      next(error);
    }
  }

  static async getLinesByStatus(req, res, next) {
    try {
      const { status, linesByStatus } = await MobileLineService.getLines(
        "allLinesByStatus"
      );
      return res.status(status).json(linesByStatus);
    } catch (error) {
      next(error);
    }
  }

  static async getCompareByTelefonica(req, res, next) {
    try {
      const { status, linesByTelefonica } =
        await MobileLineService.getCompareByTelefonica();
      return res.status(status).json(linesByTelefonica);
    } catch (error) {
      next(error);
    }
  }
}
