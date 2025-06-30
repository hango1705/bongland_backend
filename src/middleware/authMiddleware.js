const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Order = require("../models/OrderProduct");
dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "ERR",
        message: "Authentication token is required"
      });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({
          status: "ERR",
          message: "Invalid or expired token"
        });
      }
      if (user?.isAdmin) {
        req.user = user;
        next();
      } else {
        console.error("Access denied - user is not admin:", user?.id);
        return res.status(403).json({
          status: "ERR",
          message: "Admin privileges required"
        });
      }
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Authentication error"
    });
  }
};

const authUserMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "ERR",
        message: "Authentication token is required"
      });
    }
    
    const orderId = req.params.id;
    
    jwt.verify(token, process.env.ACCESS_TOKEN, async function (err, user) {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({
          status: "ERR",
          message: "Invalid or expired token"
        });
      }
      
      // Store user data in request for later use
      req.user = user;
      console.log("User authenticated:", user?.id, "isAdmin:", user?.isAdmin);
      
      // If no orderId in params (like in POST /create), just check if authenticated
      if (!orderId) {
        next();
        return;
      }
      
      // For order-related endpoints, check if user owns the order or is admin
      if (req.path.includes('/order') || req.baseUrl.includes('/order')) {
        try {
          // Special case for get-all-order/:id - userId is in params
          if (req.path.includes('/get-all-order/')) {
            console.log("Accessing get-all-order for user:", orderId);
            // Check if the user is trying to access their own orders or is admin
            if (user?.isAdmin || orderId === user?.id) {
              next();
              return;
            } else {
              console.error("Access denied - user trying to access another user's orders");
              return res.status(403).json({
                status: "ERR",
                message: "Access denied - you can only view your own orders"
              });
            }
          }
          
          const order = await Order.findById(orderId);
          if (!order) {
            return res.status(404).json({
              status: "ERR",
              message: "Order not found"
            });
          }
          
          if (user?.isAdmin || order.user.toString() === user?.id) {
            next();
          } else {
            console.error("Access denied - user trying to access another user's order");
            return res.status(403).json({
              status: "ERR",
              message: "Access denied - insufficient permissions"
            });
          }
        } catch (error) {
          console.error("Error checking order ownership:", error);
          return res.status(500).json({
            status: "ERR",
            message: "Error checking permissions"
          });
        }
      } else {
        // For non-order endpoints, check if user ID matches or is admin
        if (user?.isAdmin || user?.id === orderId) {
          next();
        } else {
          console.error("Access denied - user trying to access another user's data");
          return res.status(403).json({
            status: "ERR",
            message: "Access denied - insufficient permissions"
          });
        }
      }
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Authentication error"
    });
  }
};

module.exports = {
  authMiddleware,
  authUserMiddleware,
};
