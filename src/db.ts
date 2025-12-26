import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const base = new PrismaClient();

const CRUD_ACTIONS = new Set<Prisma.PrismaAction>([
	"create",
	"createMany",
	"update",
	"updateMany",
	"upsert",
	"delete",
	"deleteMany",
]);

export const prisma = base.$extends({
	query: {
		$allModels: {
			async $allOperations({ operation, model, args, query }) {
				const start = Date.now();
				const result = await query(args);
				const ms = Date.now() - start;

				if (CRUD_ACTIONS.has(operation as Prisma.PrismaAction)) {
					console.log(
						`[CRUD] ${model}.${operation} (${ms}ms) args=${JSON.stringify(args)}`,
					);
				}

				return result;
			},
		},
	},
});
