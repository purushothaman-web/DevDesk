import Navbar from "../Navbar";

const PageShell = ({ children, title, subtitle, actions = null, className = "max-w-7xl" }) => (
    <div className="surface-page min-h-screen text-default">
        <Navbar />
        <main className={`mx-auto w-full ${className} px-4 py-6 sm:px-6 sm:py-8`}>
            {(title || actions) && (
                <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        {title ? <h1 className="text-2xl font-bold tracking-tight">{title}</h1> : null}
                        {subtitle ? <p className="mt-1 text-sm text-soft">{subtitle}</p> : null}
                    </div>
                    {actions}
                </header>
            )}
            <div className="space-y-6">{children}</div>
        </main>
    </div>
);

export default PageShell;
