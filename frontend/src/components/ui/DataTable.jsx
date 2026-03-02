export const Table = ({ children }) => (
    <div className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)]">
        <div className="overflow-x-auto">{children}</div>
    </div>
);

export const TableElement = ({ children }) => <table className="min-w-full text-sm text-left">{children}</table>;

export const TableHead = ({ children }) => (
    <thead className="bg-[#fcfdfef0] text-[var(--color-text-soft)] border-b border-[var(--color-border)]">{children}</thead>
);

export const TableRow = ({ children, className = "" }) => (
    <tr className={`border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-soft)] transition-colors ${className}`}>{children}</tr>
);

export const Th = ({ children, className = "" }) => (
    <th className={`px-5 py-4 text-[13px] font-bold tracking-wide uppercase ${className}`}>{children}</th>
);

export const Td = ({ children, className = "" }) => (
    <td className={`px-5 py-4 text-[15px] font-medium text-[var(--color-text)] ${className}`}>{children}</td>
);

export const EmptyState = ({ title, description, action = null }) => (
    <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-12 text-center transition-colors hover:border-[var(--color-primary-300)]">
        <h3 className="text-lg font-bold text-[var(--color-text)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--color-text-soft)] font-medium">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
);
