const Card = ({ children, className = "", elevated = false, interactive = false }) => (
    <section
        className={[
            "bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-6 transition-all duration-[var(--duration-base)]",
            elevated ? "shadow-[var(--shadow-md)] shadow-[var(--shadow-sm)] border border-[var(--color-border)]" : "border shadow-sm border-[var(--color-border)]",
            interactive ? "hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-strong)] cursor-pointer" : "",
            className,
        ].join(" ")}
        style={{ borderRadius: "min(var(--radius-lg), 24px)" }} // Very rounded cards feel fresh
    >
        {children}
    </section>
);

export default Card;
