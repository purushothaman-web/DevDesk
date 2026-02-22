const variants = {
    primary: "bg-[var(--color-primary-500)] text-white border border-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] hover:border-[var(--color-primary-600)]",
    secondary: "bg-[var(--color-surface-muted)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-primary-50)]",
    ghost: "bg-transparent text-[var(--color-text-soft)] border border-transparent hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-700)]",
    danger: "bg-[var(--color-danger-text)] text-white border border-[var(--color-danger-text)] hover:opacity-90",
};

const sizes = {
    sm: "h-9 px-3 text-sm rounded-[var(--radius-sm)]",
    md: "h-10 px-4 text-sm rounded-[var(--radius-sm)]",
    lg: "h-11 px-5 text-sm rounded-[var(--radius-md)]",
};

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" className="opacity-80" />
    </svg>
);

const Button = ({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon = null,
    fullWidth = false,
    className = "",
    ...props
}) => (
    <button
        type={type}
        disabled={disabled || loading}
        className={[
            "focus-ring inline-flex items-center justify-center gap-2 font-semibold transition duration-[var(--duration-fast)]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            variants[variant],
            sizes[size],
            fullWidth ? "w-full" : "",
            className,
        ].join(" ")}
        {...props}
    >
        {loading ? <Spinner /> : icon}
        {children}
    </button>
);

export default Button;
