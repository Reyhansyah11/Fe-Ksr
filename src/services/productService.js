import API from "./api"; // Axios instance

export const getProductsBySupplier = async () => {
  const supplierId = localStorage.getItem("supplier_id");
  if (!supplierId) {
    throw new Error("Supplier ID not found. Please log in.");
  }

  try {
    const response = await API.get(`/products/supplier/list/${supplierId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await API.post(`/products/supplier`, productData);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const response = await API.put(`/products/supplier/${id}`, productData);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/supplier/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};
