const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { email, password, confirmPassword } = newUser;
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser !== null) {
        resolve({
          status: "ERR",
          message: "The email already exists",
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
        email,
        password: hash,
        address: {
          address: '',
          city: '',
          ward: '',
          district: '',
          province: '',
          wardCode: '',
          districtCode: '',
          provinceCode: ''
        }
      });
      if (createdUser) {
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdUser,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The email is not defined",
        });
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);

      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "The password or user is incorrect",
        });
      }
      const access_token = await generalAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });
      const refresh_token = await generalRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });
      resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
      // }
    } catch (e) {
      reject(e);
    }
  });
};
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });

      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "User is not defined",
        });
      }
      
      if (data.address) {
        if (typeof data.address === 'string') {
          data.address = {
            address: data.address,
            city: data.city || '',
            ward: '',
            district: '',
            province: '',
            wardCode: '',
            districtCode: '',
            provinceCode: ''
          };
          delete data.city;
        }
      }
      
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const updateUserAddress = (id, addressData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        address,
        ward,
        district,
        province,
        wardCode,
        districtCode,
        provinceCode
      } = addressData;
      
      const checkUser = await User.findOne({
        _id: id,
      });

      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "User is not defined",
        });
        return;
      }
      
      const city = province ? (district ? `${district}, ${province}` : province) : '';
      
      const updatedUser = await User.findByIdAndUpdate(
        id, 
        { 
          address: {
            address: address || '',
            city,
            ward: ward || '',
            district: district || '',
            province: province || '',
            wardCode: wardCode || '',
            districtCode: districtCode || '',
            provinceCode: provinceCode || ''
          }
        }, 
        { new: true }
      );
      
      resolve({
        status: "OK",
        message: "Address updated successfully",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        _id: id,
      });

      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "User is not defined",
        });
      }
      await User.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete user successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};
const deleteManyUser = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.deleteMany({ _id: ids });
      resolve({
        status: "OK",
        message: "Delete user successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};
const getAllUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: allUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id,
      });
      if (user === null) {
        resolve({
          status: "OK",
          message: "User is not defined",
        });
      }
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: user,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const addToWishlist = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        resolve({
          status: "ERR",
          message: "User not found"
        });
        return;
      }
      
      if (user.wishlist && user.wishlist.includes(productId)) {
        resolve({
          status: "OK",
          message: "Product already in wishlist",
          data: user
        });
        return;
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: productId } },
        { new: true }
      );
      
      resolve({
        status: "OK",
        message: "Product added to wishlist",
        data: updatedUser
      });
    } catch (e) {
      reject(e);
    }
  });
};
const removeFromWishlist = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        resolve({
          status: "ERR",
          message: "User not found"
        });
        return;
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId } },
        { new: true }
      );
      
      resolve({
        status: "OK",
        message: "Product removed from wishlist",
        data: updatedUser
      });
    } catch (e) {
      reject(e);
    }
  });
};
const getWishlist = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId).populate('wishlist');
      
      if (!user) {
        resolve({
          status: "ERR",
          message: "User not found"
        });
        return;
      }
      
      resolve({
        status: "OK",
        message: "Wishlist retrieved successfully",
        data: user.wishlist || []
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  updateUserAddress,
  deleteUser,
  getAllUser,
  getDetailsUser,
  deleteManyUser,
  addToWishlist,
  removeFromWishlist,
  getWishlist
};
