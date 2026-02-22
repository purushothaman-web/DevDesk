import { useEffect, useState, useCallback } from "react";
import PageShell from "../components/layout/PageShell";
import { getOrganizations, deleteOrganization } from "../api/organizations";
import toast from "react-hot-toast";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { EmptyState, Table, TableElement, TableHead, TableRow, Th, Td } from "../components/ui/DataTable";

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

    useEffect(() => {
        fetchOrgs();
    }, [fetchOrgs]);

    const handleDelete = async (id, name) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span className="text-sm">Delete organization <strong>{name}</strong>?</span>
                    <span className="text-xs text-[var(--color-danger-text)]">This action cannot be undone.</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="rounded border border-[var(--color-border)] px-2 py-1 text-xs font-semibold text-[var(--color-text-soft)] hover:bg-[var(--color-surface-hover)]"
                        >
                            Cancel
                        </button>
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
                            className="rounded bg-[var(--color-danger-bg)] px-2 py-1 text-xs font-semibold text-white hover:bg-[var(--color-danger-hover)]"
                        >
                            Confirm Delete
                        </button>
                    </div>
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
            {error ? <Alert tone="danger">{error}</Alert> : null}

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
                                <Th>Organization Name</Th>
                                <Th>Members</Th>
                                <Th>Tickets</Th>
                                <Th className="hidden sm:table-cell">Created At</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </TableHead>
                        <tbody>
                            {organizations.map((org) => (
                                <TableRow key={org.id}>
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-100)] text-xs font-semibold text-[var(--color-primary-700)]">
                                                {org.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <p className="font-medium text-[var(--color-text)]">{org.name}</p>
                                        </div>
                                    </Td>
                                    <Td>{org.userCount}</Td>
                                    <Td>{org.ticketCount}</Td>
                                    <Td className="hidden sm:table-cell text-soft">{new Date(org.createdAt).toLocaleDateString()}</Td>
                                    <Td>
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleDelete(org.id, org.name)} 
                                                className="focus-ring rounded-[var(--radius-sm)] border border-[var(--color-danger-border)] px-2.5 py-1 text-xs font-semibold text-[var(--color-danger-text)]"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </Td>
                                </TableRow>
                            ))}
                        </tbody>
                    </TableElement>
                    <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-soft">
                        {organizations.length} organization{organizations.length !== 1 ? "s" : ""} total
                    </div>
                </Table>
            )}
        </PageShell>
    );
};

export default OrganizationsPage;
