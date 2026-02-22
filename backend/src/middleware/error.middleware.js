import { z } from "zod";
import pkg from '@prisma/client';
const { Prisma } = pkg;
import { CustomError } from "../utils/error.js";
import { ApiResponse } from "../utils/response.js";

export const errorMiddleware = (err, req, res, next) => {
    if (err instanceof z.ZodError) {
        const errorMessages = err.issues.map(issue => issue.message).join(", ");
        return ApiResponse.error(res, 400, "Validation Error", errorMessages);
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                return ApiResponse.error(
                    res, 
                    409, 
                    `Duplicate field: ${err.meta?.target}`
                );

            case "P2025":
                return ApiResponse.error(res, 404, "User Not Found");

            case "P2003":
                return ApiResponse.error(res, 400, "Invalid Input");

            default:
                return ApiResponse.error(res, 400, err.message);
        }
    }

    if (err instanceof CustomError) {
        return ApiResponse.error(
            res, 
            err.statusCode || 403, 
            err.message || "Forbidden"
        );
    }

    console.error(err);
    return ApiResponse.error(
        res, 
        500, 
        err.message || "Something went wrong"
    );
};
