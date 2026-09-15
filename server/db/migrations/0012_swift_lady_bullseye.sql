ALTER TABLE "professionals" DROP CONSTRAINT "professionals_comuna_codigo_comunas_codigo_fk";
--> statement-breakpoint
DROP INDEX "professionals_comuna_codigo_idx";--> statement-breakpoint
ALTER TABLE "professionals" DROP COLUMN "comuna_codigo";