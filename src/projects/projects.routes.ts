import { Router } from "express";
import { requireAdmin } from "../auth/auth.middleware";
import { prisma } from "../db";

const router = Router();

// Get ALL projects (including drafts)
router.get("/", requireAdmin, async (_req, res) => {
	const projects = await prisma.project.findMany({
		orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
	});
	res.json(projects);
});

// Create
router.post("/", requireAdmin, async (req, res) => {
	const created = await prisma.project.create({
		data: req.body,
	});
	res.status(201).json(created);
});

// Update
router.put("/:id", requireAdmin, async (req, res) => {
	const updated = await prisma.project.update({
		where: { id: req.params.id },
		data: req.body,
	});
	res.json(updated);
});

// Delete
router.delete("/:id", requireAdmin, async (req, res) => {
	await prisma.project.delete({ where: { id: req.params.id } });
	res.status(204).send();
});

export default router;