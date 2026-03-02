import { useState } from "react";
import { createTicket } from "../api/tickets";
import toast from "react-hot-toast";
import Button from "./ui/Button";
import { Alert } from "./ui/Feedback";
import { Input, Select, Textarea } from "./ui/Field";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const CATEGORIES = ["Bug", "Feature Request", "Support", "Billing", "Account", "Other"];

const TagChip = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-700)]">
        #{label}
        <button onClick={onRemove} className="ml-0.5 text-[var(--color-primary-400)] hover:text-[var(--color-danger-text)] leading-none">×</button>
    </span>
);

const CreateTicketModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", category: "" });
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleFiles = (e) => setFiles(Array.from(e.target.files || []).slice(0, 5));

    const handleTagKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
            if (!tags.includes(newTag) && tags.length < 5) {
                setTags((prev) => [...prev, newTag]);
            }
            setTagInput("");
        }
    };

    const handleTagRemove = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("priority", form.priority);
            if (form.category) formData.append("category", form.category);
            tags.forEach((tag) => formData.append("tags", tag));
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2746]/40 px-4 backdrop-blur-md transition-all">
            <div className="w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[#fcfdfef0] px-8 py-6 shrink-0">
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-[var(--color-text)]">Create New Ticket</h2>
                        <p className="mt-1 text-[13px] font-medium text-[var(--color-text-soft)]">Please provide the details of your request.</p>
                    </div>
                    <button onClick={onClose} className="focus-ring rounded-[var(--radius-sm)] p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)] transition-colors" aria-label="Close modal">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 overflow-y-auto">
                    {error && <Alert tone="danger">{error}</Alert>}

                    <Input label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Brief issue summary" required />

                    <Textarea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the issue in detail..." required />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Select label="Priority" name="priority" value={form.priority} onChange={handleChange}>
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </Select>
                        <Select label="Category" name="category" value={form.category} onChange={handleChange}>
                            <option value="">No Category</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="mb-1.5 block text-[13px] font-bold text-[var(--color-text)]">
                            Tags <span className="font-normal text-soft text-[12px]">(press Enter or comma, max 5)</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {tags.map((tag) => <TagChip key={tag} label={tag} onRemove={() => handleTagRemove(tag)} />)}
                        </div>
                        {tags.length < 5 && (
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="e.g. api, billing, urgent"
                            />
                        )}
                    </div>

                    <Input
                        label="Attachments"
                        hint={`${files.length} file(s) selected (Max 5, 5MB each).`}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFiles}
                        className="text-[13px] file:mr-4 file:rounded-[var(--radius-sm)] file:border-0 file:bg-[var(--color-primary-50)] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[var(--color-primary-700)] hover:file:bg-[var(--color-primary-100)] file:transition-colors file:cursor-pointer p-1.5"
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={loading} className="px-8">Create Ticket</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
