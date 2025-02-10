// src/services/supplierService.js
import axios from 'axios';

const API_URL = "http://localhost:3001/api";

export const getSuppliers = async () => {
  try {
    const adminToken = localStorage.getItem("admin_token");
    const response = await axios.get(`${API_URL}/suppliers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error in getSuppliers:', error);
    throw error;
  }
};