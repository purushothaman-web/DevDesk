import { useEffect, useState, useCallback } from "react";
import PageShell from "../components/layout/PageShell";
import { getUsers, updateUserRole } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Badge from "../components/ui/Badge";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { Table, TableElement, TableHead, TableRow, Th, Td } from "../components/ui/DataTable";
import Button from "../components/ui/Button";
import CreateUserModal from "../components/CreateUserModal";

const ROLES = ["USER", "AGENT", "ADMIN"];
const roleTone = (role) => (role === "ADMIN" ? "primary" : role === "AGENT" ? "info" : "neutral");

const UsersPage = () => {
    const { user: me } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getUsers();
            setUsers(res.data.data);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load users.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole) => {
        setUpdating(userId);
        try {
            const res = await updateUserRole(userId, newRole);
            setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: res.data.data.role } : user)));
            toast.success("Role updated.");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update role.");
        } finally {
            setUpdating(null);
        }
    };

    const handleUserCreated = (newUser) => {
        setUsers((prev) => [newUser, ...prev]);
    };

    return (
        <PageShell
            title="Team Directory"
            subtitle="Manage your organization's users and agents."
            actions={
                (me?.role === "ADMIN" || me?.role === "SUPER_ADMIN") ? (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add Member
                    </Button>
                ) : null
            }
        >
            {error && <Alert tone="danger">{error}</Alert>}

            {loading ? (
                <LoadingRows rows={5} />
            ) : (
                <Table>
                    <TableElement>
                        <TableHead>
                            <tr>
                                <Th>Member</Th>
                                {me?.role === "SUPER_ADMIN" && <Th className="hidden sm:table-cell">Organization</Th>}
                                <Th className="hidden sm:table-cell">Email</Th>
                                <Th className="hidden md:table-cell">Joined</Th>
                                <Th>Role</Th>
                            </tr>
                        </TableHead>
                        <tbody>
                            {users.map((user) => {
                                const isMe = user.id === me?.id;
                                return (
                                    <TableRow key={user.id}>
                                        <Td>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-sm font-extrabold text-[var(--color-primary-700)] shadow-sm">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--color-text)] tracking-tight">{user.name}</p>
                                                    {isMe && (
                                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary-500)]">You</p>
                                                    )}
                                                </div>
                                            </div>
                                        </Td>
                                        {me?.role === "SUPER_ADMIN" && (
                                            <Td className="hidden sm:table-cell">
                                                <Badge label={user.organization?.name || "None"} tone="neutral" />
                                            </Td>
                                        )}
                                        <Td className="hidden sm:table-cell font-medium text-soft text-[13px]">{user.email}</Td>
                                        <Td className="hidden md:table-cell font-medium text-soft text-[13px]">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                        </Td>
                                        <Td>
                                            {isMe ? (
                                                <Badge label={user.role} tone={roleTone(user.role)} />
                                            ) : (
                                                <select
                                                    value={user.role}
                                                    disabled={updating === user.id}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="focus-ring rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-text)] outline-none transition-colors hover:bg-[var(--color-border)] disabled:opacity-50"
                                                >
                                                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                                                </select>
                                            )}
                                        </Td>
                                    </TableRow>
                                );
                            })}
                        </tbody>
                    </TableElement>
                    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-soft">
                            {users.length} member{users.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                </Table>
            )}

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onUserCreated={handleUserCreated}
            />
        </PageShell>
    );
};

export default UsersPage;
