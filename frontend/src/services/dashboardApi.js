const API_BASE_URL = "http://localhost:8000/api";

export async function fetchDashboard() {
  const response = await fetch(`${API_BASE_URL}/dashboard`);

  if (!response.ok) {
    throw new Error(
      `Dashboard API failed: ${response.status}`
    );
  }

  return response.json();
}