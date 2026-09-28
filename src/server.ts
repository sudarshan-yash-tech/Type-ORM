import "reflect-metadata";
import { createApp } from "./app.js";
import { appDataSource } from "./database/data-source.js";

const port = Number(
    process.env.PORT ?? 3000,
);

async function bootstrap(): Promise<void> {
    try {
        await appDataSource.initialize();

        console.log(
            "Database connection initialized",
        );

        const app = createApp();

        app.listen(port, () => {
            console.log(
                `API running on port ${port}`,
            );
        });
    } catch (error) {
        console.error(
            "Application startup failed",
            error,
        );

        process.exit(1);
    }
}

void bootstrap();

async function shutdown(
    signal: string,
): Promise<void> {
    console.log(
        `${signal} received. Shutting down.`,
    );

    if (appDataSource.isInitialized) {
        await appDataSource.destroy();
    }

    process.exit(0);
}

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});