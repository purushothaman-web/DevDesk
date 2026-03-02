import { useState, useEffect, useRef } from "react";

/**
 * SlaCountdown — live ticking countdown to SLA breach.
 * Colour: green (> 2h) → amber (< 2h) → red (< 30m) → "Breached"
 */
const SlaCountdown = ({ slaDueAt, compact = false }) => {
    const [msLeft, setMsLeft] = useState(() => new Date(slaDueAt) - Date.now());
    const rafRef = useRef(null);

    useEffect(() => {
        if (!slaDueAt) return;
        const tick = () => {
            const remaining = new Date(slaDueAt) - Date.now();
            setMsLeft(remaining);
            if (remaining > 0) {
                rafRef.current = setTimeout(tick, 1000);
            }
        };
        tick();
        return () => clearTimeout(rafRef.current);
    }, [slaDueAt]);

    if (!slaDueAt) return null;

    const formatCountdown = (ms) => {
        if (ms <= 0) return null;
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainHours = hours % 24;
            return `${days}d ${remainHours}h`;
        }
        if (hours >= 1) return `${hours}h ${minutes}m`;
        if (minutes >= 1) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    const breached = msLeft <= 0;
    const oneHour = 60 * 60 * 1000;
    const twoHours = 2 * oneHour;
    const thirtyMin = 30 * 60 * 1000;

    let colorClass, bgClass, dotClass;
    if (breached) {
        colorClass = "text-[var(--color-danger-text,#b91c1c)]";
        bgClass = "bg-red-50 border-red-200";
        dotClass = "bg-red-500 animate-pulse";
    } else if (msLeft < thirtyMin) {
        colorClass = "text-[var(--color-danger-text,#b91c1c)]";
        bgClass = "bg-red-50 border-red-200";
        dotClass = "bg-red-500 animate-pulse";
    } else if (msLeft < twoHours) {
        colorClass = "text-amber-700";
        bgClass = "bg-amber-50 border-amber-200";
        dotClass = "bg-amber-500";
    } else {
        colorClass = "text-emerald-700";
        bgClass = "bg-emerald-50 border-emerald-200";
        dotClass = "bg-emerald-500";
    }

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border ${bgClass} ${colorClass}`}>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass}`} />
                {breached ? "Breached" : formatCountdown(msLeft)}
            </span>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2 rounded-[var(--radius-lg)] border px-3 py-2 ${bgClass}`}>
            <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} />
            <div>
                <p className={`text-[11px] font-extrabold uppercase tracking-widest ${colorClass}`}>
                    {breached ? "SLA Breached" : "SLA"}
                </p>
                {!breached && (
                    <p className={`text-[18px] font-black leading-none tabular-nums ${colorClass}`}>
                        {formatCountdown(msLeft)}
                    </p>
                )}
                {breached && (
                    <p className={`text-[13px] font-extrabold leading-none ${colorClass}`}>
                        Past due
                    </p>
                )}
            </div>
        </div>
    );
};

export default SlaCountdown;
