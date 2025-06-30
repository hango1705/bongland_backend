const UserRouter = require("./UserRouter");
const ProductRouter = require("./ProductRouter");
const OrderRouter = require("./OrderRouter");
const PaymentRouter = require("./PaymentRouter");
const AddressRouter = require("./AddressRouter");

const routes = (app) => {
  // Add a health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "OK", 
      message: "Backend server is healthy",
      timestamp: new Date().toISOString()
    });
  });

  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/order", OrderRouter);
  app.use("/api/payment", PaymentRouter);
  app.use("/api/address", AddressRouter);
};

module.exports = routes;
