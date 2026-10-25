
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthConfig() {
  const token = localStorage.getItem("smarthr_token");

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getEmployees() {
  const response = await axios.get(
    `${API_URL}/employees`,
    getAuthConfig()
  );

  return response.data.employees || [];
}

export async function createEmployee(employeeData) {
  const response = await axios.post(
    `${API_URL}/employees`,
    employeeData,
    getAuthConfig()
  );

  return response.data.employee;
}

export async function updateEmployee(id, employeeData) {
  const response = await axios.put(
    `${API_URL}/employees/${id}`,
    employeeData,
    getAuthConfig()
  );

  return response.data.employee;
}

export async function updateEmployeeStatus(id, status) {
  const response = await axios.patch(
    `${API_URL}/employees/${id}/status`,
    { status },
    getAuthConfig()
  );

  return response.data.employee;
}
