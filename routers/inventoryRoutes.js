import express from "express";

import InventoryController from "../controllers/inventory/inventoryController.js";

const invnetoryRouter = express.Router();

invnetoryRouter.get(
  "/mobile-lines/count",
  InventoryController.getMobileLinesCount
);
invnetoryRouter.get(
  "/mobile-newlines/count",
  InventoryController.getMobileNewLinesCount
);
invnetoryRouter.get(
  "/mobile-inuselines/count",
  InventoryController.getMobileInuseLinesCount
);

invnetoryRouter.get(
  "/mobile-errorstatuslines/count",
  InventoryController.getMobileErrorStatusCount
);

export default invnetoryRouter;
