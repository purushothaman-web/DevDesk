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
                me?.role === "ADMIN" || me?.role === "SUPER_ADMIN" ? (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add Member
                    </Button>
                ) : null
            }
        >
            {error ? <Alert tone="danger">{error}</Alert> : null}

            {loading ? (
                <LoadingRows rows={5} />
            ) : (
                <Table>
                    <TableElement>
                        <TableHead>
                            <tr>
                                <Th>Name</Th>
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
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-semibold text-[var(--color-primary-700)]">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--color-text)]">{user.name}</p>
                                                    {isMe ? <p className="text-xs text-soft">You</p> : null}
                                                </div>
                                            </div>
                                        </Td>
                                        {me?.role === "SUPER_ADMIN" && (
                                            <Td className="hidden sm:table-cell">
                                                <Badge label={user.organization?.name || "None"} tone="neutral" />
                                            </Td>
                                        )}
                                        <Td className="hidden sm:table-cell text-soft">{user.email}</Td>
                                        <Td className="hidden md:table-cell text-soft">{new Date(user.createdAt).toLocaleDateString()}</Td>
                                        <Td>
                                            {isMe ? (
                                                <Badge label={user.role} tone={roleTone(user.role)} />
                                            ) : (
                                                <select
                                                    value={user.role}
                                                    disabled={updating === user.id}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="focus-ring rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-text)] disabled:opacity-60"
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
                    <div className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-soft">{users.length} user{users.length !== 1 ? "s" : ""} total</div>
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
