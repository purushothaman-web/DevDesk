import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageShell from "../components/layout/PageShell";
import Card from "../components/ui/Card";
import { Alert, LoadingRows } from "../components/ui/Feedback";
import Badge from "../components/ui/Badge";
import SlaCountdown from "../components/ui/SlaCountdown";
import { getDashboardStats, getWorkload } from "../api/dashboard";
import { getAllTickets } from "../api/tickets";
import { useAuth } from "../context/AuthContext";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-md">
                <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                <p className="text-sm text-[var(--color-primary-600)]">Tickets: <span className="font-bold">{payload[0].value}</span></p>
            </div>
        );
    }
    return null;
};

const toneForPriority = (priority) => (priority === "HIGH" ? "danger" : priority === "MEDIUM" ? "warning" : "info");
const toneForStatus = (status) => (status === "OPEN" ? "info" : status === "IN_PROGRESS" ? "warning" : status === "RESOLVED" ? "success" : "neutral");

/* ── Agent Dashboard ────────────────────────────────────────────────────── */
const AgentDashboard = ({ stats, user }) => {
    const [myTickets, setMyTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllTickets({ assignedToId: user?.id, limit: 10 })
            .then((res) => setMyTickets(res.data.data?.tickets || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user?.id]);

    const myOpen = myTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const myAtRisk = myTickets.filter((t) => {
        if (!t.slaDueAt || t.status === "RESOLVED" || t.status === "CLOSED") return false;
        const msLeft = new Date(t.slaDueAt) - Date.now();
        return msLeft > 0 && msLeft < 2 * 60 * 60 * 1000;
    }).length;
    const myBreached = myTickets.filter((t) => {
        if (!t.slaDueAt || t.status === "RESOLVED" || t.status === "CLOSED") return false;
        return new Date(t.slaDueAt) < Date.now();
    }).length;

    return (
        <div className="space-y-8">
            {/* My Queue Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card className="p-5 flex flex-col justify-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-soft)] mb-1">My Open</p>
                    <p className="text-4xl font-extrabold text-[var(--color-text)]">{loading ? "–" : myOpen}</p>
                </Card>
                <Card className="p-5 flex flex-col justify-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-soft)] mb-1">Total Assigned</p>
                    <p className="text-4xl font-extrabold text-[var(--color-text)]">{loading ? "–" : myTickets.length}</p>
                </Card>
                <Card className="p-5 flex flex-col justify-center border-l-4 border-l-[var(--color-warning-border)] bg-[var(--color-warning-bg)]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-warning-text)] mb-1 opacity-80">SLA At Risk</p>
                    <p className="text-4xl font-extrabold text-[var(--color-warning-text)]">{loading ? "–" : myAtRisk}</p>
                </Card>
                <Card className="p-5 flex flex-col justify-center border-l-4 border-l-[var(--color-danger-border)] bg-[var(--color-danger-bg)]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-danger-text)] mb-1 opacity-80">SLA Breached</p>
                    <p className="text-4xl font-extrabold text-[var(--color-danger-text)]">{loading ? "–" : myBreached}</p>
                </Card>
            </div>

            {/* My Queue List */}
            <Card className="overflow-hidden">
                <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-4">
                    <h2 className="text-[12px] font-extrabold uppercase tracking-widest text-[var(--color-text-soft)]">My Assigned Queue</h2>
                </div>
                {loading ? (
                    <div className="p-6"><LoadingRows rows={4} /></div>
                ) : myTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-400)] mb-4">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <p className="text-[15px] font-bold text-[var(--color-text)]">Queue is clear!</p>
                        <p className="mt-1 text-[13px] text-soft">No tickets assigned to you yet.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-[var(--color-border)]">
                        {myTickets.map((t) => (
                            <li key={t.id}>
                                <Link to={`/tickets/${t.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--color-bg-soft)] transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-[14px] font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary-700)] transition-colors">{t.title}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge label={t.priority} tone={toneForPriority(t.priority)} />
                                            <Badge label={t.status.replace("_", " ")} tone={toneForStatus(t.status)} />
                                            {t.category && <span className="text-[11px] font-semibold text-soft">#{t.category}</span>}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        {t.slaDueAt && (t.status !== "RESOLVED" && t.status !== "CLOSED") ? (
                                            <SlaCountdown slaDueAt={t.slaDueAt} compact />
                                        ) : (
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-soft">{t.status === "RESOLVED" ? "Resolved" : "Closed"}</span>
                                        )}
                                        <p className="text-[11px] text-soft mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                {myTickets.length > 0 && (
                    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-soft">{myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""} assigned</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

/* ── Admin / Super Admin Dashboard ─────────────────────────────────────── */
const AdminDashboard = ({ stats, workload, trendData, priorityData, user }) => (
    <div className="flex flex-col gap-8 mb-10">
        {/* Top Row: Hero Metric & Priority Donut */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="flex flex-col p-6 lg:col-span-2 shadow-sm border-[var(--color-border-strong)] overflow-hidden">
                <div className="mb-6 flex items-start justify-between relative z-10">
                    <div>
                        <h2 className="text-sm uppercase tracking-wider text-[var(--color-text-soft)] font-semibold">Active Volume</h2>
                        <div className="mt-2 flex items-baseline gap-3">
                            <span className="text-5xl font-extrabold text-[var(--color-text)] tracking-tight">{stats.open}</span>
                            <span className="text-sm font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2 py-0.5 rounded-full">Open Tickets</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-[var(--color-text-muted)]">{stats.total}</p>
                        <p className="text-xs text-[var(--color-text-soft)]">Total Historical</p>
                    </div>
                </div>
                <div className="h-[220px] w-full -ml-4 -mb-4 mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary-400)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary-400)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} dy={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="tickets" stroke="var(--color-primary-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" animationDuration={1200} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="flex flex-col p-6 shadow-sm">
                <h2 className="text-sm uppercase tracking-wider text-[var(--color-text-soft)] font-semibold mb-2">Priority Split</h2>
                {priorityData.length > 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center relative">
                        <div className="h-[200px] w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={priorityData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none" animationDuration={1000}>
                                        {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }} itemStyle={{ color: "var(--color-text)", fontWeight: 600 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-5">
                            <span className="text-3xl font-bold text-[var(--color-text)]">{stats.open}</span>
                        </div>
                        <div className="w-full mt-4 flex justify-center gap-4 text-xs font-medium text-[var(--color-text-soft)]">
                            {priorityData.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    {d.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No open tickets to categorize.</div>
                )}
            </Card>
        </div>

        {/* Bottom Row: SLAs and Workload */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <Card className="p-6 flex flex-col justify-center transition-all hover:border-[var(--color-primary-300)] hover:shadow-md cursor-pointer group">
                    <p className="text-sm tracking-wide text-[var(--color-text-soft)] font-medium mb-1">In Progress</p>
                    <p className="text-4xl font-extrabold text-[var(--color-text)] group-hover:text-[var(--color-primary-600)] transition-colors">{stats.inProgress}</p>
                </Card>
                <Card className="p-6 flex flex-col justify-center transition-all hover:border-[var(--color-success-border)] hover:shadow-md cursor-pointer group">
                    <p className="text-sm tracking-wide text-[var(--color-text-soft)] font-medium mb-1">Resolved (Total)</p>
                    <p className="text-4xl font-extrabold text-[var(--color-text)] group-hover:text-[var(--color-success-text)] transition-colors">{stats.resolved}</p>
                </Card>
                <Card className="p-6 flex flex-col justify-center border-l-4 border-l-[var(--color-warning-border)] bg-[var(--color-warning-bg)]">
                    <p className="text-sm tracking-wide text-[var(--color-warning-text)] opacity-80 mb-1 font-semibold">SLA At Risk</p>
                    <p className="text-4xl font-extrabold text-[var(--color-warning-text)]">{stats.atRisk}</p>
                </Card>
                <Card className="p-6 flex flex-col justify-center border-l-4 border-l-[var(--color-danger-border)] bg-[var(--color-danger-bg)]">
                    <p className="text-sm tracking-wide text-[var(--color-danger-text)] opacity-80 mb-1 font-semibold">SLA Breached</p>
                    <p className="text-4xl font-extrabold text-[var(--color-danger-text)]">{stats.breached}</p>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden flex flex-col shadow-sm">
                <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                    <h2 className="text-sm uppercase tracking-wider text-[var(--color-text-soft)] font-semibold">Team Workload</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: "280px" }}>
                    <div className="space-y-1 p-2">
                        {workload.length === 0 ? (
                            <p className="text-sm text-[var(--color-text-soft)] text-center py-4">No active agents.</p>
                        ) : (
                            workload.map((agent) => (
                                <div key={agent.id} className="group flex items-center justify-between p-3 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-soft)] transition-colors">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--color-text)]">{agent.name}</p>
                                        <p className="text-xs text-[var(--color-text-soft)]">{agent.email}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-[var(--color-text)]">{agent.open}</p>
                                            <p className="text-[10px] text-[var(--color-text-muted)] tracking-wider font-semibold uppercase">Open</p>
                                        </div>
                                        <div className="w-px h-6 bg-[var(--color-border)] opacity-60"></div>
                                        <div className="text-center mr-1">
                                            <p className="text-sm font-bold text-[var(--color-text)]">{agent.total}</p>
                                            <p className="text-[10px] text-[var(--color-text-muted)] tracking-wider font-semibold uppercase">Total</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Card>
        </div>
    </div>
);

/* ── Main Dashboard wrapper ─────────────────────────────────────────────── */
const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [workload, setWorkload] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isAgent = user?.role === "AGENT";
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getDashboardStats();
                setStats(res.data.data);
                if (isAdmin) {
                    try {
                        const wRes = await getWorkload();
                        setWorkload(wRes.data.data);
                    } catch { /* non-blocking */ }
                }
            } catch {
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [isAdmin]);

    const trendData = useMemo(() => {
        if (!stats) return [];
        const base = Math.max(0, stats.total - 30);
        return [
            { day: "Mon", tickets: base + 5 },
            { day: "Tue", tickets: base + 12 },
            { day: "Wed", tickets: base + 8 },
            { day: "Thu", tickets: base + 18 },
            { day: "Fri", tickets: base + 14 },
            { day: "Sat", tickets: base + 4 },
            { day: "Sun", tickets: stats.open || base + 10 },
        ];
    }, [stats]);

    const priorityData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "High", value: stats.highPriority || 0, color: "var(--color-danger-text)" },
            { name: "Medium", value: stats.mediumPriority || 0, color: "var(--color-warning-text)" },
            { name: "Low", value: stats.lowPriority || 0, color: "var(--color-success-text)" },
        ].filter((d) => d.value > 0);
    }, [stats]);

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    })();

    return (
        <PageShell
            title={`${greeting}, ${user?.name || "there"}`}
            subtitle={isAgent ? "Here is your personal queue and SLA status." : "Here is your support overview for today."}
            className="max-w-[1400px]"
        >
            {error && <Alert tone="danger">{error}</Alert>}

            {loading ? (
                <LoadingRows rows={4} />
            ) : stats ? (
                isAgent ? (
                    <AgentDashboard stats={stats} user={user} />
                ) : (
                    <AdminDashboard stats={stats} workload={workload} trendData={trendData} priorityData={priorityData} user={user} />
                )
            ) : null}
        </PageShell>
    );
};

export default Dashboard;
