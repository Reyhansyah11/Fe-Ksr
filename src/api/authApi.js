import axios from "axios";

const API_URL = "http://localhost:3001/api/auth"; // Harus ada prefix REACT_APP_


const authApi = {
    login: async (email, password) => {
      try {
        console.log("Payload dikirim ke backend:", { email, password });
        const response = await axios.post(
          `${API_URL}/login`,
          { email, password },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, // Tambahkan jika menggunakan cookie/token
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error respons backend:", error.response);
        throw error.response ? error.response.data : error.message;
      }
    },
  };
  ;
  

export default authApi;
