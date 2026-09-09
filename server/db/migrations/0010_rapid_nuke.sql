ALTER TABLE "professionals" DROP CONSTRAINT "professionals_categoria_slug_categorias_slug_fk";
--> statement-breakpoint
DROP INDEX "professionals_categoria_slug_idx";--> statement-breakpoint
ALTER TABLE "professionals" DROP COLUMN "categoria_slug";--> statement-breakpoint
ALTER TABLE "professionals" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "professionals" DROP COLUMN "price_from";