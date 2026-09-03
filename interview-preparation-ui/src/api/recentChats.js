const BASE_URL = "";

const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (response.status === 204) {
    return;
  }

  return response.json();
};

export const getChats = async () => {
  const response = await fetch(`${BASE_URL}/api/chats`);

  return handleResponse(response, "Failed to fetch chats");
};

export const getChat = async (chatId) => {
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}`);

  return handleResponse(response, "Failed to fetch chat");
};

export const createChat = async (title) => {
  const response = await fetch(
    `${BASE_URL}/api/chats?title=${encodeURIComponent(title)}`,
    {
      method: "POST",
    },
  );

  return handleResponse(response, "Failed to create chat");
};

export const sendMessage = async (chatId, question, think) => {
  const response = await fetch(
    `${BASE_URL}/api/chats/${chatId}/messages?question=${encodeURIComponent(question)}&think=${think}`,
    {
      method: "POST",
    },
  );

  return handleResponse(response, "Failed to send message");
};

export const deleteChat = async (chatId) => {
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}`, {
    method: "DELETE",
  });

  return handleResponse(response, "Failed to delete chat");
};
