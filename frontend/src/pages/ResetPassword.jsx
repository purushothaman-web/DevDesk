import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import toast from "react-hot-toast";
import AuthShell from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Alert } from "../components/ui/Feedback";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Invalid or missing token.");
        if (password !== confirmPassword) return toast.error("Passwords do not match.");
        if (password.length < 6) return toast.error("Password must be at least 6 characters.");
        setLoading(true);
        try {
            await resetPassword(token, password);
            toast.success("Password reset successfully.");
            navigate("/login");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthShell
                title="Invalid Link"
                subtitle="This reset link is invalid or missing a token."
                icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14L12 5 5 19z" /></svg>}
                footer={<Link to="/login" className="focus-ring rounded text-[var(--color-primary-700)]">Return to Login</Link>}
            >
                <Alert tone="warning">Request a new password reset link and try again.</Alert>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Create New Password"
            subtitle="Set a strong password for your account."
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m6-6V9a6 6 0 10-12 0v2M5 11h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg>}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
                <Button type="submit" fullWidth loading={loading}>Set New Password</Button>
            </form>
        </AuthShell>
    );
};

export default ResetPassword;
