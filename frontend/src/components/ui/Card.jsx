const Card = ({ children, className = "", elevated = false, interactive = false }) => (
    <section
        className={[
            "surface-card rounded-[var(--radius-lg)] p-5",
            elevated ? "shadow-[var(--shadow-md)]" : "",
            interactive ? "transition duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]" : "",
            className,
        ].join(" ")}
    >
        {children}
    </section>
);

export default Card;
