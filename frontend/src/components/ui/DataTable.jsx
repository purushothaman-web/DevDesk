export const Table = ({ children }) => (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">{children}</div>
    </div>
);

export const TableElement = ({ children }) => <table className="min-w-full text-sm">{children}</table>;

export const TableHead = ({ children }) => (
    <thead className="bg-[var(--color-surface-muted)] text-[var(--color-text-soft)]">{children}</thead>
);

export const TableRow = ({ children, className = "" }) => (
    <tr className={`border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-primary-50)] ${className}`}>{children}</tr>
);

export const Th = ({ children, className = "" }) => (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${className}`}>{children}</th>
);

export const Td = ({ children, className = "" }) => (
    <td className={`px-4 py-3.5 text-[var(--color-text)] ${className}`}>{children}</td>
);

export const EmptyState = ({ title, description, action = null }) => (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-white p-10 text-center">
        <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--color-text-soft)]">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
    </div>
);
