const tones = {
    neutral: "bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border tracking-wider uppercase border-transparent",
    info: "bg-[var(--color-info-bg)] text-[var(--color-info-text)] tracking-wider uppercase border border-transparent",
    success: "bg-[var(--color-success-bg)] text-[var(--color-success-text)] tracking-wider uppercase border border-transparent",
    warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] tracking-wider uppercase border border-transparent",
    danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] tracking-wider uppercase border border-[var(--color-danger-border)]",
    primary: "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] tracking-wider uppercase border border-[var(--color-primary-200)]",
};

const sizes = {
    sm: "text-[9px] px-2 py-0.5 rounded-full font-bold",
    md: "text-[10px] px-2.5 py-1 rounded-[var(--radius-sm)] font-bold",
};

const Badge = ({ label, tone = "neutral", size = "md", className = "" }) => (
    <span className={`inline-flex items-center justify-center ${tones[tone]} ${sizes[size]} ${className}`}>{label}</span>
);

export default Badge;
