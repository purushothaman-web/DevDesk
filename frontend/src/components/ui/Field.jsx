const Wrapper = ({ label, hint, error, required, children }) => (
    <div className="space-y-1.5">
        {label && (
            <label className="text-sm font-semibold text-[var(--color-text-soft)]">
                {label} {required ? <span className="text-[var(--color-danger-text)]">*</span> : null}
            </label>
        )}
        {children}
        {error ? <p className="text-xs text-[var(--color-danger-text)]">{error}</p> : null}
        {!error && hint ? <p className="text-xs text-[var(--color-text-muted)]">{hint}</p> : null}
    </div>
);

const controlBase =
    "focus-ring w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition duration-[var(--duration-fast)] focus:border-[var(--color-primary-300)]";

export const Input = ({ label, hint, error, required, className = "", ...props }) => (
    <Wrapper label={label} hint={hint} error={error} required={required}>
        <input className={`${controlBase} ${className}`} {...props} />
    </Wrapper>
);

export const Select = ({ label, hint, error, required, className = "", children, ...props }) => (
    <Wrapper label={label} hint={hint} error={error} required={required}>
        <select className={`${controlBase} ${className}`} {...props}>
            {children}
        </select>
    </Wrapper>
);

export const Textarea = ({ label, hint, error, required, className = "", ...props }) => (
    <Wrapper label={label} hint={hint} error={error} required={required}>
        <textarea className={`${controlBase} resize-y ${className}`} {...props} />
    </Wrapper>
);
