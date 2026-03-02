import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import CreateTicketModal from "../components/CreateTicketModal";
import { getAllTickets, updateTicketStatus, assignTicket } from "../api/tickets";
import { getAgents } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Field";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { EmptyState, Table, TableElement, TableHead, TableRow, Th, Td } from "../components/ui/DataTable";
import { getSlaState, formatDateTime } from "../utils/sla";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const toneForPriority = (priority) => (priority === "HIGH" ? "danger" : priority === "MEDIUM" ? "warning" : "info");

const AllTickets = () => {
    const { user } = useAuth();
    const isAgent = user?.role === "AGENT";
    const isAdmin = user?.role === "ADMIN";
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [agents, setAgents] = useState([]);
    const [filters, setFilters] = useState({ status: "", priority: "" });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [assignedToMe, setAssignedToMe] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (assignedToMe && user?.id) params.assignedToId = user.id;
            if (debouncedSearch) params.search = debouncedSearch;
            const res = await getAllTickets(params);
            setTickets(res.data.data.tickets);
            setTotalPages(res.data.data.totalPages);
            setSelectedIds(new Set());
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load tickets.");
        } finally {
            setLoading(false);
        }
    }, [filters, page, assignedToMe, debouncedSearch, user?.id]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);
    useEffect(() => {
        if (isAdmin) getAgents().then((res) => setAgents(res.data.data)).catch(() => {});
    }, [isAdmin]);

    const handleCreated = (newTicket) => {
        setTickets((prev) => [newTicket, ...prev]);
        setTotalPages((prev) => Math.max(prev, 1));
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateTicketStatus(id, status);
            setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)));
            toast.success("Status updated.");
        } catch {
            toast.error("Status update failed.");
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === tickets.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(tickets.map((ticket) => ticket.id)));
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulkStatus = async (status) => {
        if (!status || selectedIds.size === 0) return;
        setBulkActionLoading(true);
        try {
            await Promise.all([...selectedIds].map((id) => updateTicketStatus(id, status)));
            toast.success("Bulk status update complete.");
            fetchTickets();
        } catch {
            toast.error("Some updates failed.");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkAssign = async (agentId) => {
        if (!agentId || selectedIds.size === 0) return;
        setBulkActionLoading(true);
        try {
            await Promise.all([...selectedIds].map((id) => assignTicket(id, agentId)));
            toast.success("Bulk assignment complete.");
            fetchTickets();
        } catch {
            toast.error("Some assignments failed.");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Title", "Requester", "Priority", "Status", "Assigned To", "Due Date", "Created At"];
        const rows = tickets.map((ticket) => [
            ticket.id,
            `"${ticket.title.replace(/"/g, '""')}"`,
            ticket.user?.name || "Unknown",
            ticket.priority,
            ticket.status,
            ticket.assignedTo?.name || "Unassigned",
            ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : "",
            new Date(ticket.createdAt).toLocaleDateString(),
        ]);
        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `tickets_export_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <PageShell
            title="All Tickets"
            subtitle="Manage and triage support tickets."
            actions={
                <div className="flex gap-2">
                    <Button onClick={() => setShowModal(true)}>New Ticket</Button>
                    <Button variant="secondary" onClick={handleExportCSV} disabled={tickets.length === 0}>Export CSV</Button>
                </div>
            }
        >
            {/* Filter Toolbar */}
            <div className="mb-4 flex flex-wrap gap-3 items-center rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-3 border border-[var(--color-border)] shadow-sm">
                <div className="flex-1 min-w-[200px]">
                    <Input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Search tickets..." aria-label="Search tickets" />
                </div>
                <Select name="status" value={filters.status} onChange={(e) => { setFilters((prev) => ({ ...prev, status: e.target.value })); setPage(1); }} className="w-40">
                    <option value="">All Statuses</option>
                    {STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                </Select>
                <Select name="priority" value={filters.priority} onChange={(e) => { setFilters((prev) => ({ ...prev, priority: e.target.value })); setPage(1); }} className="w-40">
                    <option value="">All Priorities</option>
                    {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </Select>
                {isAgent && (
                    <Button size="sm" variant={assignedToMe ? "primary" : "ghost"} onClick={() => { setAssignedToMe((prev) => !prev); setPage(1); }}>
                        Assigned to me
                    </Button>
                )}
                {(filters.status || filters.priority || searchTerm) && (
                    <Button size="sm" variant="ghost" onClick={() => { setFilters({ status: "", priority: "" }); setSearchTerm(""); setPage(1); }} className="text-[var(--color-danger-text)]">
                        Clear
                    </Button>
                )}
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-primary-300)] bg-[var(--color-primary-50)] px-5 py-3">
                    <p className="text-[12px] font-extrabold uppercase tracking-widest text-[var(--color-primary-700)]">{selectedIds.size} selected</p>
                    <Select disabled={bulkActionLoading} onChange={(e) => { handleBulkStatus(e.target.value); e.target.value = ""; }} className="w-44">
                        <option value="">Change Status…</option>
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </Select>
                    {isAdmin && (
                        <Select disabled={bulkActionLoading} onChange={(e) => { handleBulkAssign(e.target.value); e.target.value = ""; }} className="w-44">
                            <option value="">Assign To…</option>
                            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </Select>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Cancel</Button>
                </div>
            )}

            {error && <Alert tone="danger">{error}</Alert>}

            {loading ? (
                <LoadingRows rows={5} />
            ) : tickets.length === 0 ? (
                <EmptyState title="No tickets found" description="No tickets match the current filters." />
            ) : (
                <Table>
                    <TableElement>
                        <TableHead>
                            <tr>
                                <Th className="w-8">
                                    <input type="checkbox" checked={selectedIds.size === tickets.length && tickets.length > 0} onChange={toggleSelectAll} />
                                </Th>
                                <Th>Title</Th>
                                {user?.role === "SUPER_ADMIN" && <Th className="hidden sm:table-cell">Organization</Th>}
                                <Th className="hidden sm:table-cell">Requester</Th>
                                <Th className="hidden sm:table-cell">Priority</Th>
                                <Th>Status</Th>
                                <Th className="hidden md:table-cell">SLA</Th>
                                <Th className="hidden md:table-cell">Due Date</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </TableHead>
                        <tbody>
                            {tickets.map((ticket) => {
                                const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== "CLOSED" && ticket.status !== "RESOLVED";
                                const slaState = getSlaState(ticket);
                                return (
                                    <TableRow key={ticket.id} className={selectedIds.has(ticket.id) ? "bg-[var(--color-primary-50)]" : ""}>
                                        <Td>
                                            <input type="checkbox" checked={selectedIds.has(ticket.id)} onChange={() => toggleSelectOne(ticket.id)} />
                                        </Td>
                                        <Td className="font-bold text-[var(--color-text)] tracking-tight max-w-xs truncate">{ticket.title}</Td>
                                        {user?.role === "SUPER_ADMIN" && (
                                            <Td className="hidden sm:table-cell">
                                                <Badge label={ticket.organization?.name || "None"} tone="neutral" />
                                            </Td>
                                        )}
                                        <Td className="hidden sm:table-cell font-medium text-soft">{ticket.user?.name}</Td>
                                        <Td className="hidden sm:table-cell">
                                            <Badge label={ticket.priority} tone={toneForPriority(ticket.priority)} />
                                        </Td>
                                        <Td>
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                className="focus-ring rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-text)] outline-none transition-colors hover:bg-[var(--color-border)]"
                                            >
                                                {STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                                            </select>
                                        </Td>
                                        <Td className="hidden md:table-cell">
                                            {slaState ? (
                                                <div className="space-y-1">
                                                    <Badge label={slaState.label} tone={slaState.tone} />
                                                    <p className="text-[10px] font-semibold text-soft">Due {formatDateTime(ticket.slaDueAt)}</p>
                                                </div>
                                            ) : <span className="text-[11px] font-bold tracking-widest text-soft uppercase">N/A</span>}
                                        </Td>
                                        <Td className={`hidden md:table-cell text-[12px] font-bold ${isOverdue ? "text-[var(--color-danger-text)]" : "text-soft"}`}>
                                            {ticket.dueDate ? (isOverdue ? "Overdue" : new Date(ticket.dueDate).toLocaleDateString()) : "—"}
                                        </Td>
                                        <Td>
                                            <div className="flex justify-end">
                                                <Link
                                                    to={`/tickets/${ticket.id}`}
                                                    className="focus-ring inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-text)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)] transition-colors"
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </Td>
                                    </TableRow>
                                );
                            })}
                        </tbody>
                    </TableElement>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
                            <p className="text-[11px] font-extrabold uppercase tracking-widest text-soft">Page {page} of {totalPages}</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</Button>
                                <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</Button>
                            </div>
                        </div>
                    )}
                </Table>
            )}

            {showModal && <CreateTicketModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
        </PageShell>
    );
};

export default AllTickets;
