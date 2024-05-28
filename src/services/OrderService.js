const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("./EmailService");

const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
    const {
      orderItems,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullName,
      address,
      city,
      phone,
      user,
      email,
      isPaid,
      paidAt,
    } = newOrder;
    try {
      const promises = orderItems.map(async (order) => {
        const productData = await Product.findOneAndUpdate(
          {
            _id: order.product,
            countInStock: { $gte: order.amount },
          },
          { $inc: { countInStock: -order.amount, sold: +order.amount } },
          { new: true }
        );
        if (productData) {
          return { status: "OK", message: "Success" };
        } else {
          return { status: "OK", message: "ERR", id: order.product };
        }
      });
      const results = await Promise.all(promises);
      const newData = results && results.filter((item) => item.id);
      if (newData.length) {
        const arrId = [];
        newData.forEach((item) => {
          arrId.push(item.id);
        });
        resolve({
          status: "ERR",
          message: `Sản phẩm với id${newData.join(",")} đã hết hàng`,
        });
      } else {
        const createdOrder = await Order.create({
          orderItems,
          shippingAddress: { fullName, address, city, phone },
          paymentMethod,
          itemsPrice,
          shippingPrice,
          totalPrice,
          user: user,
          isPaid,
          paidAt,
        });
        if (createdOrder) {
          resolve({ status: "OK", message: "Success" });
        }
      }
      resolve({ status: "OK", message: "Success" });
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
      });
      if (order === null) {
        resolve({
          status: "ERR",
          message: "Order is not defined",
        });
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
      const order = await Order.findById({
        _id: id,
      });
      if (order === null) {
        resolve({
          status: "ERR",
          message: "Order is not defined",
        });
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
const cancelOrderDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkOrder = await Order.findOne({
        _id: id,
      });
      if (checkOrder === null) {
        resolve({
          status: "OK",
          message: "Order is not defined",
        });
      }
      await Order.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete order successfully",
      });
    } catch (e) {
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
};
