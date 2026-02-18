import { z } from "zod";
import { Prisma } from "@prisma/client";
import { CustomError } from "../utils/error.js";

export const errorMiddleware = (err, req, res, next) => {
    if (err instanceof z.ZodError) {
        const errorMessages = err.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ error: errorMessages });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                return res.status(409).json({
                    error: `Duplicate field: ${err.meta?.target}`
                });

            case "P2025":
                return res.status(404).json({ error: "User Not Found" });

            case "P2003":
                return res.status(400).json({ error: "Invalid Input" });

            default:
                return res.status(400).json({ error: err.message });
        }
    }

    if (err instanceof CustomError) {
        return res.status(err.statusCode || 403).json({
            error: err.message || "Forbidden",
        });
    }

    console.error(err);
    return res.status(500).json({
        error: err.message || "Something went wrong",
    });
};
