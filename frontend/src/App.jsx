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
import OrganizationsPage from "./pages/OrganizationsPage";
import SlaSettings from "./pages/SlaSettings";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (user && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "USER" ? "/tickets" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }
  return children;
};

const CatchAll = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "USER" ? "/tickets" : "/dashboard"} replace />;
};

const Home = () => {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  if (user) {
    return <Navigate to={user.role === "USER" ? "/tickets" : "/dashboard"} replace />;
  }
  return <Landing />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN", "AGENT", "SUPER_ADMIN"]}>
              <Dashboard />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/tickets/all" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN", "AGENT", "SUPER_ADMIN"]}>
              <AllTickets />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/users" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <UsersPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/organizations" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
              <OrganizationsPage />
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/settings/sla" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <SlaSettings />
            </RoleRoute>
          </ProtectedRoute>
        } />

        <Route path="*" element={<CatchAll />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
