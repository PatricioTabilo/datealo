CREATE TABLE "comuna_vecinas" (
	"comuna_codigo" text NOT NULL,
	"vecina_codigo" text NOT NULL,
	CONSTRAINT "comuna_vecinas_comuna_codigo_vecina_codigo_pk" PRIMARY KEY("comuna_codigo","vecina_codigo")
);
--> statement-breakpoint
ALTER TABLE "comuna_vecinas" ADD CONSTRAINT "comuna_vecinas_comuna_codigo_comunas_codigo_fk" FOREIGN KEY ("comuna_codigo") REFERENCES "public"."comunas"("codigo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comuna_vecinas" ADD CONSTRAINT "comuna_vecinas_vecina_codigo_comunas_codigo_fk" FOREIGN KEY ("vecina_codigo") REFERENCES "public"."comunas"("codigo") ON DELETE no action ON UPDATE no action;