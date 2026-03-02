import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import CreateTicketModal from "../components/CreateTicketModal";
import { getMyTickets, deleteTicket } from "../api/tickets";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Select } from "../components/ui/Field";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { EmptyState, Table, TableElement, TableHead, TableRow, Th, Td } from "../components/ui/DataTable";
import { getSlaState } from "../utils/sla";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const PAGE_SIZE = 10;

const toneForPriority = (priority) => (priority === "HIGH" ? "danger" : priority === "MEDIUM" ? "warning" : "info");
const toneForStatus = (status) => {
    if (status === "OPEN") return "info";
    if (status === "IN_PROGRESS") return "warning";
    if (status === "RESOLVED") return "success";
    return "neutral";
};

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ status: "", priority: "" });
    const [page, setPage] = useState(1);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMyTickets();
            setTickets(res.data.data);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load tickets.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleCreated = (newTicket) => setTickets((prev) => [newTicket, ...prev]);

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <div className="flex items-center gap-3 p-1">
                    <span className="text-[13px] font-bold uppercase tracking-wide">Delete Ticket?</span>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteTicket(id);
                                setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
                                toast.success("Ticket deleted.");
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

    const filtered = tickets.filter((ticket) => {
        if (filters.status && ticket.status !== filters.status) return false;
        if (filters.priority && ticket.priority !== filters.priority) return false;
        return true;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <PageShell
            title="My Tickets"
            subtitle="Track and manage your submitted support requests"
            className="max-w-[1400px]"
            actions={<Button size="lg" onClick={() => setShowModal(true)}>New Ticket</Button>}
        >
            <div className="flex flex-wrap items-center gap-4 mb-2">
                <div className="w-56">
                    <Select name="status" value={filters.status} onChange={(e) => { setFilters((prev) => ({ ...prev, status: e.target.value })); setPage(1); }} aria-label="Filter by status">
                        <option value="">All Statuses</option>
                        {STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                    </Select>
                </div>
                <div className="w-56">
                    <Select name="priority" value={filters.priority} onChange={(e) => { setFilters((prev) => ({ ...prev, priority: e.target.value })); setPage(1); }} aria-label="Filter by priority">
                        <option value="">All Priorities</option>
                        {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                    </Select>
                </div>
                {(filters.status || filters.priority) ? <Button variant="ghost" className="mt-1" onClick={() => { setFilters({ status: "", priority: "" }); setPage(1); }}>Clear Filters</Button> : null}
            </div>

            {error ? <Alert tone="danger">{error}</Alert> : null}

            {loading ? (
                <div className="mt-8"><LoadingRows rows={4} /></div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title={tickets.length === 0 ? "No tickets yet" : "No tickets match your filters"}
                    description={tickets.length === 0 ? "Create your first ticket to start tracking requests right here." : "Try adjusting or clearing your filters to see more results."}
                    action={tickets.length === 0 ? <Button onClick={() => setShowModal(true)}>Create Ticket</Button> : <Button variant="secondary" onClick={() => { setFilters({ status: "", priority: "" }); setPage(1); }}>Clear Filters</Button>}
                />
            ) : (
                <Table>
                    <TableElement>
                        <TableHead>
                            <tr>
                                <Th>Reference / Title</Th>
                                <Th className="hidden sm:table-cell">Priority</Th>
                                <Th className="hidden md:table-cell">Status</Th>
                                <Th className="hidden lg:table-cell">SLA</Th>
                                <Th className="hidden lg:table-cell text-right">Created</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </TableHead>
                        <tbody>
                            {paginated.map((ticket) => {
                                const slaState = getSlaState(ticket);
                                return (
                                    <TableRow key={ticket.id}>
                                        <Td>
                                            <p className="font-bold text-[var(--color-text)] mb-0.5">{ticket.title}</p>
                                            <p className="text-[11px] uppercase tracking-wider text-[var(--color-primary-600)] font-bold">TKT-{ticket.id}</p>
                                        </Td>
                                        <Td className="hidden sm:table-cell"><Badge label={ticket.priority} tone={toneForPriority(ticket.priority)} /></Td>
                                        <Td className="hidden md:table-cell"><Badge label={ticket.status.replace("_", " ")} tone={toneForStatus(ticket.status)} /></Td>
                                        <Td className="hidden lg:table-cell">
                                            {slaState ? <Badge label={slaState.label} tone={slaState.tone} size="sm" /> : <span className="text-xs font-medium text-[var(--color-text-soft)]">N/A</span>}
                                        </Td>
                                        <Td className="hidden lg:table-cell text-[var(--color-text-soft)] font-medium text-right text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</Td>
                                        <Td>
                                            <div className="flex justify-end gap-3">
                                                <Link to={`/tickets/${ticket.id}`} className="focus-ring rounded-[var(--radius-sm)] bg-[var(--color-bg-soft)] px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] transition-colors">Open</Link>
                                                <button onClick={() => handleDelete(ticket.id)} className="focus-ring rounded-[var(--radius-sm)] border border-transparent px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] hover:text-[#9e1c2c] transition-all">Del</button>
                                            </div>
                                        </Td>
                                    </TableRow>
                                );
                            })}
                        </tbody>
                    </TableElement>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-4">
                            <p className="text-[13px] font-medium text-[var(--color-text-soft)]">Page <span className="font-bold text-[var(--color-text)]">{page}</span> of {totalPages}</p>
                            <div className="flex gap-3">
                                <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                                <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                            </div>
                        </div>
                    )}
                </Table>
            )}

            {showModal ? <CreateTicketModal onClose={() => setShowModal(false)} onCreated={handleCreated} /> : null}
        </PageShell>
    );
};

export default MyTickets;
