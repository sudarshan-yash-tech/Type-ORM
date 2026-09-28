import express, { type ErrorRequestHandler } from "express";
import "reflect-metadata";
import userRoutes from "./routes/user.routes.js";
import { ApiError } from "./utils/api-error.js";
import { AppError } from "./common/errors/AppError.js";
import { createApiRouter } from "./routes/index.routes.js";


export function createApp(): Express {
    const app = express();

    app.use(express.json());

    app.use(
        "/api",
        createApiRouter(),
    );

    const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
        const handledError = error instanceof ApiError || error instanceof AppError
            ? error
            : null;

        if (!handledError) console.error(error);

        res.status(handledError?.statusCode ?? 500).json({
            success: false,
            ...(handledError instanceof AppError
                ? {
                    error: {
                        code: handledError.code,
                        message: handledError.message,
                        details: handledError.details,
                    },
                }
                : {
                    message: handledError?.message ?? "Internal server error",
                    details: handledError?.details,
                }),
        });
    };

    app.use(errorHandler);

    return app;
}