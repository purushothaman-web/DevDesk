import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Field";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import SlaCountdown from "../components/ui/SlaCountdown";
import {
    getTicketById,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    updateDueDate,
    addComment,
    deleteTicket,
    getActivityLog,
    updateTicket,
    deleteAttachment,
} from "../api/tickets";
import { getAgents } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const CATEGORIES = ["Bug", "Feature Request", "Support", "Billing", "Account", "Other"];
const toneForPriority = (priority) => (priority === "HIGH" ? "danger" : priority === "MEDIUM" ? "warning" : "info");
const toneForStatus = (status) => (status === "OPEN" ? "info" : status === "IN_PROGRESS" ? "warning" : status === "RESOLVED" ? "success" : "neutral");

/* ── Tag chip component ─────────────────────────────────────────────────── */
const TagChip = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary-700)]">
        #{label}
        {onRemove && (
            <button onClick={onRemove} className="ml-0.5 text-[var(--color-primary-400)] hover:text-[var(--color-danger-text)] leading-none">×</button>
        )}
    </span>
);

const TicketDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [comment, setComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [assignId, setAssignId] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [dueDateEdit, setDueDateEdit] = useState(false);
    const [dueDateVal, setDueDateVal] = useState("");
    const [dueDateLoading, setDueDateLoading] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);
    const [activityOpen, setActivityOpen] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState(null);

    // Edit mode state
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: "", description: "", tags: [], category: "" });
    const [tagInput, setTagInput] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    const isAdminOrAgent = isAdmin || user?.role === "AGENT";
    const isOwner = user?.id === ticket?.userId;
    const canEdit = isOwner || isAdmin;

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await getTicketById(id);
                const t = res.data.data;
                setTicket(t);
                if (t.dueDate) setDueDateVal(t.dueDate.split("T")[0]);
                setEditForm({ title: t.title, description: t.description, tags: t.tags || [], category: t.category || "" });
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load ticket.");
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
        if (isAdminOrAgent) getAgents().then((res) => setAgents(res.data.data)).catch(() => {});
    }, [id, isAdminOrAgent]);

    const isOverdue = ticket?.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== "CLOSED" && ticket.status !== "RESOLVED";

    /* ── Handlers ─────────────────────────────────────────────────────────── */
    const handleStatusChange = async (status) => {
        try {
            await updateTicketStatus(id, status);
            setTicket((prev) => ({ ...prev, status }));
            toast.success(`Status updated to ${status.replace("_", " ")}.`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Status update failed.");
        }
    };

    const handlePriorityChange = async (priority) => {
        try {
            await updateTicketPriority(id, priority);
            setTicket((prev) => ({ ...prev, priority }));
            toast.success(`Priority set to ${priority}.`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Priority update failed.");
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignId) return;
        setAssignLoading(true);
        try {
            const res = await assignTicket(id, assignId);
            setTicket((prev) => ({ ...prev, assignedTo: res.data.data.assignedTo }));
            setAssignId("");
            toast.success("Ticket assigned successfully.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Assignment failed.");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleUnassign = async () => {
        setAssignLoading(true);
        try {
            await assignTicket(id, null);
            setTicket((prev) => ({ ...prev, assignedTo: null }));
            toast.success("Assignment cleared.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Unassign failed.");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleDueDateSave = async () => {
        setDueDateLoading(true);
        try {
            await updateDueDate(id, dueDateVal || null);
            setTicket((prev) => ({ ...prev, dueDate: dueDateVal ? new Date(dueDateVal).toISOString() : null }));
            setDueDateEdit(false);
            toast.success(dueDateVal ? "Due date updated." : "Due date cleared.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update due date.");
        } finally {
            setDueDateLoading(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setCommentLoading(true);
        try {
            const res = await addComment(id, comment.trim());
            setTicket((prev) => ({ ...prev, comments: [...(prev.comments || []), res.data.data] }));
            setComment("");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Comment failed.");
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDelete = async () => {
        toast(
            (t) => (
                <div className="flex items-center gap-3 p-1">
                    <span className="text-[13px] font-bold uppercase tracking-wide">Delete Ticket?</span>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteTicket(id);
                                toast.success("Ticket deleted.");
                                navigate("/tickets");
                            } catch (err) {
                                toast.error(err?.response?.data?.message || "Delete failed.");
                            }
                        }}
                        className="rounded bg-[var(--color-danger-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-danger-text)] hover:opacity-80 transition-opacity"
                    >
                        Confirm
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-soft)] hover:text-[var(--color-text)]">Cancel</button>
                </div>
            ),
            { duration: 5000 }
        );
    };

    const handleActivityToggle = async () => {
        if (!activityOpen && activityLogs.length === 0) {
            setActivityLoading(true);
            try {
                const res = await getActivityLog(id);
                setActivityLogs(res.data.data);
            } catch {
                toast.error("Failed to load activity log.");
            } finally {
                setActivityLoading(false);
            }
        }
        setActivityOpen((prev) => !prev);
    };

    /* ── Edit Handlers ────────────────────────────────────────────────────── */
    const handleEditSave = async () => {
        setEditLoading(true);
        try {
            const res = await updateTicket(id, editForm);
            const updated = res.data.data;
            setTicket((prev) => ({ ...prev, ...updated }));
            setEditMode(false);
            toast.success("Ticket updated.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Update failed.");
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditCancel = () => {
        setEditForm({ title: ticket.title, description: ticket.description, tags: ticket.tags || [], category: ticket.category || "" });
        setTagInput("");
        setEditMode(false);
    };

    const handleTagAdd = (e) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
            if (!editForm.tags.includes(newTag) && editForm.tags.length < 5) {
                setEditForm((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
            }
            setTagInput("");
        }
    };

    const handleTagRemove = (tag) => {
        setEditForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    /* ── Attachment Delete ────────────────────────────────────────────────── */
    const handleAttachmentDelete = (attachment) => {
        toast(
            (t) => (
                <div className="flex items-center gap-3 p-1">
                    <span className="flex-1 text-[13px] font-bold">Delete "{attachment.fileName}"?</span>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteAttachment(id, attachment.id);
                                setTicket((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== attachment.id) }));
                                toast.success("Attachment deleted.");
                            } catch (err) {
                                toast.error(err?.response?.data?.message || "Delete failed.");
                            }
                        }}
                        className="rounded bg-[var(--color-danger-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-danger-text)] hover:opacity-80 shrink-0"
                    >
                        Delete
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="text-[11px] font-bold uppercase text-soft shrink-0">Cancel</button>
                </div>
            ),
            { duration: 5000 }
        );
    };

    /* ── Share Link ───────────────────────────────────────────────────────── */
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy link.");
        });
    };

    if (loading) return <PageShell><LoadingRows rows={3} /></PageShell>;
    if (error || !ticket) return <PageShell><Alert tone="danger">{error || "Ticket not found."}</Alert></PageShell>;

    return (
        <PageShell className="max-w-6xl mx-auto">
            {/* Breadcrumb bar */}
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-[var(--color-text-soft)] hover:text-[var(--color-text)]">
                    ← Back to Tickets
                </Button>
                <div className="flex items-center gap-3">
                    {/* Share Link */}
                    <button
                        onClick={handleCopyLink}
                        title="Copy link to ticket"
                        className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-soft hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy Link
                    </button>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-primary-600)]">TKT-{ticket.id.slice(0, 8).toUpperCase()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Main Content ─────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8">
                        {editMode ? (
                            /* ── Edit Form ── */
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Title</label>
                                    <Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ticket title" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                                        rows={6}
                                        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-400)] transition-colors resize-none"
                                        placeholder="Describe the issue..."
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Category</label>
                                    <Select value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>
                                        <option value="">No Category</option>
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Tags <span className="normal-case font-normal tracking-normal text-soft">(press Enter or comma to add, max 5)</span></label>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {editForm.tags.map((tag) => <TagChip key={tag} label={tag} onRemove={() => handleTagRemove(tag)} />)}
                                    </div>
                                    {editForm.tags.length < 5 && (
                                        <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagAdd} placeholder="e.g. api, billing, urgent" />
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
                                    <Button variant="ghost" onClick={handleEditCancel} disabled={editLoading}>Cancel</Button>
                                    <Button onClick={handleEditSave} loading={editLoading} className="px-6">Save Changes</Button>
                                </div>
                            </div>
                        ) : (
                            /* ── View Mode ── */
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <h1 className="text-2xl font-extrabold text-[var(--color-text)] leading-tight">{ticket.title}</h1>
                                    {canEdit && (
                                        <button onClick={() => setEditMode(true)} className="shrink-0 focus-ring inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-soft hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] transition-colors mt-1">
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge label={ticket.priority} tone={toneForPriority(ticket.priority)} />
                                    <Badge label={ticket.status.replace("_", " ")} tone={toneForStatus(ticket.status)} />
                                    {ticket.category && <Badge label={ticket.category} tone="neutral" />}
                                    {ticket.dueDate && <Badge label={`${isOverdue ? "Overdue" : "Due"} ${new Date(ticket.dueDate).toLocaleDateString()}`} tone={isOverdue ? "danger" : "neutral"} />}
                                </div>

                                {/* Tag chips */}
                                {ticket.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {ticket.tags.map((tag) => <TagChip key={tag} label={tag} />)}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[10px] font-bold text-[var(--color-primary-700)]">
                                        {ticket.user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="text-[13px] font-medium text-[var(--color-text-soft)]">
                                        Submitted by <strong className="text-[var(--color-text)]">{ticket.user?.name}</strong> on {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                                    <h3 className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-3">Description</h3>
                                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-soft)]">{ticket.description}</p>
                                </div>

                                {/* SLA Countdown */}
                                {ticket.slaDueAt && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <SlaCountdown slaDueAt={ticket.slaDueAt} />
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Discussion */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-[var(--color-text)] px-1">Discussion ({ticket.comments?.length || 0})</h2>

                        <div className="space-y-4">
                            {ticket.comments?.length ? ticket.comments.map((commentItem) => (
                                <div key={commentItem.id} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-sm font-bold text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                            {commentItem.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex-1 rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[14px] font-bold text-[var(--color-text)]">
                                                {commentItem.user.name}
                                                <span className="ml-2 inline-block rounded bg-[var(--color-bg-soft)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-soft">{commentItem.user.role}</span>
                                            </p>
                                            <p className="text-[12px] font-medium text-soft">{new Date(commentItem.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                                        </div>
                                        <p className="text-[14px] text-[var(--color-text-soft)] leading-relaxed">{commentItem.message}</p>
                                    </div>
                                </div>
                            )) : <p className="text-sm font-medium text-soft bg-[var(--color-surface-muted)] p-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] text-center">No comments have been made yet.</p>}
                        </div>

                        <form onSubmit={handleComment} className="mt-6 flex flex-col gap-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-muted)] p-4 border border-[var(--color-border)]">
                            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a reply..." className="bg-white" />
                            <div className="flex justify-end">
                                <Button type="submit" loading={commentLoading} disabled={!comment.trim()} className="px-6">Post Reply</Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── Sidebar ──────────────────────────────────────────────── */}
                <div className="space-y-6">
                    {isAdminOrAgent && (
                        <Card className="p-6">
                            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-4">Ticket Controls</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-bold text-[var(--color-text-soft)]">Status</label>
                                    <Select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)}>
                                        {STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[13px] font-bold text-[var(--color-text-soft)]">Priority</label>
                                    <Select value={ticket.priority} onChange={(e) => handlePriorityChange(e.target.value)}>
                                        {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Assignment */}
                    <Card className="p-6">
                        <h2 className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-4">Assignment</h2>
                        {ticket.assignedTo ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3 border border-[var(--color-border)]">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-sm font-bold text-[var(--color-primary-700)]">
                                        {ticket.assignedTo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-bold text-[var(--color-text)]">{ticket.assignedTo.name}</p>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-soft">{ticket.assignedTo.role}</p>
                                    </div>
                                </div>
                                {isAdmin && <Button size="sm" variant="secondary" onClick={handleUnassign} disabled={assignLoading} className="w-full">Unassign Agent</Button>}
                            </div>
                        ) : (
                            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-4 text-center bg-[var(--color-surface-muted)]">
                                <p className="text-[13px] font-medium text-soft">Currently unassigned.</p>
                            </div>
                        )}
                        {isAdmin && (
                            <form onSubmit={handleAssign} className="mt-4 flex flex-col gap-2 pt-4 border-t border-[var(--color-border)]">
                                <label className="text-[12px] font-bold text-[var(--color-text-soft)]">Reassign Ticket</label>
                                <Select value={assignId} onChange={(e) => setAssignId(e.target.value)}>
                                    <option value="">Select an agent...</option>
                                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                                </Select>
                                <Button type="submit" size="sm" loading={assignLoading} disabled={!assignId} className="w-full mt-1">Assign</Button>
                            </form>
                        )}
                    </Card>

                    {/* Target Resolution */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)]">Target Resolution</h2>
                            {isAdmin && !dueDateEdit && <Button size="sm" variant="ghost" onClick={() => setDueDateEdit(true)} className="h-6 px-2 text-[11px]">{ticket.dueDate ? "Edit" : "Set Date"}</Button>}
                        </div>

                        {dueDateEdit ? (
                            <div className="space-y-3">
                                <Input type="date" value={dueDateVal} onChange={(e) => setDueDateVal(e.target.value)} />
                                <div className="flex gap-2">
                                    <Button size="sm" loading={dueDateLoading} onClick={handleDueDateSave} className="flex-1">Save</Button>
                                    <Button size="sm" variant="secondary" onClick={() => { setDueDateEdit(false); setDueDateVal(ticket.dueDate ? ticket.dueDate.split("T")[0] : ""); }} className="flex-1">Cancel</Button>
                                </div>
                                {ticket.dueDate && <Button size="sm" variant="ghost" onClick={() => { setDueDateVal(""); handleDueDateSave(); }} className="w-full text-[var(--color-danger-text)]">Clear Date</Button>}
                            </div>
                        ) : (
                            <div className={`rounded-[var(--radius-md)] p-3 border ${ticket.dueDate ? (isOverdue ? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]" : "border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)]") : "border-dashed border-[var(--color-border)] bg-transparent text-soft text-center"}`}>
                                <p className="text-[13px] font-bold">
                                    {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" }) : "No deadline set."}
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Attachments */}
                    {ticket.attachments?.length > 0 && (
                        <Card className="p-6">
                            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-4">Attachments ({ticket.attachments.length})</h2>
                            <ul className="space-y-2">
                                {ticket.attachments.map((attachment) => (
                                    <li key={attachment.id} className="group flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2 hover:border-[var(--color-primary-300)] transition-colors">
                                        <button onClick={() => setSelectedAttachment(attachment)} className="flex-1 flex items-center gap-2 text-left min-w-0">
                                            <svg className="h-4 w-4 shrink-0 text-soft group-hover:text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                            <span className="truncate text-[13px] font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary-700)]">{attachment.fileName}</span>
                                        </button>
                                        {canEdit && (
                                            <button onClick={() => handleAttachmentDelete(attachment)} title="Delete attachment" className="shrink-0 rounded p-1 text-soft opacity-0 group-hover:opacity-100 hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] transition-all">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Activity Log */}
                    {isAdminOrAgent && (
                        <div className="pt-4">
                            <button onClick={handleActivityToggle} className="focus-ring flex w-full items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-4 border border-[var(--color-border)] hover:bg-[var(--color-bg-soft)] transition-colors text-left">
                                <span className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-text-soft)]">History &amp; Logs</span>
                                <svg className={`h-4 w-4 text-soft transition-transform ${activityOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            {activityOpen && (
                                <div className="mt-3 space-y-3 pl-4 border-l-2 border-[var(--color-border-strong)]">
                                    {activityLoading ? (
                                        <LoadingRows rows={2} />
                                    ) : activityLogs.length === 0 ? (
                                        <p className="text-[13px] font-medium text-soft py-2">No history recorded.</p>
                                    ) : (
                                        activityLogs.map((log) => (
                                            <div key={log.id} className="relative py-1">
                                                <div className="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-[var(--color-primary-300)]"></div>
                                                <p className="text-[13px] font-bold text-[var(--color-text)]">{log.detail}</p>
                                                <p className="text-[11px] font-medium text-soft mt-0.5">{log.user?.name} &bull; {new Date(log.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delete Ticket */}
                    {(isAdmin || isOwner) && (
                        <div className="pt-8 text-center border-t border-[var(--color-border)] border-dashed">
                            <Button variant="ghost" onClick={handleDelete} className="w-full text-xs text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)]">Delete Ticket</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Attachment Preview Modal */}
            {selectedAttachment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-opacity" onClick={() => setSelectedAttachment(null)}>
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                            <h3 className="text-sm font-bold text-[var(--color-text)]">{selectedAttachment.fileName}</h3>
                            <button onClick={() => setSelectedAttachment(null)} className="rounded p-1 text-soft hover:bg-[var(--color-border)] hover:text-[var(--color-text)]">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-4 bg-[var(--color-bg-soft)] flex justify-center items-center">
                            {selectedAttachment.mimeType?.startsWith("image/") ? (
                                <img src={`${import.meta.env.VITE_BASE_URL?.replace("/api", "")}/${selectedAttachment.filePath}`} alt={selectedAttachment.fileName} className="max-h-[75vh] w-auto max-w-full rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm object-contain bg-white" />
                            ) : selectedAttachment.mimeType === "application/pdf" ? (
                                <iframe src={`${import.meta.env.VITE_BASE_URL?.replace("/api", "")}/${selectedAttachment.filePath}`} className="h-[75vh] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm bg-white" title="PDF Preview" />
                            ) : (
                                <div className="py-16 text-center w-full bg-white rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-500)]">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <p className="text-[15px] font-bold text-[var(--color-text)]">Preview Unavailable</p>
                                    <p className="mt-1 text-[13px] text-soft">This file type cannot be previewed in the browser.</p>
                                    <a href={`${import.meta.env.VITE_BASE_URL?.replace("/api", "")}/${selectedAttachment.filePath}`} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded-[var(--radius-sm)] bg-[var(--color-primary-500)] px-6 py-2.5 text-[13px] font-bold tracking-wide uppercase text-white hover:bg-[var(--color-primary-600)] transition-colors shadow-sm">
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
};

export default TicketDetail;
