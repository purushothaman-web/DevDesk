import { prisma } from "../db/client.js";
import { ApiResponse } from "../utils/response.js";

export const getDashboardStatsController = async(req, res, next) => {
    try {
        const baseWhere = { isDeleted: false };
        if (req.user.role !== "SUPER_ADMIN") {
            baseWhere.organizationId = req.user.organizationId;
        }

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

        let assignedToMe = 0;

        if(req.user.role === "AGENT"){
            assignedToMe = await prisma.ticket.count({
                where:{
                    ...baseWhere,
                    assignedToId: req.user.id
                }
            })
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
            assignedToMe
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
