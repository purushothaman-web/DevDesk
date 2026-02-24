import { prisma } from "../db/client.js";
import { ApiResponse } from "../utils/response.js";
import { openTicketStatuses } from "../utils/sla.js";

export const getDashboardStatsController = async(req, res, next) => {
    try {
        const baseWhere = { isDeleted: false };
        if (req.user.role !== "SUPER_ADMIN") {
            baseWhere.organizationId = req.user.organizationId;
        }
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const atRiskWindowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);

        const total = await prisma.ticket.count({
            where: baseWhere
        });
        
        const open = await prisma.ticket.count({
            where:{
                ...baseWhere,
                status: "OPEN"
            }
        })
        const inProgress = await prisma.ticket.count({
            where:{
                ...baseWhere,
                status: "IN_PROGRESS"
            }
        })
        const resolved = await prisma.ticket.count({
            where:{
                ...baseWhere,
                status: "RESOLVED"
            }
        })
        const closed = await prisma.ticket.count({
            where:{
                ...baseWhere,
                status: "CLOSED"
            }
        })

        const highPriority = await prisma.ticket.count({
            where:{
                ...baseWhere,
                priority: "HIGH"
            }
        })
        const mediumPriority = await prisma.ticket.count({
            where:{
                ...baseWhere,
                priority: "MEDIUM"
            }
        })
        const lowPriority = await prisma.ticket.count({
            where:{
                ...baseWhere,
                priority: "LOW"
            }
        })

        const openWhere = {
            ...baseWhere,
            status: { in: openTicketStatuses }
        };
        const dueToday = await prisma.ticket.count({
            where: {
                ...openWhere,
                slaDueAt: { gte: now, lte: endOfDay },
            }
        });
        const breached = await prisma.ticket.count({
            where: {
                ...openWhere,
                slaDueAt: { lt: now },
            }
        });
        const atRisk = await prisma.ticket.count({
            where: {
                ...openWhere,
                slaDueAt: { gte: now, lte: atRiskWindowEnd },
            }
        });

        let myWorkload = { open: 0, inProgress: 0, resolved: 0, total: 0 };

        if(req.user.role === "AGENT"){
            const assignedWhere = { ...baseWhere, assignedToId: req.user.id };
            const [myOpen, myInProgress, myResolved, myTotal] = await Promise.all([
                prisma.ticket.count({ where: { ...assignedWhere, status: "OPEN" } }),
                prisma.ticket.count({ where: { ...assignedWhere, status: "IN_PROGRESS" } }),
                prisma.ticket.count({ where: { ...assignedWhere, status: "RESOLVED" } }),
                prisma.ticket.count({ where: assignedWhere }),
            ]);
            myWorkload = { open: myOpen, inProgress: myInProgress, resolved: myResolved, total: myTotal };
        }

        return ApiResponse.success(res, 200, "Dashboard stats fetched successfully", {
            total,
            open,
            inProgress,
            resolved,
            closed,
            highPriority,
            mediumPriority,
            lowPriority,
            dueToday,
            breached,
            atRisk,
            assignedToMe: myWorkload.total,
            myWorkload
        });
    } catch (error) {
        return next(error);
    }
}

export const getWorkloadController = async (req, res, next) => {
    try {
        const agentWhere = { role: "AGENT" };
        if (req.user.role !== "SUPER_ADMIN") {
            agentWhere.organizationId = req.user.organizationId;
        }

        const agents = await prisma.user.findMany({
            where: agentWhere,
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
        });

        const workload = await Promise.all(
            agents.map(async (agent) => {
                const [open, inProgress, total] = await Promise.all([
                    prisma.ticket.count({ where: { assignedToId: agent.id, status: "OPEN", isDeleted: false } }),
                    prisma.ticket.count({ where: { assignedToId: agent.id, status: "IN_PROGRESS", isDeleted: false } }),
                    prisma.ticket.count({ where: { assignedToId: agent.id, isDeleted: false } }),
                ]);
                return { ...agent, open, inProgress, total };
            })
        );

        return ApiResponse.success(res, 200, "Workload fetched successfully", workload);
    } catch (error) {
        return next(error);
    }
}
