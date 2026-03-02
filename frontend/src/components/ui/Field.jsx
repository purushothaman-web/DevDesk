import { useState } from "react";

const Wrapper = ({ label, hint, error, required, children }) => (
    <div className="space-y-2">
        {label && (
            <label className="text-[13px] font-bold tracking-wide uppercase text-[var(--color-text-soft)]">
                {label} {required ? <span className="text-[var(--color-danger-text)]">*</span> : null}
            </label>
        )}
        {children}
        {error ? <p className="text-[13px] font-medium text-[var(--color-danger-text)]">{error}</p> : null}
        {!error && hint ? <p className="text-[13px] text-[var(--color-text-muted)]">{hint}</p> : null}
    </div>
);

const controlBase =
    "w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-[15px] font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal transition-all duration-[var(--duration-base)] hover:border-[var(--color-border-strong)] focus:bg-white focus:border-[var(--color-primary-400)] focus:ring-4 focus:ring-[var(--color-primary-100)] focus:outline-none";

export const Input = ({
    label,
    hint,
    error,
    required,
    className = "",
    sensitive = false,
    sensitiveLabel = "value",
    allowReveal = true,
    type,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const isRevealable = allowReveal && (type === "password" || sensitive);
    const baseType = type ?? (sensitive ? "password" : "text");
    const resolvedType = isRevealable ? (isVisible ? "text" : baseType) : baseType;

    return (
        <Wrapper label={label} hint={hint} error={error} required={required}>
            <div className="relative">
                <input
                    className={`${controlBase} ${isRevealable ? "pr-20" : ""} ${error ? "!border-[var(--color-danger-border)] !focus:border-[var(--color-danger-text)] !focus:ring-[var(--color-danger-bg)]" : ""} ${className}`}
                    type={resolvedType}
                    {...props}
                />
                {isRevealable ? (
                    <button
                        type="button"
                        aria-label={`${isVisible ? "Hide" : "Show"} ${sensitiveLabel}`}
                        aria-pressed={isVisible}
                        className="absolute inset-y-1 right-2 rounded-[var(--radius-sm)] px-3 text-[13px] font-bold tracking-wide uppercase text-[var(--color-text-soft)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] transition-colors focus:ring-2 focus:ring-[var(--color-primary-300)] focus:outline-none"
                        onClick={() => setIsVisible((prev) => !prev)}
                    >
                        {isVisible ? "Hide" : "Show"}
                    </button>
                ) : null}
            </div>
        </Wrapper>
    );
};

export const Select = ({ label, hint, error, required, className = "", children, ...props }) => (
    <Wrapper label={label} hint={hint} error={error} required={required}>
        <div className="relative">
            <select className={`${controlBase} appearance-none pr-10 ${error ? "!border-[var(--color-danger-border)]" : ""} ${className}`} {...props}>
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-text-muted)]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </Wrapper>
);

export const Textarea = ({ label, hint, error, required, className = "", ...props }) => (
    <Wrapper label={label} hint={hint} error={error} required={required}>
        <textarea className={`${controlBase} resize-y min-h-[120px] ${error ? "!border-[var(--color-danger-border)]" : ""} ${className}`} {...props} />
    </Wrapper>
);
