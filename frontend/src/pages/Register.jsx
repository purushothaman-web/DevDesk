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
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            footer={
                <>
                    Already have an account?{" "}
                    <Link to="/login" className="focus-ring rounded text-[var(--color-primary-700)]">Sign in</Link>
                </>
            }
        >
            <div className="mb-4 text-sm text-[var(--color-gray-500)] bg-[var(--color-gray-50)] p-3 rounded-md border border-[var(--color-gray-200)]">
                Creating an account will automatically create a new workspace for your organization. You will become the Admin.
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error ? <Alert tone="danger">{error}</Alert> : null}
                <Input label="Workspace / Organization Name" name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="e.g. Acme Corp" required />
                <Input label="Your Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} placeholder="At least 6 characters" required />
                <Button type="submit" fullWidth loading={loading}>Create Account</Button>
            </form>
        </AuthShell>
    );
};

export default Register;
