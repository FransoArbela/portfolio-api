"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Get ALL projects (including drafts)
router.get("/", auth_middleware_1.requireAdmin, async (_req, res) => {
    const projects = await db_1.prisma.project.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json(projects);
});
// Create
router.post("/", auth_middleware_1.requireAdmin, async (req, res) => {
    const created = await db_1.prisma.project.create({
        data: req.body,
    });
    res.status(201).json(created);
});
// Update
router.put("/:id", auth_middleware_1.requireAdmin, async (req, res) => {
    const updated = await db_1.prisma.project.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(updated);
});
// Delete
router.delete("/:id", auth_middleware_1.requireAdmin, async (req, res) => {
    await db_1.prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
});
exports.default = router;
