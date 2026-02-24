import { prisma } from "../db/client.js";
import { sendSlaBreachEmail } from "./mail.service.js";
import { openTicketStatuses } from "../utils/sla.js";

const SLA_SWEEP_INTERVAL_MS = Number.parseInt(process.env.SLA_SWEEP_INTERVAL_MS || "60000", 10);

export const runSlaBreachSweep = async () => {
    const now = new Date();
    const breachedTickets = await prisma.ticket.findMany({
        where: {
            isDeleted: false,
            status: { in: openTicketStatuses },
            slaDueAt: { lt: now },
            slaBreachNotifiedAt: null,
        },
        select: {
            id: true,
            title: true,
            slaDueAt: true,
            user: { select: { id: true, name: true, email: true } },
        },
    });

    for (const ticket of breachedTickets) {
        await sendSlaBreachEmail(ticket.user.email, ticket.user.name, ticket.title, ticket.slaDueAt);
        await prisma.ticket.update({
            where: { id: ticket.id },
            data: { slaBreachNotifiedAt: new Date() },
        });
        await prisma.activityLog.create({
            data: {
                ticketId: ticket.id,
                userId: ticket.user.id,
                action: "SLA_BREACHED",
                detail: "SLA breached and escalation notification sent",
            }
        });
    }

    return breachedTickets.length;
};

export const startSlaScheduler = () => {
    if (!Number.isFinite(SLA_SWEEP_INTERVAL_MS) || SLA_SWEEP_INTERVAL_MS < 15000) {
        console.warn("SLA scheduler disabled due to invalid SLA_SWEEP_INTERVAL_MS");
        return;
    }

    setInterval(() => {
        runSlaBreachSweep().catch((error) => {
            console.error("SLA sweep failed:", error);
        });
    }, SLA_SWEEP_INTERVAL_MS);
};
