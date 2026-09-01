const BASE_URL = "http://localhost:8080";

export const askQuestion = async (question) => {
  const response = await fetch(
    `${BASE_URL}/ai/ask?question=${encodeURIComponent(question)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to get response from server");
  }

  return response.text();
};