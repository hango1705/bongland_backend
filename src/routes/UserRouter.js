const express = require("express");
const router = express.Router();
const userController = require("../controller/UserController");
const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.post("/log-out", userController.logoutUser);
router.put("/update-user/:id", authUserMiddleware, userController.updateUser);
router.delete("/delete-user/:id", authMiddleware, userController.deleteUser);
router.post("/delete-many", authMiddleware, userController.deleteManyUser);
router.get("/getAll", authMiddleware, userController.getAllUser);
router.get(
  "/get-details/:id",
  authUserMiddleware,
  userController.getDetailsUser
);
router.post("/refresh-token", userController.refreshToken);

// New routes for address management
router.put("/update-address/:id", authUserMiddleware, userController.updateUserAddress);

// New routes for wishlist management
router.post("/wishlist/add/:id", authUserMiddleware, userController.addToWishlist);
router.post("/wishlist/remove/:id", authUserMiddleware, userController.removeFromWishlist);
router.get("/wishlist/:id", authUserMiddleware, userController.getWishlist);

module.exports = router;
