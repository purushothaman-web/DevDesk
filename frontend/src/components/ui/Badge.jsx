const tones = {
    neutral: "bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-[var(--color-border)]",
    info: "tone-info",
    success: "tone-success",
    warning: "tone-warning",
    danger: "tone-danger",
    primary: "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)]",
};

const sizes = {
    sm: "text-[10px] px-2 py-0.5 rounded-full",
    md: "text-xs px-2.5 py-1 rounded-full",
};

const Badge = ({ label, tone = "neutral", size = "md", className = "" }) => (
    <span className={`inline-flex items-center font-semibold ${tones[tone]} ${sizes[size]} ${className}`}>{label}</span>
);

export default Badge;
