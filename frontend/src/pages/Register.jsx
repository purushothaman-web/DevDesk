import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthShell from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Alert } from "../components/ui/Feedback";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", organizationName: "" });
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
            await register(form.name, form.email, form.password, form.organizationName);
            navigate("/dashboard");
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Create Account"
            subtitle="Join your team's support workspace."
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
            footer={
                <>
                    Already have an account?{" "}
                    <Link to="/login" className="focus-ring rounded font-bold text-[var(--color-primary-700)] hover:underline underline-offset-4">Sign in</Link>
                </>
            }
        >
            <div className="mb-6 flex gap-3 text-left text-[13px] font-medium text-[var(--color-text-soft)] bg-[var(--color-surface-muted)] p-4 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)]">
                <svg className="h-5 w-5 shrink-0 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Creating an account will automatically establish a new workspace for your organization. You will become the Admin.
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error ? <Alert tone="danger">{error}</Alert> : null}
                <Input label="Workspace / Organization Name" name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="e.g. Acme Corp" required />
                <Input label="Your Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} placeholder="At least 6 characters" required />
                <div className="pt-2">
                    <Button type="submit" className="w-full" size="lg" loading={loading}>Create Workspace</Button>
                </div>
            </form>
        </AuthShell>
    );
};

export default Register;
