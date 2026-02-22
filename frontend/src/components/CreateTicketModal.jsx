import { useState } from "react";
import { createTicket } from "../api/tickets";
import toast from "react-hot-toast";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Alert } from "./ui/Feedback";
import { Input, Select, Textarea } from "./ui/Field";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const CreateTicketModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleFiles = (e) => setFiles(Array.from(e.target.files || []).slice(0, 5));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("priority", form.priority);
            files.forEach((f) => formData.append("attachments", f));

            const res = await createTicket(formData);
            onCreated(res.data.data);
            toast.success("Ticket created successfully.");
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to create ticket.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl p-0">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">Create New Ticket</h2>
                    <button onClick={onClose} className="focus-ring rounded p-1 text-[var(--color-text-soft)]" aria-label="Close modal">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    {error ? <Alert tone="danger">{error}</Alert> : null}

                    <Input label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Brief issue summary" required />
                    <Textarea label="Description" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the issue..." required />
                    <Select label="Priority" name="priority" value={form.priority} onChange={handleChange}>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </Select>

                    <Input
                        label="Attachments"
                        hint={`${files.length} file(s) selected. Max 5.`}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFiles}
                    />

                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={loading}>Create Ticket</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateTicketModal;
