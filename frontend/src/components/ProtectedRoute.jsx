import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { token, authReady } = useAuth();

    // Show a minimal spinner while the one-time /auth/me check is in progress
    if (!authReady) {
        return (
            <div className="surface-page flex min-h-screen items-center justify-center">
                <div className="surface-card rounded-[var(--radius-md)] px-5 py-4 text-sm text-soft">
                    <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary-500)] border-t-transparent" />
                    Preparing your workspace...
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
