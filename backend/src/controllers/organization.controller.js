import { prisma } from "../db/client.js";
import { ApiResponse } from "../utils/response.js";

const resolveOrganizationId = (req) => {
    if (req.user.role === "SUPER_ADMIN") {
        return req.query.organizationId || null;
    }
    return req.user.organizationId || null;
};

export const getOrganizationsController = async (req, res, next) => {
    try {
        const organizations = await prisma.organization.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        tickets: {
                            where: { isDeleted: false }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format the output
        const formattedOrgs = organizations.map(org => ({
            id: org.id,
            name: org.name,
            createdAt: org.createdAt,
            userCount: org._count.users,
            ticketCount: org._count.tickets,
        }));

        return ApiResponse.success(res, 200, "Organizations fetched successfully", formattedOrgs);
    } catch (error) {
        return next(error);
    }
};

export const getOrganizationSlaController = async (req, res, next) => {
    try {
        const organizationId = resolveOrganizationId(req);
        if (!organizationId) {
            return ApiResponse.error(res, 400, "organizationId is required");
        }

        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                name: true,
                slaLowHours: true,
                slaMediumHours: true,
                slaHighHours: true,
            }
        });

        if (!organization) {
            return ApiResponse.error(res, 404, "Organization not found");
        }

        return ApiResponse.success(res, 200, "SLA settings fetched successfully", organization);
    } catch (error) {
        return next(error);
    }
};

export const updateOrganizationSlaController = async (req, res, next) => {
    try {
        const organizationId = resolveOrganizationId(req);
        if (!organizationId) {
            return ApiResponse.error(res, 400, "organizationId is required");
        }

        const { slaLowHours, slaMediumHours, slaHighHours } = req.body;
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { id: true }
        });

        if (!organization) {
            return ApiResponse.error(res, 404, "Organization not found");
        }

        const updated = await prisma.organization.update({
            where: { id: organizationId },
            data: { slaLowHours, slaMediumHours, slaHighHours },
            select: {
                id: true,
                name: true,
                slaLowHours: true,
                slaMediumHours: true,
                slaHighHours: true,
            }
        });

        return ApiResponse.success(res, 200, "SLA settings updated successfully", updated);
    } catch (error) {
        return next(error);
    }
};

export const deleteOrganizationController = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if organization exists
        const org = await prisma.organization.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        tickets: {
                            where: { isDeleted: false }
                        }
                    }
                }
            }
        });

        if (!org) {
            return ApiResponse.error(res, 404, "Organization not found");
        }

        // Only allow deletion if there are no users/tickets or specifically handle cascade
        // For safety, let's just Soft Delete or prevent if not empty
        
        // Actually, for a super admin, we might want to hard delete everything if we delete an org.
        // Prisma schema doesn't have onDelete: Cascade right now, so we need to delete manually in a transaction
        // or just return an error if it's not empty. Let's return an error for now to be safe.
        
        if (org._count?.users > 0 || org._count?.tickets > 0) {
            return ApiResponse.error(res, 400, "Cannot delete organization with active users or tickets. Please remove them first.");
        }

        // Just delete the org if empty
        await prisma.organization.delete({
            where: { id }
        });

        return ApiResponse.success(res, 200, "Organization deleted successfully");
    } catch (error) {
        // If foreign key constraint fails, it will be caught here
        return next(error);
    }
};
