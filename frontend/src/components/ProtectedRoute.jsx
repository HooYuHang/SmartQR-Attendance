import { Navigate } from "react-router-dom";
import { getUserInfo } from "../auth"; // Make sure to import your auth logic

const ProtectedRoute = ({ children, role }) => {
  const userInfo = getUserInfo();
  if (!userInfo || userInfo.role !== role) {
    return <Navigate to="/" />; // Redirect to home if not authorized
  }

  return children; // Allow access if the role matches
};

export default ProtectedRoute;
