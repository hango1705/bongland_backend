const express = require('express');
const router = express.Router();
const AddressController = require('../controller/AddressController');

// Get all provinces/cities in Vietnam
router.get('/provinces', AddressController.getProvinces);

// Get all districts in a specific province
router.get('/districts/:provinceCode', AddressController.getDistricts);

// Get all wards in a specific district
router.get('/wards/:districtCode', AddressController.getWards);

// Get full address details from codes
router.post('/full-address', AddressController.getFullAddress);

module.exports = router; 