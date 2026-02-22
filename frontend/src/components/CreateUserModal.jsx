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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-bg)] p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">Create New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error ? <Alert tone="danger">{error}</Alert> : null}
                    
                    <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
                    <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
                    <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
                    
                    <div className="flex flex-col gap-1.5 focus-within:z-10">
                        <label className="text-sm font-medium text-[var(--color-gray-700)]">Role</label>
                        <select 
                            name="role" 
                            value={form.role} 
                            onChange={handleChange}
                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text)] shadow-sm outline-none transition-colors hover:border-[var(--color-gray-400)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]"
                        >
                            <option value="USER">User (Customer)</option>
                            <option value="AGENT">Agent (Support Staff)</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Create User
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;
