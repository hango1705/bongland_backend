const express = require("express");
const router = express.Router();
const OrderController = require("../controller/OrderController");
const {
  authUserMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");

router.post("/create", authUserMiddleware, OrderController.createOrder);
router.get(
  "/get-all-order/:id",
  authUserMiddleware,
  OrderController.getAllOrderDetails
);
router.get(
  "/get-details-order/:id",
  authUserMiddleware,
  OrderController.getDetailsOrder
);
router.delete(
  "/cancel-order/:id",
  authUserMiddleware,
  OrderController.cancelOrderDetails
);
router.put(
  "/update-shipping/:id",
  authMiddleware,
  OrderController.updateOrderShipping
);
router.post(
  "/delete-many-order",
  authMiddleware,
  OrderController.deleteManyOrder
);
router.get("/get-all-order", authMiddleware, OrderController.getAllOrder);

module.exports = router;
