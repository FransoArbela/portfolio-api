"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const base = new client_1.PrismaClient();
const CRUD_ACTIONS = new Set([
    "create",
    "createMany",
    "update",
    "updateMany",
    "upsert",
    "delete",
    "deleteMany",
]);
exports.prisma = base.$extends({
    query: {
        $allModels: {
            async $allOperations({ operation, model, args, query }) {
                const start = Date.now();
                const result = await query(args);
                const ms = Date.now() - start;
                if (CRUD_ACTIONS.has(operation)) {
                    console.log(`[CRUD] ${model}.${operation} (${ms}ms) args=${JSON.stringify(args)}`);
                }
                return result;
            },
        },
    },
});
