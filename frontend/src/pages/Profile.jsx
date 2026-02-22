import { useState } from "react";
import PageShell from "../components/layout/PageShell";
import { updateProfile } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match.");
        }
        setLoading(true);
        try {
            const updateData = { name: formData.name };
            if (formData.password) updateData.password = formData.password;
            await updateProfile(updateData);
            toast.success("Profile updated successfully.");
            setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell title="My Profile" subtitle="Manage your account details." className="max-w-3xl">
            <Card className="mx-auto max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Email" type="email" value={user?.email || ""} disabled />
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                    <div className="pt-2">
                        <p className="mb-3 text-sm font-semibold text-[var(--color-text-soft)]">Change Password (Optional)</p>
                        <div className="space-y-3">
                            <Input label="New Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
                            <Input label="Confirm New Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter new password" />
                        </div>
                    </div>
                    <Button type="submit" loading={loading}>Save Changes</Button>
                </form>
            </Card>
        </PageShell>
    );
};

export default Profile;
