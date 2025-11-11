import axios from "axios";
import qs from "qs";
import User from "../models/User.js";

// Function to exchange code for tokens
export const exchangeCodeForTokens = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    const tokenUrl = `https://${process.env.COGNITO_DOMAIN}/oauth2/token`;

    const data = {
      grant_type: "authorization_code",
      client_id: process.env.COGNITO_CLIENT_ID,
      code: code,
      redirect_uri: process.env.COGNITO_REDIRECT_URI,
    };

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // Step 1: Exchange authorization code for access token and id token
    const response = await axios.post(tokenUrl, qs.stringify(data), { headers });

    if (response.data.access_token) {
      const idToken = response.data.id_token;
      const decodedToken = JSON.parse(atob(idToken.split(".")[1])); // Decode the id_token

      console.log(decodedToken); // Log the decoded token to inspect the attributes

      const { sub: cognito_id, email, name, role = "student" } = decodedToken;
      const displayName = decodedToken["custom:displayName"] || name; // Custom fallback logic

      console.log(displayName); // Log to see if displayName is properly extracted

      // Ensure that role is extracted correctly (from cognito groups or default to "student")
      const userRole = decodedToken["cognito:groups"] ? decodedToken["cognito:groups"][0] : "student";

      // Step 2: Save or update user information in MongoDB (upsert)
      await User.updateOne(
        { cognito_id },
        { $set: { cognito_id, email, name, displayName, role: userRole } },
        { upsert: true }
      );

      return res.json({
        access_token: response.data.access_token,
        id_token: response.data.id_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
      });
    }

    return res.status(400).json({ message: "Token exchange failed" });
  } catch (err) {
    console.error("Token exchange failed:", err.message);
    return res.status(400).json({ message: "Token exchange failed", error: err.message });
  }
};
