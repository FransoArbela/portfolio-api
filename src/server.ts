import "dotenv/config";
import app from "./app";
import { logger } from "./logger";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
	logger.info(`API running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: Error) => {
	logger.error(reason, "Unhandled Rejection");
	server.close(() => {
		process.exit(1);
	});
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
	logger.error(error, "Uncaught Exception");
	server.close(() => {
		process.exit(1);
	});
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
	logger.info("SIGTERM signal received: closing HTTP server");
	server.close(() => {
		logger.info("HTTP server closed");
	});
});

process.on("SIGINT", () => {
	logger.info("SIGINT signal received: closing HTTP server");
	server.close(() => {
		logger.info("HTTP server closed");
	});
});
