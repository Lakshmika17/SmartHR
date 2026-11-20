
const API_URL = "http://localhost:5000/api/attrition";

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function submitAttritionAssessment(
  employeeId,
  modelInputs
) {
  return apiRequest("", {
    method: "POST",
    body: JSON.stringify({ employeeId, modelInputs }),
  });
}

export function getAttritionAssessments() {
  return apiRequest("");
}

export function getAttritionStats() {
  return apiRequest("/stats");
}

export function reviewAttritionAssessment(id, review) {
  return apiRequest(`/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify(review),
  });
}
