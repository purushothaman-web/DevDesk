import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MyTickets from "./pages/MyTickets";
import AllTickets from "./pages/AllTickets";
import TicketDetail from "./pages/TicketDetail";
import Profile from "./pages/Profile";
import UsersPage from "./pages/UsersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Redirects to /dashboard if the user's role is not in allowedRoles
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/tickets/all" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN", "AGENT"]}>
              <AllTickets />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/users" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <UsersPage />
            </RoleRoute>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
