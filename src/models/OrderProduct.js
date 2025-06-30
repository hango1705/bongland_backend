const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true,
      },
      city: { type: String },
      ward: { type: String },
      district: { type: String },
      province: { type: String },
      wardCode: { type: String },
      districtCode: { type: String },
      provinceCode: { type: String },
      phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    deliveryMethod: { 
      type: String, 
      enum: ['standard', 'express', 'fast'], 
      default: 'standard' 
    },
    specialInstructions: { type: String },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String }
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    isShipping: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
