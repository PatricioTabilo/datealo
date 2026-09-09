CREATE TABLE "professional_comunas" (
	"professional_id" uuid NOT NULL,
	"comuna_codigo" text NOT NULL,
	CONSTRAINT "professional_comunas_professional_id_comuna_codigo_pk" PRIMARY KEY("professional_id","comuna_codigo")
);
--> statement-breakpoint
ALTER TABLE "professional_comunas" ADD CONSTRAINT "professional_comunas_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_comunas" ADD CONSTRAINT "professional_comunas_comuna_codigo_comunas_codigo_fk" FOREIGN KEY ("comuna_codigo") REFERENCES "public"."comunas"("codigo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "professional_comunas_comuna_codigo_idx" ON "professional_comunas" USING btree ("comuna_codigo");--> statement-breakpoint
-- Backfill idempotente (ON CONFLICT DO NOTHING): cada profesional existente conserva su comuna actual
-- como su única comuna declarada. Se vuelve a correr, sin cambios, al desplegar S-002 — cierra la
-- ventana entre que esta migración se aplica y S-002 empieza a escribir en la misma transacción.
INSERT INTO "professional_comunas" ("professional_id", "comuna_codigo")
SELECT "id", "comuna_codigo"
FROM "professionals"
ON CONFLICT DO NOTHING;