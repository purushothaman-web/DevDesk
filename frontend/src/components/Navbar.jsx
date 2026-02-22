import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isAdminOrAgent = user?.role === "ADMIN" || user?.role === "AGENT";

    const links = useMemo(() => {
        const base = [{ to: "/dashboard", label: "Dashboard" }];
        if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") base.push({ to: "/tickets", label: "My Tickets" });
        if (isAdminOrAgent || user?.role === "SUPER_ADMIN") base.push({ to: "/tickets/all", label: "All Tickets" });
        if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") base.push({ to: "/users", label: "Users" });
        if (user?.role === "SUPER_ADMIN") base.push({ to: "/organizations", label: "Organizations" });
        base.push({ to: "/profile", label: "Profile" });
        return base;
    }, [isAdminOrAgent, user?.role]);

    const activeClass = (path) =>
        location.pathname === path
            ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)]"
            : "text-[var(--color-text-soft)] hover:bg-[var(--color-primary-50)]";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <Link to="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-1 py-1">
                        <img src="/src/assets/logo.png" alt="DevDesk" className="h-14 w-auto object-contain" />
                    </Link>

                    <div className="hidden items-center gap-1 lg:flex">
                        {links.map((link) => (
                            <Link key={link.to} to={link.to} className={`focus-ring rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition ${activeClass(link.to)}`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 lg:flex">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-[var(--color-text)]">{user?.name}</p>
                            {user?.organizationName && (
                                <p className="text-xs text-[var(--color-text-soft)]">{user.organizationName}</p>
                            )}
                            <div className="mt-1">
                                <Badge
                                    label={user?.role}
                                    tone={user?.role === "ADMIN" ? "primary" : user?.role === "AGENT" ? "info" : "neutral"}
                                    size="sm"
                                />
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
                    </div>

                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-soft)] lg:hidden"
                        aria-label="Open navigation menu"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
                    <button className="absolute inset-0 bg-slate-950/30" onClick={() => setDrawerOpen(false)} aria-label="Close menu overlay" />
                    <div className="absolute right-0 top-0 h-full w-72 border-l border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)]">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-[var(--color-text)]">Navigation</p>
                            <button onClick={() => setDrawerOpen(false)} className="focus-ring rounded p-1 text-[var(--color-text-soft)]" aria-label="Close menu">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-1">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`focus-ring block rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition ${activeClass(link.to)}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                            <p className="text-sm font-semibold text-[var(--color-text)]">{user?.name}</p>
                            {user?.organizationName && (
                                <p className="text-xs text-[var(--color-text-soft)]">{user.organizationName}</p>
                            )}
                            <div className="mt-2">
                                <Badge label={user?.role} size="sm" />
                            </div>
                            <Button className="mt-3 w-full" variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
