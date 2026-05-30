const API_BASE_URL = "http://localhost:5000/api";

export async function saveAttemptToBackend({ questions, submission, summary }) {
  const response = await fetch(`${API_BASE_URL}/attempts/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questions,
      submission,
      summary,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save attempt.");
  }

  return data;
}

export async function getAttemptsByMode(mode) {
  const response = await fetch(`${API_BASE_URL}/attempts?mode=${mode}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch attempts.");
  }

  return data.data;
}

export async function getAttemptByFolder(mode, folderName) {
  const response = await fetch(
    `${API_BASE_URL}/attempts/${mode}/${encodeURIComponent(folderName)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to open attempt.");
  }

  return data.data;
}

export async function deleteAttemptByFolder(mode, folderName) {
  const response = await fetch(
    `${API_BASE_URL}/attempts/${mode}/${encodeURIComponent(folderName)}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete attempt.");
  }

  return data;
}