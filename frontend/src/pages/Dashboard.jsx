import { useEffect, useState } from "react";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import { getDashboardStats, getWorkload } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ label, value }) => (
    <Card interactive className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">{value}</p>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [workload, setWorkload] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getDashboardStats();
                setStats(res.data.data);
                if (user?.role === "ADMIN") {
                    try {
                        const wRes = await getWorkload();
                        setWorkload(wRes.data.data);
                    } catch {
                        // workload should not block dashboard
                    }
                }
            } catch {
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user?.role]);

    return (
        <PageShell title={`Hello, ${user?.name || "there"}`} subtitle="Here is your support overview for today.">
            {error ? <Alert tone="danger">{error}</Alert> : null}

            {loading ? (
                <LoadingRows rows={4} />
            ) : stats ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <StatCard label="Total Tickets" value={stats.total} />
                            <StatCard label="Open Tickets" value={stats.open} />
                            <StatCard label="In Progress" value={stats.inProgress} />
                            <StatCard label="Resolved" value={stats.resolved} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <StatCard label="High Priority" value={stats.highPriority} />
                            <StatCard label="Medium Priority" value={stats.mediumPriority} />
                            <StatCard label="Low Priority" value={stats.lowPriority} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <StatCard label="Due Today" value={stats.dueToday} />
                            <StatCard label="SLA At Risk" value={stats.atRisk} />
                            <StatCard label="SLA Breached" value={stats.breached} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="h-fit">
                            {user?.role === "AGENT" ? (
                                <>
                                    <h2 className="text-lg font-semibold text-[var(--color-text)]">Your Workload</h2>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                                            <span className="text-sm font-medium text-[var(--color-text)]">Total Assigned</span>
                                            <span className="text-xl font-bold text-[var(--color-primary-700)]">{stats.myWorkload?.total ?? stats.assignedToMe}</span>
                                        </div>
                                        {stats.myWorkload && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2 text-center">
                                                    <p className="text-xs text-[var(--color-text-soft)]">Open</p>
                                                    <p className="text-base font-bold text-[var(--color-text)]">{stats.myWorkload.open}</p>
                                                </div>
                                                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2 text-center">
                                                    <p className="text-xs text-[var(--color-text-soft)]">Progress</p>
                                                    <p className="text-base font-bold text-[var(--color-text)]">{stats.myWorkload.inProgress}</p>
                                                </div>
                                                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2 text-center">
                                                    <p className="text-xs text-[var(--color-text-soft)]">Resolved</p>
                                                    <p className="text-base font-bold text-[var(--color-text)]">{stats.myWorkload.resolved}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-lg font-semibold text-[var(--color-text)]">Agent Workload</h2>
                                    <div className="mt-3 space-y-2">
                                        {workload.length === 0 ? (
                                            <p className="text-sm text-[var(--color-text-soft)]">No agents found.</p>
                                        ) : (
                                            workload.map((agent) => (
                                                <div key={agent.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                                                    <p className="text-sm font-semibold text-[var(--color-text)]">{agent.name}</p>
                                                    <p className="text-xs text-[var(--color-text-soft)]">{agent.email}</p>
                                                    <p className="mt-1 text-xs text-[var(--color-text-soft)]">Open: {agent.open} | In Progress: {agent.inProgress} | Total: {agent.total}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            ) : null}
        </PageShell>
    );
};

export default Dashboard;
