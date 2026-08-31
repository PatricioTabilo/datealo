CREATE TABLE "professional_contact_tokens" (
	"professional_id" uuid NOT NULL,
	"token" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_contact_tokens_professional_id_token_pk" PRIMARY KEY("professional_id","token")
);
--> statement-breakpoint
ALTER TABLE "professional_contact_tokens" ADD CONSTRAINT "professional_contact_tokens_professional_id_professionals_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professionals"("id") ON DELETE restrict ON UPDATE no action;