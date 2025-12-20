import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

// Registration API
export const registerUser = async ({ fullName, email, password, role }) => {
  return axios.post(`${API_URL}/register`, {
    name: fullName,
    email,
    password,
    role: role.toUpperCase(),
  });
};

// Login API
export const loginUser = async ({ email, password }) => {
  return axios.post(`${API_URL}/login`, {
    email,
    password,
  });
};
