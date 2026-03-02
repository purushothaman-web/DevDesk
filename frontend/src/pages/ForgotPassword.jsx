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
            subtitle="Enter your email and we'll send a secure recovery link."
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
            footer={<Link to="/login" className="focus-ring rounded font-bold text-[var(--color-primary-700)] hover:underline underline-offset-4">← Back to Login</Link>}
        >
            {submitted ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-success-border,#86efac)] bg-[var(--color-success-bg,#f0fdf4)] p-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-[15px] font-bold text-[var(--color-text)]">Check your inbox</p>
                    <p className="mt-1 text-[13px] font-medium text-[var(--color-text-soft)]">
                        If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                    />
                    <div className="pt-2">
                        <Button type="submit" className="w-full" size="lg" loading={loading}>
                            Send Reset Link
                        </Button>
                    </div>
                </form>
            )}
        </AuthShell>
    );
};

export default ForgotPassword;
