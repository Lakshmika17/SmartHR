
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Existing login API
export async function loginUser(credentials) {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    credentials
  );

  return response.data;
}

// New company registration API
export async function registerCompany(companyData) {
  const response = await axios.post(
    `${API_URL}/auth/register-company`,
    companyData
  );

  return response.data;
}
