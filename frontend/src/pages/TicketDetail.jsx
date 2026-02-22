import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Field";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import {
    getTicketById,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    updateDueDate,
    addComment,
    deleteTicket,
    getActivityLog,
} from "../api/tickets";
import { getAgents } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const toneForPriority = (priority) => (priority === "HIGH" ? "danger" : priority === "MEDIUM" ? "warning" : "info");
const toneForStatus = (status) => (status === "OPEN" ? "info" : status === "IN_PROGRESS" ? "warning" : status === "RESOLVED" ? "success" : "neutral");

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

    const isAdmin = user?.role === "ADMIN";
    const isAdminOrAgent = isAdmin || user?.role === "AGENT";

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await getTicketById(id);
                setTicket(res.data.data);
                if (res.data.data.dueDate) setDueDateVal(res.data.data.dueDate.split("T")[0]);
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load ticket.");
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
        if (isAdmin) getAgents().then((res) => setAgents(res.data.data)).catch(() => {});
    }, [id, isAdmin]);

    const isOverdue = ticket?.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== "CLOSED" && ticket.status !== "RESOLVED";

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
                <div className="flex items-center gap-2">
                    <span className="text-sm">Delete this ticket?</span>
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
                        className="rounded border border-[var(--color-danger-border)] px-2 py-1 text-xs font-semibold text-[var(--color-danger-text)]"
                    >
                        Confirm
                    </button>
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

    if (loading) return <PageShell><LoadingRows rows={3} /></PageShell>;
    if (error || !ticket) return <PageShell><Alert tone="danger">{error || "Ticket not found."}</Alert></PageShell>;

    return (
        <PageShell className="max-w-5xl">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>Back</Button>

            <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-[var(--color-text)]">{ticket.title}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge label={ticket.priority} tone={toneForPriority(ticket.priority)} />
                            <Badge label={ticket.status.replace("_", " ")} tone={toneForStatus(ticket.status)} />
                            {ticket.dueDate ? <Badge label={`${isOverdue ? "Overdue" : "Due"} ${new Date(ticket.dueDate).toLocaleDateString()}`} tone={isOverdue ? "danger" : "neutral"} /> : null}
                            <span className="text-xs text-soft">by {ticket.user?.name} | {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {isAdminOrAgent ? (
                            <Select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)} className="min-w-36">
                                {STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                            </Select>
                        ) : null}
                        {(isAdmin || ticket.userId === user?.id) ? <Button variant="danger" onClick={handleDelete}>Delete</Button> : null}
                    </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--color-text-soft)]">{ticket.description}</p>
                {isAdminOrAgent ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Select value={ticket.priority} onChange={(e) => handlePriorityChange(e.target.value)} className="min-w-36">
                            {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                        </Select>
                    </div>
                ) : null}
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-soft">Assigned Agent</h2>
                    {ticket.assignedTo ? (
                        <div className="mt-3 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-[var(--color-text)]">{ticket.assignedTo.name}</p>
                                <p className="text-xs text-soft">{ticket.assignedTo.role}</p>
                            </div>
                            {isAdmin ? <Button size="sm" variant="ghost" onClick={handleUnassign} disabled={assignLoading}>Clear</Button> : null}
                        </div>
                    ) : <p className="mt-3 text-sm text-soft">Not assigned yet.</p>}

                    {isAdmin ? (
                        <form onSubmit={handleAssign} className="mt-3 flex gap-2">
                            <Select value={assignId} onChange={(e) => setAssignId(e.target.value)} className="flex-1">
                                <option value="">Select an agent...</option>
                                {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} - {agent.email}</option>)}
                            </Select>
                            <Button type="submit" loading={assignLoading} disabled={!assignId}>Assign</Button>
                        </form>
                    ) : null}
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-soft">Due Date</h2>
                        {isAdmin && !dueDateEdit ? <Button size="sm" variant="ghost" onClick={() => setDueDateEdit(true)}>{ticket.dueDate ? "Edit" : "Set"}</Button> : null}
                    </div>
                    {dueDateEdit ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Input type="date" value={dueDateVal} onChange={(e) => setDueDateVal(e.target.value)} />
                            <Button size="sm" loading={dueDateLoading} onClick={handleDueDateSave}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setDueDateEdit(false); setDueDateVal(ticket.dueDate ? ticket.dueDate.split("T")[0] : ""); }}>Cancel</Button>
                            {ticket.dueDate ? <Button size="sm" variant="ghost" onClick={() => { setDueDateVal(""); handleDueDateSave(); }}>Clear</Button> : null}
                        </div>
                    ) : (
                        <p className={`mt-3 text-sm ${isOverdue ? "text-[var(--color-danger-text)]" : "text-soft"}`}>
                            {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString(undefined, { dateStyle: "long" }) : "No due date set."}
                        </p>
                    )}
                </Card>
            </div>

            {ticket.attachments?.length > 0 ? (
                <Card>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-soft">Attachments</h2>
                    <ul className="mt-2 space-y-1.5">
                        {ticket.attachments.map((attachment) => (
                            <li key={attachment.id}>
                                <button
                                    onClick={() => setSelectedAttachment(attachment)}
                                    className="focus-ring text-sm font-medium text-[var(--color-primary-700)]"
                                >
                                    {attachment.fileName}
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            ) : null}

            <Card>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-soft">Comments ({ticket.comments?.length || 0})</h2>
                <div className="mt-4 space-y-4">
                    {ticket.comments?.length ? ticket.comments.map((commentItem) => (
                        <div key={commentItem.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                            <p className="text-sm font-semibold text-[var(--color-text)]">{commentItem.user.name} <span className="text-xs font-normal text-soft">({commentItem.user.role})</span></p>
                            <p className="mt-1 text-xs text-soft">{new Date(commentItem.createdAt).toLocaleString()}</p>
                            <p className="mt-2 text-sm text-[var(--color-text-soft)]">{commentItem.message}</p>
                        </div>
                    )) : <p className="text-sm text-soft">No comments yet.</p>}
                </div>
                <form onSubmit={handleComment} className="mt-4 flex gap-2">
                    <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." />
                    <Button type="submit" loading={commentLoading} disabled={!comment.trim()}>Post</Button>
                </form>
            </Card>

            {isAdminOrAgent ? (
                <Card>
                    <button onClick={handleActivityToggle} className="focus-ring flex w-full items-center justify-between rounded-[var(--radius-sm)] text-left">
                        <span className="text-sm font-semibold uppercase tracking-wide text-soft">Activity Log</span>
                        <span className="text-soft">{activityOpen ? "Hide" : "Show"}</span>
                    </button>
                    {activityOpen ? (
                        <div className="mt-3 space-y-2">
                            {activityLoading ? (
                                <LoadingRows rows={2} />
                            ) : activityLogs.length === 0 ? (
                                <p className="text-sm text-soft">No activity recorded yet.</p>
                            ) : (
                                activityLogs.map((log) => (
                                    <div key={log.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
                                        <p className="text-sm text-[var(--color-text)]">{log.detail}</p>
                                        <p className="mt-1 text-xs text-soft">by {log.user?.name} | {new Date(log.createdAt).toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : null}
                </Card>
            ) : null}

            {selectedAttachment ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setSelectedAttachment(null)}>
                    <div className="max-h-[90vh] w-full max-w-5xl rounded-[var(--radius-md)] bg-white p-2 shadow-[var(--shadow-md)]" onClick={(e) => e.stopPropagation()}>
                        {selectedAttachment.mimeType?.startsWith("image/") ? (
                            <img
                                src={`${import.meta.env.VITE_BASE_URL?.replace("/api", "")}/${selectedAttachment.filePath}`}
                                alt={selectedAttachment.fileName}
                                className="max-h-[85vh] w-full object-contain"
                            />
                        ) : selectedAttachment.mimeType === "application/pdf" ? (
                            <iframe
                                src={`${import.meta.env.VITE_BASE_URL?.replace("/api", "")}/${selectedAttachment.filePath}`}
                                className="h-[80vh] w-full"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-sm text-soft">Preview unavailable for this file type.</p>
                                <a
                                    href={`${import.meta.env.VITE_BASE_URL?.replace("/api", "")}/${selectedAttachment.filePath}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-block rounded-[var(--radius-sm)] bg-[var(--color-primary-500)] px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Download File
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </PageShell>
    );
};

export default TicketDetail;
