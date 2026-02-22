export const Alert = ({ tone = "info", children, className = "" }) => (
    <div className={`rounded-[var(--radius-sm)] px-4 py-3 text-sm ${tone === "danger" ? "tone-danger" : tone === "success" ? "tone-success" : tone === "warning" ? "tone-warning" : "tone-info"} ${className}`}>
        {children}
    </div>
);

export const LoadingRows = ({ rows = 4 }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
            <div
                key={index}
                className="h-14 animate-pulse rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white"
            />
        ))}
    </div>
);
