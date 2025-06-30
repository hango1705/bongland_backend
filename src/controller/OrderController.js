const OrderService = require("../services/OrderService");

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      paymentMethod,
      deliveryMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      shippingAddress,
      specialInstructions
    } = req.body;

    // Validate required fields
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        status: "ERR",
        message: "Order must contain at least one item"
      });
    }

    if (!paymentMethod || !shippingAddress) {
      return res.status(400).json({
        status: "ERR",
        message: "Payment method and shipping address are required"
      });
    }

    // Validate shipping address
    const { fullName, address, city, phone } = shippingAddress;
    if (!fullName || !address || !city || !phone) {
      return res.status(400).json({
        status: "ERR",
        message: "Missing required shipping information"
      });
    }

    // Validate prices
    if (typeof itemsPrice !== 'number' || typeof shippingPrice !== 'number' || typeof totalPrice !== 'number') {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid price values"
      });
    }

    // Add user ID from auth middleware
    const orderData = {
      orderItems,
      paymentMethod,
      deliveryMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      shippingAddress,
      specialInstructions,
      user: req.user.id
    };

    const response = await OrderService.createOrder(orderData);
    
    if (response.status === "ERR") {
      return res.status(400).json(response);
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};
const getAllOrderDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await OrderService.getAllOrderDetails(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const getDetailsOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }
    const response = await OrderService.getDetailsOrder(orderId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const cancelOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }
    const response = await OrderService.cancelOrderDetails(orderId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const updateOrderShipping = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { isShipping } = req.body;
    
    if (!orderId) {
      return res.status(200).json({
        status: "ERR",
        message: "The orderId is required",
      });
    }
    
    const response = await OrderService.updateOrderShipping(orderId, isShipping);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const getAllOrder = async (req, res) => {
  try {
    const data = await OrderService.getAllOrder();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const deleteManyOrder = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!ids) {
      return res.status(200).json({
        status: "ERR",
        message: "The ids is required",
      });
    }
    const response = await OrderService.deleteManyOrder(ids);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
module.exports = {
  createOrder,
  getAllOrderDetails,
  getDetailsOrder,
  cancelOrderDetails,
  updateOrderShipping,
  getAllOrder,
  deleteManyOrder,
};
