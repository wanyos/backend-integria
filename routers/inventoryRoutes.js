import express from "express";

import InventoryController from "../controllers/inventory/inventoryController.js";

const invnetoryRouter = express.Router();


invnetoryRouter.get(
  "/mobile-lines/byemployee",
  InventoryController.getLinesByEmployee
);

invnetoryRouter.get(
  "/mobile-lines/bystatus",
  InventoryController.getLinesByStatus
);


// invnetoryRouter.get(
//   "/mobile-newlines/count",
//   InventoryController.getMobileNewLinesCount
// );
// invnetoryRouter.get(
//   "/mobile-inuselines/count",
//   InventoryController.getMobileInuseLinesCount
// );

// invnetoryRouter.get(
//   "/mobile-errorstatuslines/count",
//   InventoryController.getMobileErrorStatusCount
// );

export default invnetoryRouter;
