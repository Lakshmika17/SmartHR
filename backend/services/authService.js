
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// LOGIN
export const loginUser = async ({ email, password, role }) => {
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

    if (response.data.success && response.data.token) {
      localStorage.setItem(
        "smarthr_token",
        response.data.token
      );

      localStorage.setItem(
        "smarthr_user",
        JSON.stringify(response.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "Login error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
      "Login failed. Please try again."
    );
  }
};

// Keep compatibility with code using login(email, password, role)
export const login = (email, password, role) =>
  loginUser({ email, password, role });

// GET AUTH TOKEN
export const getAuthToken = () => {
  return localStorage.getItem("smarthr_token");
};

// GET CURRENT USER
export const getCurrentUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("smarthr_user") || "null"
    );
  } catch {
    return null;
  }
};

// LOGOUT
export const logoutUser = () => {
  localStorage.removeItem("smarthr_token");
  localStorage.removeItem("smarthr_user");
  localStorage.removeItem("token");
};
