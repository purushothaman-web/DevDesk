import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card"; // for lighter feature boxes

const features = [
  {
    title: "Ticket Lifecycle Management",
    description: "Capture, prioritize, assign, and resolve support tickets with complete visibility.",
  },
  {
    title: "Role-Based Access",
    description: "Separate experiences for users, agents, admins, and super admins with strict guardrails.",
  },
  {
    title: "Multi-Tenant Isolation",
    description: "Each organization runs in its own isolated workspace with centralized platform oversight.",
  },
  {
    title: "Operational Dashboards",
    description: "Track SLA health, workload, and throughput with actionable platform and team analytics.",
  },
];

const roleHighlights = [
  { role: "USER", summary: "Create tickets, follow progress, and collaborate through comments and attachments." },
  { role: "AGENT", summary: "Resolve tickets efficiently with assignment controls and workflow visibility." },
  { role: "ADMIN / SUPER_ADMIN", summary: "Manage teams, monitor organization trends, and enforce support operations." },
];

import { useEffect } from "react";

const Landing = () => {
  const { user } = useAuth();
  const appHref = user?.role === "USER" ? "/tickets" : "/dashboard";

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    document.querySelectorAll(".fade-in-on-scroll").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-brutalist-bg)] text-[var(--color-brutalist-text)] font-body">
      <header className="bg-[var(--color-brutalist-bg)] text-[var(--color-brutalist-text)] border-b-4 border-[var(--color-brutalist-border)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-heading text-3xl tracking-wider uppercase">
            DevDesk
          </Link>
          <nav className="flex items-center gap-4 font-body uppercase text-sm">
            {user ? (
              <>
                <Link to={appHref} className="px-3 py-2 border-2 border-[var(--color-brutalist-border)]">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 border-2 border-[var(--color-brutalist-border)]">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 border-2 border-[var(--color-brutalist-border)]">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 bg-[var(--color-brutalist-bg)]">
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 py-20 px-6 bg-[var(--color-brutalist-bg)] text-[var(--color-brutalist-text)]">
          <div className="flex flex-col justify-center">
            <h1 className="text-6xl font-heading uppercase leading-tight border-b-8 border-[var(--color-brutalist-border)] pb-2">
              DevDesk
            </h1>
            <p className="mt-6 text-xl font-body">A raw ticket system built for developers.</p>
            <div className="mt-8 flex gap-6">
              <Link to="/register" className="px-6 py-3 border-4 border-[var(--color-brutalist-border)] font-body">
                Start Now
              </Link>
              <Link to="/login" className="px-6 py-3 border-4 border-[var(--color-brutalist-border)] font-body">
                Sign In
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {/* placeholder for brutalist graphic or logo */}
            <div className="w-48 h-48 border-4 border-[var(--color-brutalist-border)] flex items-center justify-center text-4xl font-heading">
              ⚙️
            </div>
          </div>
        </section>

        {/* why it matters strip */}
        <section className="mt-16 max-w-4xl mx-auto px-4 text-center fade-in-on-scroll bg-[var(--color-brutalist-bg)]">
          <h2 className="text-3xl font-heading uppercase">Why DevDesk?</h2>
          <p className="mt-4 text-[var(--color-brutalist-text)] font-body">
            Built by engineers for engineers: minimal setup, full transparency, and no vendor lock‑in. You stay in control of your data and workflows.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 font-body text-[var(--color-brutalist-text)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-brutalist-accent)]">✔️</span>
              <span>All tickets, comments and attachments live in one PostgreSQL database.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-brutalist-accent)]">✔️</span>
              <span>Zero client‑side frameworks; the app is shipped as static Vite build.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-brutalist-accent)]">✔️</span>
              <span>Open‑source MIT licence – fork it, deploy it, study the code.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-brutalist-accent)]">✔️</span>
              <span>Designed for small teams who don’t want a bloated CRM.</span>
            </li>
          </ul>
        </section>

        <section className="mt-12 px-6 bg-[var(--color-brutalist-bg)]">
          <h2 className="text-2xl font-heading border-b-4 border-[var(--color-brutalist-border)] pb-2">
            Features
          </h2>
          <ul className="mt-6 space-y-4 font-body">
            {features.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="text-[var(--color-brutalist-accent)]">■</span>
                <div>
                  <span className="font-bold">{item.title}</span>
                  <p className="text-sm">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 overflow-hidden py-4 bg-[var(--color-brutalist-bg)] text-[var(--color-brutalist-text)]">
          <div className="whitespace-nowrap animate-marquee font-body text-lg">
            {roleHighlights.map((item, idx) => (
              <span key={item.role} className="inline-block mx-8">
                <span className="font-bold uppercase">{item.role}</span>: {item.summary}
              </span>
            ))}
          </div>
        </section>

        {/* how it works section */}
        <section className="mt-16 py-12 fade-in-on-scroll bg-[var(--color-brutalist-bg)] text-[var(--color-brutalist-text)]">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center">How it works</h2>
            <p className="mt-2 italic text-center">A mechanical flow in three steps.</p>
            <ol className="relative mt-10 border-l-2 border-[var(--color-brutalist-accent)] pl-8 space-y-12">
              {[
                { num: 1, title: "Create a ticket", detail: "Report what broke or needs work." },
                { num: 2, title: "Assign to an agent", detail: "Choose a handler or let the system pick." },
                { num: 3, title: "Resolve & comment", detail: "Close it out with notes and status." },
              ].map((step) => (
                <li key={step.num} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brutalist-accent)] text-[var(--color-brutalist-bg)] font-mono font-bold">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-mono font-semibold">{step.title}</h3>
                    <p className="mt-1 text-[var(--color-brutalist-accent)]">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* footer */}
        <footer className="mt-20 bg-[var(--color-brutalist-bg)] text-[var(--color-brutalist-text)] py-8">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono">⚙️</span>
              <span>Built with React, Tailwind & Prisma</span>
            </div>
            <a href="https://github.com/purushothaman-web/DevDesk" target="_blank" rel="noopener"
               className="font-mono text-[var(--color-brutalist-accent)] hover:text-[var(--color-brutalist-text)] transition-colors">
              View source on GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Landing;
