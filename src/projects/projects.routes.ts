import { Router } from "express";
import { requireAdmin } from "../auth/auth.middleware";
import { prisma } from "../db";
import { NotFoundError, ValidationError } from "../errors/AppError";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Get ALL projects (including drafts)
router.get(
	"/",
	requireAdmin,
	asyncHandler(async (_req, res) => {
		const projects = await prisma.project.findMany({
			orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
		});
		res.json(projects);
	}),
);

// Create
router.post(
	"/",
	requireAdmin,
	asyncHandler(async (req, res) => {
		if (!req.body.title) {
			throw new ValidationError("Title is required");
		}

		const created = await prisma.project.create({
			data: req.body,
		});
		res.status(201).json(created);
	}),
);

// Update
router.put(
	"/:id",
	requireAdmin,
	asyncHandler(async (req, res) => {
		const project = await prisma.project.findUnique({
			where: { id: req.params.id },
		});

		if (!project) {
			throw new NotFoundError("Project not found");
		}

		const updated = await prisma.project.update({
			where: { id: req.params.id },
			data: req.body,
		});
		res.json(updated);
	}),
);

// Delete
router.delete(
	"/:id",
	requireAdmin,
	asyncHandler(async (req, res) => {
		const project = await prisma.project.findUnique({
			where: { id: req.params.id },
		});

		if (!project) {
			throw new NotFoundError("Project not found");
		}

		await prisma.project.delete({ where: { id: req.params.id } });
		res.status(204).send();
	}),
);

export default router;
