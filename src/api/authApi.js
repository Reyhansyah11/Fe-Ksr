import axios from "axios";

const API_URL = "http://localhost:3001/api/auth"; // Harus ada prefix REACT_APP_

const authApi = {
  login: async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Set token dan access_level berdasarkan role
      const role = response.data.user.access_level;
      
      if (role === "kasir") {
        localStorage.setItem("kasir_token", response.data.token);
        localStorage.setItem("kasir_access_level", role);
        // Simpan data kasir lainnya
        localStorage.setItem("kasir_toko_id", response.data.user.toko_id);
        localStorage.setItem("kasir_user_id", response.data.user.user_id);
        localStorage.setItem("kasir_user_name", response.data.user.user_name);
      } else if (role === "administrator") {
        localStorage.setItem("admin_token", response.data.token);
        localStorage.setItem("admin_access_level", role);
        // Simpan data admin lainnya
        localStorage.setItem("admin_toko_id", response.data.user.toko_id);
        localStorage.setItem("admin_user_id", response.data.user.user_id);
        localStorage.setItem("admin_user_name", response.data.user.user_name);
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
};
  

export default authApi;
