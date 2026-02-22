import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import toast from "react-hot-toast";
import AuthShell from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Alert } from "../components/ui/Feedback";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            setSubmitted(true);
            toast.success("Reset link sent.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Reset Password"
            subtitle="We will email a secure reset link."
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.553 0 1 .448 1 1v3a1 1 0 11-2 0v-3c0-.552.447-1 1-1zm0-8a9 9 0 100 18 9 9 0 000-18z" /></svg>}
            footer={<Link to="/login" className="focus-ring rounded text-[var(--color-primary-700)]">Back to login</Link>}
        >
            {submitted ? (
                <Alert tone="success">
                    If an account exists for <strong>{email}</strong>, you will receive a reset email.
                </Alert>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
                    <Button type="submit" fullWidth loading={loading}>Send Reset Link</Button>
                </form>
            )}
        </AuthShell>
    );
};

export default ForgotPassword;
