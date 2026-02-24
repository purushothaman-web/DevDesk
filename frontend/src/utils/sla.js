const CLOSED_STATUSES = new Set(["RESOLVED", "CLOSED"]);

export const getSlaState = (ticket) => {
    if (!ticket?.slaDueAt) return null;

    if (CLOSED_STATUSES.has(ticket.status)) {
        return { label: "SLA Met", tone: "success" };
    }

    const now = Date.now();
    const dueTime = new Date(ticket.slaDueAt).getTime();
    const msRemaining = dueTime - now;

    if (msRemaining < 0) {
        return { label: "SLA Breached", tone: "danger" };
    }
    if (msRemaining <= 4 * 60 * 60 * 1000) {
        return { label: "SLA At Risk", tone: "warning" };
    }
    return { label: "SLA On Track", tone: "info" };
};

export const formatDateTime = (isoValue) => {
    if (!isoValue) return "N/A";
    return new Date(isoValue).toLocaleString();
};
