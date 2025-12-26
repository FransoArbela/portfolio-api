import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		return res.status(500).json({ message: "Server configuration error" });
	}

	try {
		jwt.verify(token, secret);
		next();
	} catch {
		return res.status(401).json({ message: "Unauthorized" });
	}
}
