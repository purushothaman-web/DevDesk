import { prisma } from "../db/client.js";
import { ApiResponse } from "../utils/response.js";

export const getDashboardStatsController = async(req, res, next) => {
    try {
        const total = await prisma.ticket.count({
            where:{
                isDeleted: false
            }
        });
        
        const open = await prisma.ticket.count({
            where:{
                status: "OPEN",
                isDeleted: false
            }
        })
        const inProgress = await prisma.ticket.count({
            where:{
                status: "IN_PROGRESS",
                isDeleted: false
            }
        })
        const resolved = await prisma.ticket.count({
            where:{
                status: "RESOLVED",
                isDeleted: false
            }
        })
        const closed = await prisma.ticket.count({
            where:{
                status: "CLOSED",
                isDeleted: false
            }
        })

        const highPriority = await prisma.ticket.count({
            where:{
                priority: "HIGH",
                isDeleted: false
            }
        })
        const mediumPriority = await prisma.ticket.count({
            where:{
                priority: "MEDIUM",
                isDeleted: false
            }
        })
        const lowPriority = await prisma.ticket.count({
            where:{
                priority: "LOW",
                isDeleted: false
            }
        })

        let assignedToMe = 0;

        if(req.user.role === "AGENT"){
            assignedToMe = await prisma.ticket.count({
                where:{
                    assignedToId: req.user.id,
                    isDeleted: false
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