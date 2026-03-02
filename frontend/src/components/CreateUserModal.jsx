import { useState } from "react";
import Button from "./ui/Button";
import { Input } from "./ui/Field";
import { Alert } from "./ui/Feedback";
import { createUser } from "../api/auth";
import toast from "react-hot-toast";

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createUser(form);
            toast.success("User created successfully");
            onUserCreated(res.data.data);
            setForm({ name: "", email: "", password: "", role: "USER" }); // Reset
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to create user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in transition-opacity">
            <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-8 shadow-2xl border border-[var(--color-border)] animate-in zoom-in-95 duration-200">
                <div className="mb-6 border-b border-[var(--color-border)] pb-4">
                    <h2 className="text-xl font-extrabold text-[var(--color-text)] tracking-tight">Create New User</h2>
                    <p className="text-[13px] text-[var(--color-text-soft)] font-medium mt-1">Add a new member to the workspace.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error ? <Alert tone="danger">{error}</Alert> : null}
                    
                    <Input label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
                    <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required />
                    <Input label="Temporary Password" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} placeholder="Min. 6 characters" required />
                    
                    <div className="flex flex-col gap-1.5 focus-within:z-10">
                        <label className="text-[13px] font-bold tracking-wide text-[var(--color-text)]">Role Level</label>
                        <select 
                            name="role" 
                            value={form.role} 
                            onChange={handleChange}
                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-[14px] text-[var(--color-text)] shadow-sm outline-none transition-colors hover:border-[var(--color-primary-300)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]"
                        >
                            <option value="USER">User (Customer)</option>
                            <option value="AGENT">Agent (Support Staff)</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} className="px-6">
                            Create User
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
