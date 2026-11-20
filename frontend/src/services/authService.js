
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const loginUser = async ({
  email,
  password,
  role,
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email: email.trim().toLowerCase(),
        password,
        role,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error.response?.status,
      error.response?.data
    );

    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("smarthr_token");
  localStorage.removeItem("smarthr_user");
};

export const getAuthToken = () => {
  return localStorage.getItem("smarthr_token");
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("smarthr_user");

    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error reading current user:", error);
    return null;
  }
};
