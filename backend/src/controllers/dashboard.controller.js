import { prisma } from "../db/client.js";

export const getDashboardStatsController = async(req, res, next) => {
    try {
        const total = await prisma.ticket.count();
        
        const open = await prisma.ticket.count({
            where:{
                status: "OPEN"
            }
        })
        const inProgress = await prisma.ticket.count({
            where:{
                status: "IN_PROGRESS"
            }
        })
        const resolved = await prisma.ticket.count({
            where:{
                status: "RESOLVED"
            }
        })
        const closed = await prisma.ticket.count({
            where:{
                status: "CLOSED"
            }
        })

        const highPriority = await prisma.ticket.count({
            where:{
                priority: "HIGH"
            }
        })
        const mediumPriority = await prisma.ticket.count({
            where:{
                priority: "MEDIUM"
            }
        })
        const lowPriority = await prisma.ticket.count({
            where:{
                priority: "LOW"
            }
        })

        let assignedToMe = 0;

        if(req.user.role === "AGENT"){
            assignedToMe = await prisma.ticket.count({
                where:{
                    assignedToId: req.user.id
                }
            })
        }

        return res.json({
            total,
            open,
            inProgress,
            resolved,
            closed,
            highPriority,
            mediumPriority,
            lowPriority,
            assignedToMe
        })
    } catch (error) {
        return next(error);
    }
}