import { useEffect, useState } from "react";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { getOrganizationSla, updateOrganizationSla } from "../api/organizations";
import toast from "react-hot-toast";

const SlaField = ({ label, description, name, value, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 py-6 border-b border-[var(--color-border)] last:border-0">
        <div className="md:col-span-2">
            <p className="text-[14px] font-extrabold text-[var(--color-text)] tracking-wide">{label}</p>
            <p className="mt-0.5 text-[13px] font-medium text-[var(--color-text-soft)]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
            <Input
                name={name}
                type="number"
                min={1}
                max={720}
                value={value}
                onChange={onChange}
                required
                className="text-center font-bold text-lg w-28"
            />
            <span className="text-[13px] font-bold text-[var(--color-text-soft)] shrink-0">hours</span>
        </div>
    </div>
);

const SlaSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        slaLowHours: 72,
        slaMediumHours: 24,
        slaHighHours: 4,
    });

    useEffect(() => {
        const fetchSla = async () => {
            setLoading(true);
            try {
                const res = await getOrganizationSla();
                setForm({
                    slaLowHours: res.data.data.slaLowHours,
                    slaMediumHours: res.data.data.slaMediumHours,
                    slaHighHours: res.data.data.slaHighHours,
                });
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load SLA settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSla();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: Number.parseInt(value || "0", 10),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateOrganizationSla(form);
            toast.success("SLA settings updated successfully.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update SLA settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageShell
            title="SLA Settings"
            subtitle="Define resolution time targets by ticket priority for your organization."
        >
            {error && <Alert tone="danger">{error}</Alert>}

            {loading ? (
                <LoadingRows rows={3} />
            ) : (
                <div className="max-w-3xl space-y-6">
                    <div className="rounded-[var(--radius-xl)] bg-[var(--color-primary-50)] border border-dashed border-[var(--color-primary-200)] px-5 py-4 flex gap-3">
                        <svg className="h-5 w-5 shrink-0 text-[var(--color-primary-500)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-[13px] font-medium text-[var(--color-primary-700)]">
                            SLA timers start when a ticket is created. Agents will be notified when a ticket is at risk of breaching its target.
                        </p>
                    </div>

                    <Card className="px-6 py-2 divide-y divide-[var(--color-border)]">
                        <form onSubmit={handleSubmit}>
                            <SlaField
                                label="High Priority"
                                description="Urgent issues — critical bugs, system outages, security concerns."
                                name="slaHighHours"
                                value={form.slaHighHours}
                                onChange={handleChange}
                            />
                            <SlaField
                                label="Medium Priority"
                                description="Important issues that impact productivity but have a workaround."
                                name="slaMediumHours"
                                value={form.slaMediumHours}
                                onChange={handleChange}
                            />
                            <SlaField
                                label="Low Priority"
                                description="General inquiries, feature requests, and non-blocking issues."
                                name="slaLowHours"
                                value={form.slaLowHours}
                                onChange={handleChange}
                            />
                            <div className="flex justify-end py-6">
                                <Button type="submit" loading={saving} size="lg" className="px-8">
                                    Save Settings
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </PageShell>
    );
};

export default SlaSettings;
