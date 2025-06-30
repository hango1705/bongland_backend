const axios = require('axios');

// Base URL for the Vietnamese address API
const VIETNAM_ADDRESS_API_URL = 'https://provinces.open-api.vn/api';

// Constants for retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Helper function to delay execution
 * @param {number} ms - Milliseconds to delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make API call with retry mechanism
 * @param {string} url - API endpoint URL
 * @param {number} retries - Number of retries left
 */
const makeApiCallWithRetry = async (url, retries = MAX_RETRIES) => {
  try {
    const response = await axios.get(url, { timeout: 5000 }); // 5 second timeout
    return response.data;
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return makeApiCallWithRetry(url, retries - 1);
    }
    throw new Error(`Failed to fetch data after ${MAX_RETRIES} retries: ${error.message}`);
  }
};

/**
 * Fetch all provinces/cities from Vietnam
 */
const getAllProvinces = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await makeApiCallWithRetry(`${VIETNAM_ADDRESS_API_URL}/p`);
      
      if (data) {
        resolve({
          status: "OK",
          message: "Get provinces successfully",
          data: data
        });
      } else {
        resolve({
          status: "ERR",
          message: "Failed to get provinces"
        });
      }
    } catch (error) {
      resolve({
        status: "ERR",
        message: `Error fetching provinces: ${error.message}`,
        error: error
      });
    }
  });
};

/**
 * Fetch all districts in a province by province code
 * @param {string} provinceCode - The code of the province
 */
const getDistrictsByProvince = (provinceCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!provinceCode) {
        resolve({
          status: "ERR",
          message: "Province code is required"
        });
        return;
      }
      
      const data = await makeApiCallWithRetry(`${VIETNAM_ADDRESS_API_URL}/p/${provinceCode}?depth=2`);
      
      if (data && data.districts) {
        resolve({
          status: "OK",
          message: "Get districts successfully",
          data: data.districts
        });
      } else {
        resolve({
          status: "ERR",
          message: "Failed to get districts"
        });
      }
    } catch (error) {
      resolve({
        status: "ERR",
        message: `Error fetching districts: ${error.message}`,
        error: error
      });
    }
  });
};

/**
 * Fetch all wards in a district by district code
 * @param {string} districtCode - The code of the district
 */
const getWardsByDistrict = (districtCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!districtCode) {
        resolve({
          status: "ERR",
          message: "District code is required"
        });
        return;
      }
      
      const data = await makeApiCallWithRetry(`${VIETNAM_ADDRESS_API_URL}/d/${districtCode}?depth=2`);
      
      if (data && data.wards) {
        resolve({
          status: "OK",
          message: "Get wards successfully",
          data: data.wards
        });
      } else {
        resolve({
          status: "ERR",
          message: "Failed to get wards"
        });
      }
    } catch (error) {
      resolve({
        status: "ERR",
        message: `Error fetching wards: ${error.message}`,
        error: error
      });
    }
  });
};

/**
 * Get full address details from codes
 * @param {Object} addressCodes - Contains provinceCode, districtCode, wardCode
 */
const getFullAddressFromCodes = ({provinceCode, districtCode, wardCode}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate input
      if (!provinceCode || !districtCode || !wardCode) {
        resolve({
          status: "ERR",
          message: "All codes (province, district, ward) are required"
        });
        return;
      }
      
      try {
        // Make parallel requests with retry mechanism
        const [provinceData, districtData, wardData] = await Promise.all([
          makeApiCallWithRetry(`${VIETNAM_ADDRESS_API_URL}/p/${provinceCode}`),
          makeApiCallWithRetry(`${VIETNAM_ADDRESS_API_URL}/d/${districtCode}`),
          makeApiCallWithRetry(`${VIETNAM_ADDRESS_API_URL}/w/${wardCode}`)
        ]);
        
        // Prepare full address from responses
        const fullAddress = {
          province: provinceData.name,
          district: districtData.name,
          ward: wardData.name,
          provinceCode,
          districtCode,
          wardCode
        };
        
        resolve({
          status: "OK",
          message: "Get full address successfully",
          data: fullAddress
        });
      } catch (error) {
        resolve({
          status: "ERR",
          message: `Error fetching full address: ${error.message}`,
          error: error
        });
      }
    } catch (error) {
      resolve({
        status: "ERR",
        message: `Unexpected error: ${error.message}`,
        error: error
      });
    }
  });
};

module.exports = {
  getAllProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  getFullAddressFromCodes
}; 