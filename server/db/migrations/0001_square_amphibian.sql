CREATE TABLE "professionals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"categoria_slug" text NOT NULL,
	"comuna_codigo" text NOT NULL,
	"contact" text NOT NULL,
	"description" text,
	"price_from" integer,
	"photo_paths" text[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professionals_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_categoria_slug_categorias_slug_fk" FOREIGN KEY ("categoria_slug") REFERENCES "public"."categorias"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_comuna_codigo_comunas_codigo_fk" FOREIGN KEY ("comuna_codigo") REFERENCES "public"."comunas"("codigo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "professionals_categoria_slug_idx" ON "professionals" USING btree ("categoria_slug");--> statement-breakpoint
CREATE INDEX "professionals_comuna_codigo_idx" ON "professionals" USING btree ("comuna_codigo");