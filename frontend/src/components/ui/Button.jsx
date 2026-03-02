const variants = {
    primary: "bg-[var(--color-primary-500)] text-white shadow-sm hover:shadow-md hover:bg-[var(--color-primary-600)] hover:-translate-y-[1px]",
    secondary: "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-border-strong)] hover:shadow-md hover:-translate-y-[1px]",
    ghost: "bg-transparent text-[var(--color-text-soft)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]",
    danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] hover:bg-[#ffe0e4] hover:text-[#9e1c2c]",
};

const sizes = {
    sm: "h-9 px-4 text-[13px] rounded-[var(--radius-sm)]",
    md: "h-11 px-5 text-sm rounded-[var(--radius-md)]",
    lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
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
            "focus-ring inline-flex items-center justify-center gap-2.5 font-semibold transition-all duration-[var(--duration-base)]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none",
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
