// purchaseService.js
import axios from 'axios';

const API_URL = "http://localhost:3001/api";

export const getPurchases = async () => {
  try {
    const token = localStorage.getItem("token");
    // Ganti endpoint menjadi /pembelian
    const response = await axios.get(`${API_URL}/pembelian`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error in getPurchases:', error);
    throw error;
  }
};

export const getPurchasesById = async (purchaseId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/details/pembelian/${purchaseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error in getPurchasesById:', error);
    throw error;
  }
};

export const getPurchasesByProductId = async (productId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/details/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error in getPurchasesByProductId:', error);
    throw error;
  }
};


export const getSupplierProducts = async (supplierId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/products/supplier/list/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error in getSupplierProducts:', error);
    throw error;
  }
};

export const createPurchase = async (purchaseData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/pembelian`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response dari backend di createPurchase:', response.data); // Debugging
      return response.data;
    } catch (error) {
      console.error('Error in createPurchase:', error.response || error); // Tambahkan error.response
      throw error;
    }
  };
  
  