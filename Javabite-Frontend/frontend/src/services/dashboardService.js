import axios from "axios";

const API_URL = "http://localhost:8080";

export const getUserBookings = async () => {
  const token = localStorage.getItem("token");

  return axios.get(`${API_URL}/booking/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
