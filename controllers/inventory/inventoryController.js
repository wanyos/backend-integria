import InventoryService from "../../services/inventory/inventoryService.js";
import MobileLineService from "../../services/inventory/mobileLinesService.js";

export default class InventoryController {
  static async getMobileLinesCount(req, res, next) {
    try {
      const { status, totalMobileLines } =
        await InventoryService.getMobileLinesCount();
      return res.status(status).json(totalMobileLines);
    } catch (error) {
      next(error);
    }
  }

  static async getLinesByStatus(req, res, next) {
    try {
      const { status, linesByStatus } =
        await MobileLineService.getLinesGroupedByStatus();
      return res.status(status).json(linesByStatus);
    } catch (error) {
      next(error);
    }
  }

  static async getMobileNewLinesCount(req, res, next) {
    try {
      const { status, totalMobileNewLines } =
        await MobileLineService.getMobileNewLinesCount();
      return res.status(status).json(totalMobileNewLines);
    } catch (error) {
      next(error);
    }
  }

  static async getMobileInuseLinesCount(req, res, next) {
    try {
      const { status, totalMobileInuseLines } =
        await MobileLineService.getMobileInuseLinesCount();
      return res.status(status).json(totalMobileInuseLines);
    } catch (error) {
      next(error);
    }
  }

  static async getMobileErrorStatusCount(req, res, next) {
    try {
      const { status, totalMobileErrorStatusLines } =
        await MobileLineService.getMobileErrorStatusLinesCount();
      return res.status(status).json(totalMobileErrorStatusLines);
    } catch (error) {
      next(error);
    }
  }
}
