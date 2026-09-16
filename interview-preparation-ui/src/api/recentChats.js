import { getCsrfHeaders } from "./csrf";

const BASE_URL = "";

const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return;
  }

  return response.json();
};

const streamResponse = async (response, onChunk, errorMessage) => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });

    if (chunk) {
      fullResponse += chunk;

      if (onChunk) {
        onChunk(chunk, fullResponse);
      }
    }
  }

  const remaining = decoder.decode();

  if (remaining) {
    fullResponse += remaining;

    if (onChunk) {
      onChunk(remaining, fullResponse);
    }
  }

  return fullResponse;
};

export const getChats = async () => {
  const response = await fetch(`${BASE_URL}/api/chats`, {
    credentials: "include",
  });

  return handleResponse(response, "Failed to fetch chats");
};

export const getChat = async (chatId) => {
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}`, {
    credentials: "include",
  });

  return handleResponse(response, "Failed to fetch chat");
};

export const createChat = async (title) => {
  const response = await fetch(
    `${BASE_URL}/api/chats?title=${encodeURIComponent(title)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to create chat");
};

export const sendMessage = async (chatId, question, think) => {
  const response = await fetch(
    `${BASE_URL}/api/chats/${chatId}/messages?question=${encodeURIComponent(
      question,
    )}&think=${think}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to send message");
};

export const sendMessageStream = async (chatId, question, think, onChunk) => {
  const response = await fetch(
    `${BASE_URL}/api/chats/${chatId}/messages?question=${encodeURIComponent(
      question,
    )}&think=${think}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return streamResponse(response, onChunk, "Failed to stream message response");
};

export const deleteChat = async (chatId) => {
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}`, {
    method: "DELETE",
    headers: {
      ...getCsrfHeaders(),
    },
    credentials: "include",
  });

  return handleResponse(response, "Failed to delete chat");
};

export const getGuestChats = async (guestSessionId) => {
  const response = await fetch(
    `${BASE_URL}/api/guest/chats?guestSessionId=${encodeURIComponent(
      guestSessionId,
    )}`,
    {
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to fetch guest chats");
};

export const getGuestChat = async (chatId, guestSessionId) => {
  const response = await fetch(
    `${BASE_URL}/api/guest/chats/${chatId}?guestSessionId=${encodeURIComponent(
      guestSessionId,
    )}`,
    {
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to fetch guest chat");
};

export const createGuestChat = async (title, guestSessionId) => {
  const response = await fetch(
    `${BASE_URL}/api/guest/chats?title=${encodeURIComponent(
      title,
    )}&guestSessionId=${encodeURIComponent(guestSessionId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to create guest chat");
};

export const sendGuestMessage = async (
  chatId,
  guestSessionId,
  question,
  think,
) => {
  const response = await fetch(
    `${BASE_URL}/api/guest/chats/${chatId}/messages?guestSessionId=${encodeURIComponent(
      guestSessionId,
    )}&question=${encodeURIComponent(question)}&think=${think}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to send guest message");
};

export const sendGuestMessageStream = async (
  chatId,
  guestSessionId,
  question,
  think,
  onChunk,
) => {
  const response = await fetch(
    `${BASE_URL}/api/guest/chats/${chatId}/messages?guestSessionId=${encodeURIComponent(
      guestSessionId,
    )}&question=${encodeURIComponent(question)}&think=${think}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return streamResponse(
    response,
    onChunk,
    "Failed to stream guest message response",
  );
};

export const deleteGuestChat = async (chatId, guestSessionId) => {
  const response = await fetch(
    `${BASE_URL}/api/guest/chats/${chatId}?guestSessionId=${encodeURIComponent(
      guestSessionId,
    )}`,
    {
      method: "DELETE",
      headers: {
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to delete guest chat");
};

export const transferGuestChats = async (guestSessionId) => {
  const response = await fetch(
    `${BASE_URL}/api/guest/transfer?guestSessionId=${encodeURIComponent(
      guestSessionId,
    )}`,
    {
      method: "POST",
      headers: {
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  return handleResponse(response, "Failed to transfer guest chats");
};
