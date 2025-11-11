// src/auth.js

// Get tokens from local storage
export function getIdToken() {
  return localStorage.getItem("id_token");
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

// Get user information (email, role) from the decoded id_token
export function getUserInfo() {
  const token = getIdToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = localStorage.getItem("user_role") || "student"; // Default to 'student' if no role is found
    return {
      name: payload.name || "Unknown User", // Fallback if no name is found
      email: payload.email,
      sub: payload.sub,
      role: role, // Ensure role is fetched from localStorage
    };
  } catch (e) {
    return null;
  }
}

// Save tokens and user info (email, role) to local storage
export function setTokensAndUser(accessToken, idToken) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("id_token", idToken);

  // Decode the id_token to extract user info
  const payload = JSON.parse(atob(idToken.split(".")[1]));
  const role = payload["cognito:groups"] ? payload["cognito:groups"][0] : "student";  // Default to "student" if no role is found

  localStorage.setItem("user_role", role);  // Store the role in localStorage
}

// Logout function that clears tokens and redirects
export function logout() {
  localStorage.removeItem("id_token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");  // Remove the user role from localStorage
  window.location.href = "/";  // Redirect to homepage after logout
}

// Build Cognito hosted UI URLs for login
export function buildSignInUrl() {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirect = encodeURIComponent(import.meta.env.VITE_COGNITO_REDIRECT_URI);
  const scope = encodeURIComponent("openid email profile");
  return `https://${domain}/login?client_id=${clientId}&response_type=token&scope=${scope}&redirect_uri=${redirect}`;
}

// Build Cognito hosted UI URLs for logout (if using Cognito logout UI)
export function buildSignOutUrl() {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const signoutRedirect = encodeURIComponent(import.meta.env.VITE_COGNITO_REDIRECT_URI);
  return `https://${domain}/logout?client_id=${clientId}&logout_uri=${signoutRedirect}`;
}
