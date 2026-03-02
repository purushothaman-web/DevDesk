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
        <PageShell title="My Profile" subtitle="Manage your account details and security settings." className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[var(--color-border)]">
                        <div className="md:col-span-1">
                            <h3 className="text-[14px] font-extrabold text-[var(--color-text)] tracking-wider uppercase mb-1">Personal Info</h3>
                            <p className="text-[13px] text-[var(--color-text-soft)] font-medium">Update your account identity.</p>
                        </div>
                        <div className="md:col-span-2 space-y-5">
                            <Input label="Email Address" type="email" value={user?.email || ""} disabled className="bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border-dashed" />
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="text-[14px] font-extrabold text-[var(--color-text)] tracking-wider uppercase mb-1">Security</h3>
                            <p className="text-[13px] text-[var(--color-text-soft)] font-medium">Change your password (Optional).</p>
                        </div>
                        <div className="md:col-span-2 space-y-5">
                            <Input label="New Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
                            <Input label="Confirm New Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter new password" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-[var(--color-border)]">
                        <Button type="submit" loading={loading} className="px-8" size="lg">Save Changes</Button>
                    </div>
                </form>
            </Card>
        </PageShell>
    );
};

export default Profile;
