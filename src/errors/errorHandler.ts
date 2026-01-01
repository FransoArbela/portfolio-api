import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import { AppError } from "./AppError";

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	// Log the error
	logger.error(err);

	// Handle operational errors (known errors)
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			error: err.message,
			...(process.env.NODE_ENV === "development" && { stack: err.stack }),
		});
	}

	// Handle Prisma errors
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		return handlePrismaError(err, res);
	}

	if (err instanceof Prisma.PrismaClientValidationError) {
		return res.status(400).json({
			error: "Invalid data provided",
			...(process.env.NODE_ENV === "development" && { details: err.message }),
		});
	}

	// Handle JWT errors
	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({ error: "Invalid token" });
	}

	if (err.name === "TokenExpiredError") {
		return res.status(401).json({ error: "Token expired" });
	}

	// Handle validation errors from express-validator or similar
	if (err.name === "ValidationError") {
		return res.status(400).json({ error: err.message });
	}

	// Handle unknown errors (programming or unexpected errors)
	return res.status(500).json({
		error: "Internal server error",
		...(process.env.NODE_ENV === "development" && {
			message: err.message,
			stack: err.stack,
		}),
	});
}

function handlePrismaError(
	err: Prisma.PrismaClientKnownRequestError,
	res: Response,
) {
	switch (err.code) {
		case "P2002":
			return res.status(409).json({
				error: "A record with this value already exists",
				field: err.meta?.target,
			});
		case "P2025":
			return res.status(404).json({
				error: "Record not found",
			});
		case "P2003":
			return res.status(400).json({
				error: "Invalid reference to related record",
			});
		case "P2014":
			return res.status(400).json({
				error: "Invalid relation data",
			});
		default:
			return res.status(400).json({
				error: "Database operation failed",
				...(process.env.NODE_ENV === "development" && { code: err.code }),
			});
	}
}

// Handle 404 errors for undefined routes
export function notFoundHandler(_req: Request, res: Response) {
	res.status(404).json({ error: "Route not found" });
}
