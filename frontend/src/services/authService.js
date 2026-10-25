
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function loginUser(credentials) {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    credentials
  );

  const { token } = response.data;

  if (token) {
    localStorage.setItem("smarthr_token", token);
  }

  return response.data;
}

export async function registerCompany(companyData) {
  const response = await axios.post(
    `${API_URL}/auth/register-company`,
    companyData
  );

  return response.data;
}

export function logoutUser() {
  localStorage.removeItem("smarthr_token");
  localStorage.removeItem("smarthr_user");
}

export function getAuthToken() {
  return localStorage.getItem("smarthr_token");
}
