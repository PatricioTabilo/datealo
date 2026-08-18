CREATE TABLE "categorias" (
	"slug" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"activa" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comunas" (
	"codigo" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"activa" boolean DEFAULT false NOT NULL
);
