ALTER TABLE "professionals" DROP CONSTRAINT "professionals_categoria_slug_categorias_slug_fk";
--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_categoria_slug_categorias_slug_fk" FOREIGN KEY ("categoria_slug") REFERENCES "public"."categorias"("slug") ON DELETE no action ON UPDATE cascade;