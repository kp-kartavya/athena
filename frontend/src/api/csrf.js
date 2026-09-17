function getCsrfTokenFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));

  return cookie
    ? decodeURIComponent(cookie.substring("XSRF-TOKEN=".length))
    : null;
}

export async function initializeCsrf() {
  const response = await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to initialize CSRF protection.");
  }

  const data = await response.json();

  return data.token;
}

export function getCsrfHeaders() {
  const token = getCsrfTokenFromCookie();

  return token
    ? {
        "X-XSRF-TOKEN": token,
      }
    : {};
}
