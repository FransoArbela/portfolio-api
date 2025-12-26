"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const db_1 = require("./db");
const logger_1 = require("./logger");
const projects_routes_1 = __importDefault(require("./projects/projects.routes"));
const app = (0, express_1.default)();
app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
/* security & parsers */
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
/* ✅ CORS MUST BE HERE */
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
// app.options("/*", cors());
/* rate limiting */
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
}));
/* health */
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
/* public */
app.get("/projects", async (_req, res) => {
    const projects = await db_1.prisma.project.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
    });
    res.json(projects);
});
/* auth + admin */
app.use("/auth", auth_routes_1.default);
app.use("/admin/projects", projects_routes_1.default);
exports.default = app;
