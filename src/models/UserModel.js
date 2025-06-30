const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      address: { type: String },
      ward: { type: String },
      district: { type: String },
      province: { type: String },
      wardCode: { type: String },
      districtCode: { type: String },
      provinceCode: { type: String },
      city: { type: String }
    },
    avatar: {
      type: String,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      }
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
