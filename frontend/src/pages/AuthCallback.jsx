import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setTokensAndUser } from "../auth";  // Import the function to store user info
import api from "../api";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finishAuth() {
      const params = new URLSearchParams(window.location.hash.substring(1));  // URL hash contains tokens
      const token = params.get("access_token");
      const idToken = params.get("id_token");

      if (token && idToken) {
        // Store tokens and user information in localStorage
        setTokensAndUser(token, idToken);

        // Decode the ID token to get user info
        const decodedToken = JSON.parse(atob(idToken.split(".")[1]));
        const { sub: cognito_id, email, name } = decodedToken;

        // Ensure role is set from Cognito groups (this should be an array like ["teacher"])
        const userRole = decodedToken["cognito:groups"] ? decodedToken["cognito:groups"][0] : "student";

        // Send user info to the backend to store in MongoDB
        await api.post("/auth/save-user", {
          cognito_id,
          email,
          name,
          role: userRole,  // Ensure correct role is sent
        });

        // Fetch the user's role from the backend (MongoDB)
        const roleResponse = await api.get("/auth/user-role", {
          params: { cognito_id }, // Pass cognito_id to fetch the role
        });

        const userRoleFromDB = roleResponse.data.role;

        // Save the fetched role into localStorage to be used in other components
        localStorage.setItem("user_role", userRoleFromDB);

        // Redirect user based on role fetched from MongoDB
        if (userRoleFromDB === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else if (userRoleFromDB === "student") {
          navigate("/student/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });  // In case of an undefined role, redirect to home
        }
      } else {
        navigate("/", { replace: true });  // Redirect to home if tokens are missing
      }
    }

    finishAuth();
  }, [navigate]);

  return <h1>Loading...</h1>;
}
