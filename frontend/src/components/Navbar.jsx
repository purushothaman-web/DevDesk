import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import logo from "../assets/logo.png";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isAdminOrAgent = user?.role === "ADMIN" || user?.role === "AGENT";

    const links = useMemo(() => {
        const base = [];
        if (isAdminOrAgent || user?.role === "SUPER_ADMIN") base.push({ to: "/dashboard", label: "Dashboard" });
        if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") base.push({ to: "/tickets", label: "My Tickets" });
        if (isAdminOrAgent || user?.role === "SUPER_ADMIN") base.push({ to: "/tickets/all", label: "All Tickets" });
        if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") base.push({ to: "/users", label: "Users" });
        if (user?.role === "SUPER_ADMIN") base.push({ to: "/organizations", label: "Organizations" });
        if (user?.role === "ADMIN") base.push({ to: "/settings/sla", label: "SLA Settings" });
        base.push({ to: "/profile", label: "Profile" });
        return base;
    }, [isAdminOrAgent, user?.role]);

    const activeClass = (path) =>
        location.pathname === path
            ? "bg-[var(--color-bg-soft)] text-[var(--color-primary-700)] font-bold tracking-wide shadow-sm"
            : "text-[var(--color-text-soft)] font-semibold hover:bg-[var(--color-primary-50)] hover:text-[var(--color-text)] transition-all";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[#fcfdfef0] backdrop-blur-md">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-2">
                    <Link to="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] py-1 hover:opacity-80 transition-opacity">
                        <img src={logo} alt="DevDesk" className="h-14 w-auto object-contain drop-shadow-sm" />
                    </Link>

                    <div className="hidden items-center gap-2 lg:flex">
                        {links.map((link) => (
                            <Link key={link.to} to={link.to} className={`focus-ring rounded-full px-4 py-1.5 text-[13px] uppercase tracking-wide ${activeClass(link.to)}`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden items-center gap-4 lg:flex pl-4 border-l border-[var(--color-border)]">
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-[13px] font-extrabold tracking-wide text-[var(--color-text)] leading-none">{user?.name}</p>
                            {user?.organizationName && (
                                <p className="text-[11px] font-medium text-[var(--color-text-soft)] mt-1">{user.organizationName}</p>
                            )}
                        </div>
                        <Badge
                            label={user?.role}
                            tone={user?.role === "ADMIN" ? "primary" : user?.role === "AGENT" ? "info" : "neutral"}
                            size="sm"
                        />
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="px-3" aria-label="Logout">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </Button>
                    </div>

                    <button
                        onClick={() => setDrawerOpen((prev) => !prev)}
                        className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] text-[var(--color-text)] lg:hidden transition-colors hover:bg-[var(--color-border)]"
                        aria-label="Toggle navigation menu"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={drawerOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>
            </nav>

            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
                    <button className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDrawerOpen(false)} aria-label="Close menu overlay" />
                    <div className="absolute right-0 top-0 h-full w-[280px] border-l border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl animate-in slide-in-from-right">
                        <div className="mb-6 flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                            <img src={logo} alt="DevDesk" className="h-8 w-auto object-contain" />
                            <button onClick={() => setDrawerOpen(false)} className="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`focus-ring block rounded-[var(--radius-md)] px-4 py-3 text-[14px] uppercase tracking-wide ${activeClass(link.to)}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-lg font-bold text-[var(--color-primary-600)] mb-3 shadow-sm border border-[var(--color-primary-100)]">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <p className="text-[14px] font-bold text-[var(--color-text)]">{user?.name}</p>
                            {user?.organizationName && (
                                <p className="text-xs font-semibold text-[var(--color-text-soft)] mt-1">{user.organizationName}</p>
                            )}
                            <div className="mt-3">
                                <Badge label={user?.role} size="sm" />
                            </div>
                            <Button className="mt-5 w-full" variant="ghost" onClick={handleLogout}>Logout</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
