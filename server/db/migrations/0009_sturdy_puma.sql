CREATE TABLE "professional_categorias" (
	"professional_id" uuid NOT NULL,
	"categoria_slug" text NOT NULL,
	"price_from" integer,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_categorias_professional_id_categoria_slug_pk" PRIMARY KEY("professional_id","categoria_slug")
);
--> statement-breakpoint
ALTER TABLE "professional_categorias" ADD CONSTRAINT "professional_categorias_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_categorias" ADD CONSTRAINT "professional_categorias_categoria_slug_categorias_slug_fk" FOREIGN KEY ("categoria_slug") REFERENCES "public"."categorias"("slug") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "professional_categorias_categoria_slug_idx" ON "professional_categorias" USING btree ("categoria_slug");--> statement-breakpoint
-- Backfill: cada profesional existente conserva su categoría/precio/descripción actuales como su
-- primera categoría declarada. created_at se copia de professionals (no now()) para que el orden
-- de "primera categoría" siga reflejando cuándo se registró, no cuándo corrió esta migración.
INSERT INTO "professional_categorias" ("professional_id", "categoria_slug", "price_from", "description", "created_at")
SELECT "id", "categoria_slug", "price_from", "description", "created_at"
FROM "professionals";