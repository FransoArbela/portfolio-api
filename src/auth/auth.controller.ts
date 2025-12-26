import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
	const { email, password } = req.body;

	if (email !== process.env.ADMIN_EMAIL) {
		return res.status(401).json({ message: "Invalid credentials" });
	}

	const valid = await bcrypt.compare(
		password,
		await bcrypt.hash(process.env.ADMIN_PASSWORD || "", 10),
	);
	if (!valid) {
		return res.status(401).json({ message: "Invalid credentials" });
	}

	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		return res.status(500).json({ message: "Server configuration error" });
	}

	const token = jwt.sign({ role: "admin" }, jwtSecret, {
		expiresIn: "1d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: false,
	});

	return res.json({ ok: true });
}

export function me(req: Request, res: Response) {
	const token = req.cookies.token;
	if (!token) return res.status(401).json({ ok: false });

	const secret = process.env.JWT_SECRET;
	if (!secret) return res.status(500).json({ ok: false });

	try {
		jwt.verify(token, secret);
		return res.json({ ok: true, role: "admin" });
	} catch {
		return res.status(401).json({ ok: false });
	}
}

export function logout(_req: Request, res: Response) {
	res.clearCookie("token");
	return res.json({ ok: true });
}