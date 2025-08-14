
export const BASE_API_URL = "http://localhost:5000";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || BASE_API_URL;

export const API_ENDPOINTS = {
  USER: `${VITE_BACKEND_URL}/api/v1/user`,
  RESTAURANT: `${VITE_BACKEND_URL}/api/v1/restaurant`,
  ORDER: `${VITE_BACKEND_URL}/api/v1/order`,
  MENU: `${VITE_BACKEND_URL}/api/v1/menu`, 
};

export default API_ENDPOINTS;
