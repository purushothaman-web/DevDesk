import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthShell from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Alert } from "../components/ui/Feedback";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate("/dashboard");
        } catch (err) {
            setError(err?.response?.data?.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Welcome Back"
            subtitle="Sign in to continue to DevDesk."
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="focus-ring rounded text-[var(--color-primary-700)]">Create one</Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error ? <Alert tone="danger">{error}</Alert> : null}
                <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="********" required />
                <div className="flex justify-end">
                    <Link className="focus-ring rounded text-sm text-[var(--color-primary-700)]" to="/forgot-password">Forgot password?</Link>
                </div>
                <Button type="submit" fullWidth loading={loading}>Sign In</Button>
            </form>
        </AuthShell>
    );
};

export default Login;
