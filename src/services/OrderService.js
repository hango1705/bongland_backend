const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("./EmailService");

const createOrder = async (orderData) => {
  try {
    // Make sure we have user data
    if (!orderData.user) {
      console.error("Missing user ID in order data");
      return {
        status: "ERR",
        message: "User ID is required for creating an order"
      };
    }

    // Check stock availability for all products first
    for (const item of orderData.orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return {
          status: "ERR",
          message: `Product ${item.name} not found`
        };
      }
      if (product.countInStock < item.amount) {
        return {
          status: "ERR",
          message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}`
        };
      }
    }

    // Create order first
    const createdOrder = await Order.create(orderData);
    if (!createdOrder) {
      console.error("Failed to create order - no error but null result");
      return {
        status: "ERR",
        message: "Failed to create order"
      };
    }

    // Update product stock and sold count
    const stockUpdatePromises = orderData.orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      product.countInStock = Number(product.countInStock || 0) - item.amount;
      product.sold = Number(product.sold || 0) + item.amount;
      return product.save();
    });

    await Promise.all(stockUpdatePromises);

    // Send confirmation email
    try {
      // Only send email if we have the user's email
      if (orderData.email) {
        await EmailService.sendEmailCreateOrder(orderData.email, orderData.orderItems);
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    return {
      status: "OK",
      message: "Order created successfully",
      data: createdOrder
    };
  } catch (error) {
    console.error("Error in createOrder service:", error);
    return {
      status: "ERR",
      message: error.message || "Internal server error when creating order"
    };
  }
};

// Add a method to update order shipping status
const updateOrderShipping = (id, shippingStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(id);
      if (!order) {
        resolve({
          status: "ERR",
          message: "Order not found"
        });
        return;
      }
      
      order.isShipping = shippingStatus;
      await order.save();
      
      resolve({
        status: "OK",
        message: "Updated shipping status successfully",
        data: order
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Cancel order with proper inventory restocking
const cancelOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(id);
      if (!order) {
        resolve({
          status: "ERR",
          message: "Order not found"
        });
        return;
      }
      
      // If already delivered, can't cancel
      if (order.isDelivered) {
        resolve({
          status: "ERR",
          message: "Cannot cancel a delivered order"
        });
        return;
      }
      
      // Mark as cancelled instead of deleting
      order.isCancelled = true;
      await order.save();
      
      // Restore product inventory
      const restorePromises = order.orderItems.map(async (item) => {
        await Product.findByIdAndUpdate(
          item.product,
          { 
            $inc: { 
              countInStock: item.amount,
              sold: -item.amount 
            } 
          }
        );
      });
      
      await Promise.all(restorePromises);
      
      resolve({
        status: "OK",
        message: "Order cancelled successfully",
        data: order
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.find({
        user: id,
      }).populate('user');
      
      if (!order || order.length === 0) {
        resolve({
          status: "ERR",
          message: "No orders found",
        });
        return;
      }
      
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Backend getDetailsOrder called with ID:', id);
      const order = await Order.findById(id)
        .populate('user')
        .populate({
          path: 'orderItems.product',
          model: 'Product'
        });
      
      if (!order) {
        console.log('Order not found');
        resolve({
          status: "ERR",
          message: "Order not found",
        });
        return;
      }

      console.log('Order found:', order);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: order,
      });
    } catch (e) {
      console.error('Backend error:', e);
      reject(e);
    }
  });
};

const getAllOrder = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allOrder = await Order.find();
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: allOrder,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteManyOrder = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Order.deleteMany({ _id: ids });
      resolve({
        status: "OK",
        message: "Delete order successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createOrder,
  getAllOrderDetails,
  getDetailsOrder,
  cancelOrderDetails,
  getAllOrder,
  deleteManyOrder,
  updateOrderShipping
};
