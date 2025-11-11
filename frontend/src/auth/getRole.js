export function getUserRole() {
  const idToken = localStorage.getItem("id_token");
  if (!idToken) return null;

  try {
    const payload = JSON.parse(atob(idToken.split(".")[1]));

    // If user belongs to Cognito group "teachers"
    if (
      payload["cognito:groups"] &&
      payload["cognito:groups"].length > 0
    ) {
      return payload["cognito:groups"][0]; // "teachers"
    }

    return "student"; // default role
  } catch (err) {
    console.error("Failed to decode role:", err);
    return null;
  }
}
