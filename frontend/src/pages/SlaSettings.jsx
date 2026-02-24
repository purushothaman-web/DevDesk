import { useEffect, useState } from "react";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { getOrganizationSla, updateOrganizationSla } from "../api/organizations";
import toast from "react-hot-toast";

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
            toast.success("SLA settings updated.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update SLA settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageShell title="SLA Settings" subtitle="Configure ticket SLA by priority for your organization.">
            {error ? <Alert tone="danger">{error}</Alert> : null}
            {loading ? (
                <LoadingRows rows={3} />
            ) : (
                <Card className="max-w-2xl">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Input
                            label="High Priority SLA (hours)"
                            name="slaHighHours"
                            type="number"
                            min={1}
                            max={720}
                            value={form.slaHighHours}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Medium Priority SLA (hours)"
                            name="slaMediumHours"
                            type="number"
                            min={1}
                            max={720}
                            value={form.slaMediumHours}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Low Priority SLA (hours)"
                            name="slaLowHours"
                            type="number"
                            min={1}
                            max={720}
                            value={form.slaLowHours}
                            onChange={handleChange}
                            required
                        />
                        <Button type="submit" loading={saving}>Save SLA</Button>
                    </form>
                </Card>
            )}
        </PageShell>
    );
};

export default SlaSettings;
