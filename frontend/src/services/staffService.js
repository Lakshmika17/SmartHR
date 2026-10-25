
import axios from "axios";
import { getAuthToken } from "./authService";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthConfig() {
  const token = getAuthToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getStaff() {
  const response = await axios.get(
    `${API_URL}/staff`,
    getAuthConfig()
  );

  return response.data.staff;
}

export async function createStaff(staffData) {
  const response = await axios.post(
    `${API_URL}/staff`,
    staffData,
    getAuthConfig()
  );

  return response.data;
}
