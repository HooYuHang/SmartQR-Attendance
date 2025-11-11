import dotenv from "dotenv";
dotenv.config();  // Make sure env variables are loaded

import jwt from "jsonwebtoken";
import axios from "axios";
import jwkToPem from "jwk-to-pem";

const REGION = process.env.COGNITO_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// JWKS cache (so we don't fetch every request)
let jwksCache = null;

// Fetch JWKS keys from AWS Cognito
async function getJwks() {
  if (jwksCache) return jwksCache;

  const url = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
  const response = await axios.get(url);

  jwksCache = response.data.keys;
  return jwksCache;
}

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    // Decode header to get "kid"
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const kid = decodedHeader.header.kid;

    // Load keys
    const jwks = await getJwks();
    const key = jwks.find(k => k.kid === kid);

    if (!key) {
      return res.status(401).json({ message: "JWK key not found" });
    }

    // Convert JWK to PEM
    const pem = jwkToPem(key);

    // Verify token signature
    jwt.verify(token, pem, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token verification failed" });
      }

      // Attach decoded Cognito identity
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded["custom:displayName"] || decoded.email,
        role: decoded["cognito:groups"]?.[0] || "student", // Assuming default is "student" if role is not defined
      };

      next();
    });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

