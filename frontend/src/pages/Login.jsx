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
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="focus-ring rounded text-[var(--color-primary-700)] font-bold hover:underline underline-offset-4">Create one</Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error ? <Alert tone="danger">{error}</Alert> : null}
                <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="********" required />
                <div className="flex justify-start">
                    <Link className="focus-ring rounded text-[12px] font-bold uppercase tracking-wide text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)]" to="/forgot-password">Forgot password?</Link>
                </div>
                <div className="pt-2">
                    <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
                </div>
            </form>
        </AuthShell>
    );
};

export default Login;
