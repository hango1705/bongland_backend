const AddressService = require('../services/AddressService');

const getProvinces = async (req, res) => {
  try {
    const response = await AddressService.getAllProvinces();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

const getDistricts = async (req, res) => {
  try {
    const { provinceCode } = req.params;
    
    if (!provinceCode) {
      return res.status(200).json({
        status: "ERR",
        message: "Province code is required"
      });
    }
    
    const response = await AddressService.getDistrictsByProvince(provinceCode);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

const getWards = async (req, res) => {
  try {
    const { districtCode } = req.params;
    
    if (!districtCode) {
      return res.status(200).json({
        status: "ERR",
        message: "District code is required"
      });
    }
    
    const response = await AddressService.getWardsByDistrict(districtCode);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

const getFullAddress = async (req, res) => {
  try {
    const { provinceCode, districtCode, wardCode } = req.body;
    
    if (!provinceCode || !districtCode || !wardCode) {
      return res.status(200).json({
        status: "ERR",
        message: "All address codes are required"
      });
    }
    
    const response = await AddressService.getFullAddressFromCodes({
      provinceCode,
      districtCode,
      wardCode
    });
    
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getFullAddress
}; 