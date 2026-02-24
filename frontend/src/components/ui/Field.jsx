import { useState } from "react";

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
                    className={`${controlBase} ${isRevealable ? "pr-20" : ""} ${className}`}
                    type={resolvedType}
                    {...props}
                />
                {isRevealable ? (
                    <button
                        type="button"
                        aria-label={`${isVisible ? "Hide" : "Show"} ${sensitiveLabel}`}
                        aria-pressed={isVisible}
                        className="focus-ring absolute inset-y-1 right-1 rounded px-2 text-xs font-semibold text-[var(--color-primary-700)] hover:text-[var(--color-primary-600)]"
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
