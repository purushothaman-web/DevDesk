import { useEffect, useState, useCallback } from "react";
import PageShell from "../components/layout/PageShell";
import { getOrganizations, deleteOrganization } from "../api/organizations";
import toast from "react-hot-toast";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { EmptyState, Table, TableElement, TableHead, TableRow, Th, Td } from "../components/ui/DataTable";
import Button from "../components/ui/Button";

const OrganizationsPage = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrgs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getOrganizations();
            setOrganizations(res.data.data);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load organizations.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

    const handleDelete = async (id, name) => {
        toast(
            (t) => (
                <div className="flex items-center gap-3 p-1">
                    <div className="flex-1">
                        <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--color-text)]">Delete <span className="text-[var(--color-danger-text)]">{name}</span>?</p>
                        <p className="text-[11px] font-medium text-soft mt-0.5">This cannot be undone.</p>
                    </div>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteOrganization(id);
                                setOrganizations((prev) => prev.filter((org) => org.id !== id));
                                toast.success("Organization deleted.");
                            } catch (err) {
                                toast.error(err?.response?.data?.message || "Delete failed.");
                            }
                        }}
                        className="rounded bg-[var(--color-danger-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-danger-text)] hover:opacity-80 transition-opacity shrink-0"
                    >
                        Confirm
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="text-[11px] font-bold uppercase tracking-wide text-soft hover:text-[var(--color-text)] shrink-0">Cancel</button>
                </div>
            ),
            { duration: 6000 }
        );
    };

    return (
        <PageShell
            title="Organizations"
            subtitle="Manage all registered tenants and workspaces on the platform."
        >
            {error && <Alert tone="danger">{error}</Alert>}

            {loading ? (
                <LoadingRows rows={5} />
            ) : organizations.length === 0 ? (
                <EmptyState
                    title="No Organizations Found"
                    description="There are currently no organizations registered."
                />
            ) : (
                <Table>
                    <TableElement>
                        <TableHead>
                            <tr>
                                <Th>Organization</Th>
                                <Th className="text-center">Members</Th>
                                <Th className="text-center">Tickets</Th>
                                <Th className="hidden sm:table-cell">Created</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </TableHead>
                        <tbody>
                            {organizations.map((org) => (
                                <TableRow key={org.id}>
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-sm font-extrabold text-[var(--color-primary-700)] shadow-sm">
                                                {org.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <p className="font-bold text-[var(--color-text)] tracking-tight">{org.name}</p>
                                        </div>
                                    </Td>
                                    <Td className="text-center font-bold text-[var(--color-text)]">{org.userCount}</Td>
                                    <Td className="text-center font-bold text-[var(--color-text)]">{org.ticketCount}</Td>
                                    <Td className="hidden sm:table-cell font-medium text-soft text-[13px]">
                                        {new Date(org.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                    </Td>
                                    <Td>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDelete(org.id, org.name)}
                                                className="focus-ring rounded-full border border-[var(--color-danger-border,#fca5a5)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </Td>
                                </TableRow>
                            ))}
                        </tbody>
                    </TableElement>
                    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-soft">
                            {organizations.length} organization{organizations.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                </Table>
            )}
        </PageShell>
    );
};

export default OrganizationsPage;
